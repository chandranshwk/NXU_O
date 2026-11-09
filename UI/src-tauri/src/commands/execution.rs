use std::fs;
use std::process::{Command, Stdio};
use std::collections::HashMap;
use std::io::Write;
use crate::{get_store_path, get_temp_path};

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
pub struct LanguageConfig {
    pub name: String,
    pub slug: String,
    pub extension: String,
    #[serde(rename = "commentPrefix")]
    pub comment_prefix: String,
    #[serde(rename = "compileCmd")]
    pub compile_cmd: Option<Vec<String>>,
    #[serde(rename = "runCmd")]
    pub run_cmd: Vec<String>,
    #[serde(rename = "isCustom", default)]
    pub is_custom: bool,
}

#[derive(serde::Serialize)]
pub struct ExecutionResult {
    pub stdout: String,
    pub stderr: String,
    pub success: bool,
}

#[tauri::command]
pub fn get_available_languages() -> Result<HashMap<String, LanguageConfig>, String> {
    let path = get_store_path()?.join("languages.json");
    if !path.exists() {
        return Err("languages.json not found in store directory".to_string());
    }
    let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
    let map: HashMap<String, LanguageConfig> = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(map)
}

#[tauri::command]
pub fn execute_code(
    language_slug: String, 
    code: String, 
    file_id: String,
    stdin_input: String
) -> Result<ExecutionResult, String> {
    let temp_dir = get_temp_path()?;
    let lang_map = get_available_languages()?;
    
    let config = lang_map.get(&language_slug)
        .ok_or_else(|| format!("Language '{}' not configured in languages.json", language_slug))?;

    let filename = if config.slug == "java" {
        format!("Solution.{}", config.extension)
    } else {
        format!("run_{}.{}", file_id, config.extension)
    };
    let file_path = temp_dir.join(&filename);
    let exe_path = temp_dir.join(format!("run_{}.exe", file_id));

    fs::write(&file_path, &code).map_err(|e| e.to_string())?;

    let file_str = file_path.to_string_lossy().to_string();
    let dir_str = temp_dir.to_string_lossy().to_string();
    let exe_str = exe_path.to_string_lossy().to_string();

    let replace_vars = |cmd: &Vec<String>| -> Vec<String> {
        cmd.iter().map(|arg| {
            arg.replace("{file}", &file_str)
               .replace("{dir}", &dir_str)
               .replace("{exePath}", &exe_str)
        }).collect()
    };

    // 1. Compile
    if let Some(compile_cmd) = &config.compile_cmd {
        let args = replace_vars(compile_cmd);
        let compile_output = Command::new(&args[0]).args(&args[1..]).output();

        match compile_output {
            Ok(out) if !out.status.success() => {
                let _ = fs::remove_file(&file_path);
                return Ok(ExecutionResult {
                    stdout: String::from_utf8_lossy(&out.stdout).to_string(),
                    stderr: String::from_utf8_lossy(&out.stderr).to_string(),
                    success: false,
                });
            },
            Err(e) => return Err(format!("Compiler failed to start: {}", e)),
            _ => {}
        }
    }

    // 2. Run with injected stdin
    let run_args = replace_vars(&config.run_cmd);
    
    let mut child = Command::new(&run_args[0])
        .args(&run_args[1..])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start process: {}", e))?;

    if let Some(mut stdin) = child.stdin.take() {
        let _ = stdin.write_all(format!("{}\n", stdin_input).as_bytes());
    }

    let run_output = child.wait_with_output();

    // Cleanup
    let _ = fs::remove_file(&file_path);
    let _ = fs::remove_file(&exe_path);
    let _ = fs::remove_file(temp_dir.join("Solution.class"));

    match run_output {
        Ok(out) => Ok(ExecutionResult {
            stdout: String::from_utf8_lossy(&out.stdout).to_string(),
            stderr: String::from_utf8_lossy(&out.stderr).to_string(),
            success: out.status.success(),
        }),
        Err(e) => Err(format!("Failed to execute process: {}", e)),
    }
}

#[tauri::command]
pub fn get_installed_languages() -> Result<Vec<String>, String> {
    let lang_map = get_available_languages()?;
    let mut installed = Vec::new();

    for (slug, config) in lang_map {
        // Determine which executable to test.
        // Usually it's the compiler (compileCmd) or the interpreter (runCmd)
        let exe_to_test = if let Some(compile_cmd) = &config.compile_cmd {
            &compile_cmd[0]
        } else {
            &config.run_cmd[0]
        };

        // Try running `exe --version` or `exe -v`
        // If the command spawns successfully (even if it returns a non-zero exit code), it means the executable exists in the PATH.
        let is_installed = Command::new(exe_to_test)
            .arg("--version")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .is_ok() 
            || Command::new(exe_to_test)
            .arg("-v")
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .status()
            .is_ok();

        if is_installed {
            installed.push(slug);
        }
    }

    Ok(installed)
}