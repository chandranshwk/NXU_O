use std::fs;
use crate::get_notebooks_path;

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