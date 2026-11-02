use std::fs;
use crate::{get_codes_path, get_external_codes_path};

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