use std::env;
use std::fs;
use std::path::PathBuf;

fn get_store_path() -> Result<PathBuf, String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    exe_path.pop(); 
    exe_path.push("store");
    
    // Automatically create the folder if it does not exist
    fs::create_dir_all(&exe_path).map_err(|e| e.to_string())?;
    Ok(exe_path)
}


fn get_pages_path() -> Result<PathBuf, String> {
    let mut pages_path = get_store_path()?;
    pages_path.push("pages");
    
    // Automatically create the subfolder if it does not exist
    fs::create_dir_all(&pages_path).map_err(|e| e.to_string())?;
    Ok(pages_path)
}

#[tauri::command]
fn save_portable_settings(filename: String, contents: String) -> Result<(), String> {
    let mut target_path = get_store_path()?;
    fs::create_dir_all(&target_path).map_err(|e| e.to_string())?;
    target_path.push(filename);
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_portable_settings(filename: String) -> Result<serde_json::Value, String> {
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
fn save_info(filename: String, contents: String) -> Result<(), String> {
    let mut target_path = get_pages_path()?;
    target_path.push(filename);
    
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_info(filename: String) -> Result<String, String> {
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
fn get_pages_files() -> Result<Vec<String>, String> {
    let pages_path = get_pages_path()?;
    let entries = fs::read_dir(pages_path).map_err(|e| e.to_string())?;

    let files: Vec<String> = entries
        .filter_map(|entry| entry.ok()) 
        .filter(|entry| {
            if !entry.path().is_file() {
                return false;
            }
            entry.path()
                .extension()
                .map(|ext| ext == "md")
                .unwrap_or(false)
        })
        .filter_map(|entry| {
            entry.path()
                .file_stem() 
                .map(|os_str| os_str.to_string_lossy().into_owned()) 
        })
        .collect(); 

    Ok(files)
}

#[tauri::command]
fn rename_file(old_filename: String, new_filename: String) -> Result<(), String> {
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

    // 5. Execute the OS rename operation
    fs::rename(old_path, new_path).map_err(|e| e.to_string())?;

    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_portable_settings,  
            load_portable_settings,
            load_info,
            save_info,
            get_pages_files,
            rename_file, 
            ])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
