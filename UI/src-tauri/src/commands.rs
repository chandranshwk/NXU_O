use std::fs;
use serde_json::Value;

// Reuse your core path helper utils from the main module
use crate::{get_store_path, get_pages_path};

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
