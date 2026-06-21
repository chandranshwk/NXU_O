use std::env;
use std::fs;

#[tauri::command]
fn save_portable_settings(filename: String, contents: String) -> Result<(), String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    
    exe_path.pop(); 
    let mut target_path = exe_path;
    target_path.push("store");
    
    fs::create_dir_all(&target_path).map_err(|e| e.to_string())?;
    
    target_path.push(filename);
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_info(filename: String, contents: String) -> Result<(), String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    exe_path.pop();
    let mut target_path = exe_path;

    // 1. Build the path to your storage folder
    target_path.push("store");
    
    // 2. Ensure the "store" folder exists
    fs::create_dir_all(&target_path).map_err(|e| e.to_string())?;

    // 3. Append the filename and write the updated contents
    target_path.push(filename);
    
    // fs::write automatically overwrites the existing file with the new content
    fs::write(target_path, contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_portable_settings(filename: String) -> Result<serde_json::Value, String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    exe_path.pop();
    let mut target_path = exe_path;

    target_path.push("store");
    target_path.push(filename);

    let file_contents = fs::read_to_string(target_path).map_err(|e| e.to_string())?;
    let json_object: serde_json::Value = serde_json::from_str(&file_contents).map_err(|e| e.to_string())?;

    Ok(json_object)
}

#[tauri::command]
fn load_info(filename: String) -> Result<String, String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    exe_path.pop();
    let mut target_path = exe_path;

    target_path.push("store");
    
    fs::create_dir_all(&target_path).map_err(|e| e.to_string())?;

    target_path.push(filename);

    if !target_path.exists() {
        fs::write(&target_path, "").map_err(|e| e.to_string())?;
        return Ok("".to_string());
    }

    let file_contents = fs::read_to_string(target_path).map_err(|e| e.to_string())?;
    
    Ok(file_contents)
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_portable_settings,  
            load_portable_settings,
            load_info,
            save_info,
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
