use std::fs;
use std::path::{Path, PathBuf};
use crate::get_store_path;

// Helper function to recursively copy directories
fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

#[tauri::command]
pub fn save_portable_settings(filename: String, contents: String) -> Result<(), String> {
    let mut target_path = get_store_path()?;
    target_path.push(&filename);

    let store_root = get_store_path()?;

    // 1. Read CURRENT settings to find old path
    let mut old_root = store_root.clone();
    if target_path.exists() {
        if let Ok(old_content) = fs::read_to_string(&target_path) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&old_content) {
                if let Some(folder) = json.get("defaultSavingFolder").and_then(|v| v.as_str()) {
                    if !folder.trim().is_empty() {
                        old_root = PathBuf::from(folder);
                    }
                }
            }
        }
    }

    // 2. Read NEW settings payload to find new path
    let mut new_root = store_root.clone();
    if let Ok(new_json) = serde_json::from_str::<serde_json::Value>(&contents) {
        if let Some(folder) = new_json.get("defaultSavingFolder").and_then(|v| v.as_str()) {
            if !folder.trim().is_empty() {
                new_root = PathBuf::from(folder);
            }
        }
    }

    // 3. Migrate data
    if old_root != new_root {
        // Only migrating notebooks, pages, and actual code files.
        let folders_to_migrate = ["notebooks", "pages", "Code Files", "NXU_OCODES"];
        
        for folder in folders_to_migrate {
            let mut source_dir = old_root.join(folder);
            
            // Fallback for legacy NXU_OCODES folder name
            if folder == "Code Files" {
                if let Ok(old_legacy) = store_root.join("NXU_OCODES").canonicalize() {
                    if old_legacy.exists() && (!source_dir.exists() || !source_dir.is_dir()) {
                        source_dir = old_legacy;
                    }
                }
            }

            // Fallback to store root if old_root didn't actually have the files
            if !source_dir.exists() || !source_dir.is_dir() {
                let store_fallback = store_root.join(folder);
                if store_fallback.exists() && store_fallback.is_dir() {
                    source_dir = store_fallback;
                }
            }

            let new_dir = new_root.join(if folder == "NXU_OCODES" { "Code Files" } else { folder });
            
            if source_dir.exists() && source_dir.is_dir() {
                if let Err(e) = copy_dir_all(&source_dir, &new_dir) {
                    println!("Warning: Failed to migrate {}: {}", folder, e);
                }
            }
        }
    }

    // 4. Save new settings file
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