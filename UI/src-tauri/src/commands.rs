use std::fs;
use serde_json::Value;
use std::process::Command;
use std::collections::HashMap;
use crate::get_temp_path;

// Reuse your core path helper utils from the main module
use crate::{get_store_path, get_pages_path, get_notebooks_path, get_codes_path, get_external_codes_path};

#[tauri::command]
pub fn save_portable_settings(filename: String, contents: String) -> Result<(), String> {
    let mut target_path = get_store_path()?;
    fs::create_dir_all(&target_path).map_err(|e| e.to_string())?;
    target_path.push(filename);
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_portable_settings(filename: String) -> Result<serde_json::Value, String> {
    let mut target_path = get_store_path()?;
    target_path.push(filename);

    if !target_path.exists() {
        fs::write(&target_path, "{}").map_err(|e| e.to_string())?;
        return Ok(serde_json::Value::Object(serde_json::Map::new()));
    }

    let file_contents = fs::read_to_string(target_path).map_err(|e| e.to_string())?;
    let json_object: serde_json::Value = serde_json::from_str(&file_contents).map_err(|e| e.to_string())?;
    Ok(json_object)
}

#[tauri::command]
pub fn save_info(filename: String, contents: String) -> Result<(), String> {
    let mut target_path = get_pages_path()?;
    target_path.push(filename);
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_info(filename: String) -> Result<String, String> {
    let mut target_path = get_pages_path()?;
    target_path.push(filename);

    if !target_path.exists() {
        fs::write(&target_path, "").map_err(|e| e.to_string())?;
        return Ok("".to_string());
    }

    let file_contents = fs::read_to_string(target_path).map_err(|e| e.to_string())?;
    Ok(file_contents)
}

#[tauri::command]
pub fn get_pages_files() -> Result<Vec<String>, String> {
    let pages_path = get_pages_path()?;
    let entries = fs::read_dir(pages_path).map_err(|e| e.to_string())?;

    let files: Vec<String> = entries
        .filter_map(|entry| entry.ok()) 
        .filter(|entry| {
            if !entry.path().is_file() { return false; }
            entry.path().extension().map(|ext| ext == "md").unwrap_or(false)
        })
        .filter_map(|entry| {
            entry.path().file_stem().map(|os_str| os_str.to_string_lossy().into_owned()) 
        })
        .collect(); 

    Ok(files)
}

#[tauri::command]
pub fn rename_file(old_filename: String, new_filename: String) -> Result<(), String> {
    let pages_path = get_pages_path()?;
    let mut old_path = pages_path.clone();
    old_path.push(format!("{}.md", old_filename));

    let mut new_path = pages_path;
    new_path.push(format!("{}.md", new_filename));

    if !old_path.exists() {
        return Err(format!("File '{}' does not exist", old_filename));
    }
    if new_path.exists() {
        return Err(format!("A file named '{}' already exists", new_filename));
    }

    fs::rename(old_path, new_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_all_custom_themes() -> Result<serde_json::Value, String> {
    let mut lang_path = get_store_path()?;
    lang_path.push("Languages");
    fs::create_dir_all(&lang_path).map_err(|e| e.to_string())?;

    let entries = fs::read_dir(lang_path).map_err(|e| e.to_string())?;
    let mut themes_map = serde_json::Map::new();

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() {
            if let Some(filename) = path.file_name().and_then(|f| f.to_str()) {
                if filename.ends_with("-theme.json") {
                    let lang_key = filename.replace("-theme.json", "").to_lowercase();
                    if let Ok(file_contents) = fs::read_to_string(&path) {
                        if let Ok(json_value) = serde_json::from_str::<Value>(&file_contents) {
                            themes_map.insert(lang_key, json_value);
                        }
                    }
                }
            }
        }
    }

    Ok(serde_json::Value::Object(themes_map))
}

#[tauri::command]
pub fn save_notebook(notebook_id: String, contents: String) -> Result<(), String> {
    let mut target_path = get_notebooks_path()?;
    target_path.push(format!("{}.json", notebook_id));
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_all_notebooks() -> Result<Vec<String>, String> {
    let notebooks_path = get_notebooks_path()?;
    let entries = fs::read_dir(notebooks_path).map_err(|e| e.to_string())?;

    let mut notebooks = Vec::new();

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() && path.extension().map(|ext| ext == "json").unwrap_or(false) {
            if let Ok(contents) = fs::read_to_string(&path) {
                notebooks.push(contents);
            }
        }
    }

    Ok(notebooks)
}

#[tauri::command]
pub fn delete_notebook(notebook_id: String) -> Result<(), String> {
    let mut target_path = get_notebooks_path()?;
    target_path.push(format!("{}.json", notebook_id));
    
    if target_path.exists() {
        fs::remove_file(target_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn save_code_file(code_id: String, contents: String) -> Result<(), String> {
    let mut target_path = get_codes_path()?;
    target_path.push(format!("{}.json", code_id));
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn load_all_code_files() -> Result<Vec<String>, String> {
    let codes_path = get_codes_path()?;
    let entries = fs::read_dir(codes_path).map_err(|e| e.to_string())?;
    let mut codes = Vec::new();

    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_file() && path.extension().map(|ext| ext == "json").unwrap_or(false) {
            if let Ok(contents) = fs::read_to_string(&path) {
                codes.push(contents);
            }
        }
    }
    Ok(codes)
}

#[tauri::command]
pub fn delete_code_file(code_id: String) -> Result<(), String> {
    let mut target_path = get_codes_path()?;
    target_path.push(format!("{}.json", code_id));
    
    if target_path.exists() {
        fs::remove_file(target_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn update_code_file(code_id: String, new_contents: String) -> Result<(), String> {
    let mut target_path = get_codes_path()?;
    target_path.push(format!("{}.json", code_id));
    
    if !target_path.exists() {
        return Err(format!("Code file '{}' does not exist", code_id));
    }

    fs::write(target_path, new_contents).map_err(|e| e.to_string())
}

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
pub fn execute_code(language_slug: String, code: String, file_id: String) -> Result<ExecutionResult, String> {
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

    let run_args = replace_vars(&config.run_cmd);
    let run_output = Command::new(&run_args[0]).args(&run_args[1..]).output();

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

// 🔥 NEW COMMANDS: External Export & Delete
#[tauri::command]
pub fn export_raw_code(filename: String, contents: String) -> Result<(), String> {
    let target_path = get_external_codes_path()?;
    let file_path = target_path.join(filename);
    fs::write(file_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_raw_code(filename: String) -> Result<(), String> {
    let target_path = get_external_codes_path()?;
    let file_path = target_path.join(filename);
    
    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}