use std::fs;
use crate::get_store_path;

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