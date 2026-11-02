use std::fs;
use crate::get_pages_path;

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