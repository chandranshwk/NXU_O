use std::env;
use std::fs;
use std::path::PathBuf;
use serde::Serialize;

// REGISTER SUB-MODULES
mod commands;
mod seeder;

// 1. CORE STORE PATH (Settings, Languages, Temp, Code JSONs)
// This ALWAYS stays in the executable's folder so the app never loses its config.
pub fn get_store_path() -> Result<PathBuf, String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    exe_path.pop(); 
    exe_path.push("store");
    fs::create_dir_all(&exe_path).map_err(|e| e.to_string())?;
    Ok(exe_path)
}

// 2. DYNAMIC USER DATA ROOT (Pages, Notebooks, Exports)
// This moves to the custom folder if one is set in settings.json.
pub fn get_user_data_root() -> Result<PathBuf, String> {
    let store_path = get_store_path()?;
    let settings_path = store_path.join("settings.json");

    if settings_path.exists() {
        if let Ok(content) = fs::read_to_string(&settings_path) {
            if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                if let Some(folder) = json.get("defaultSavingFolder").and_then(|v| v.as_str()) {
                    if !folder.trim().is_empty() {
                        let folder_path = PathBuf::from(folder);
                        
                        // Force create the custom directory if it doesn't exist.
                        // If we don't have permission to write there, fallback to store.
                        if fs::create_dir_all(&folder_path).is_ok() {
                            return Ok(folder_path);
                        }
                    }
                }
            }
        }
    }
    // Fallback to the store directory if no valid custom folder is set
    Ok(store_path)
}

// 3. DYNAMIC PATHS
pub fn get_pages_path() -> Result<PathBuf, String> {
    let mut pages_path = get_user_data_root()?;
    pages_path.push("pages");
    fs::create_dir_all(&pages_path).map_err(|e| e.to_string())?;
    Ok(pages_path)
}

pub fn get_notebooks_path() -> Result<PathBuf, String> {
    let mut notebooks_path = get_user_data_root()?;
    notebooks_path.push("notebooks");
    fs::create_dir_all(&notebooks_path).map_err(|e| e.to_string())?;
    Ok(notebooks_path)
}

// 4. STATIC PATHS
pub fn get_codes_path() -> Result<PathBuf, String> {
    let mut codes_path = get_store_path()?;
    codes_path.push("code");
    fs::create_dir_all(&codes_path).map_err(|e| e.to_string())?;
    Ok(codes_path)
}

pub fn get_temp_path() -> Result<PathBuf, String> {
    let mut temp_path = get_store_path()?;
    temp_path.push("temp");
    fs::create_dir_all(&temp_path).map_err(|e| e.to_string())?;
    Ok(temp_path)
}

pub fn get_external_codes_path() -> Result<PathBuf, String> {
    let mut root_path = get_user_data_root()?;
    root_path.push("Code Files");
    fs::create_dir_all(&root_path).map_err(|e| e.to_string())?;
    Ok(root_path)
}

// ==========================================
// COMMANDS
// ==========================================
#[derive(Serialize)]
pub struct DirEntry {
    name: String,
    path: String,
    is_dir: bool,
}

#[tauri::command]
fn read_directory(path: Option<String>) -> Result<Vec<DirEntry>, String> {
    let target_path = match path {
        Some(p) if !p.is_empty() => PathBuf::from(p),
        _ => {
            let exe_path = env::current_exe().map_err(|e| e.to_string())?;
            exe_path.ancestors().last().unwrap_or(&exe_path).to_path_buf()
        }
    };

    let mut entries = Vec::new();
    
    if let Ok(read_dir) = fs::read_dir(&target_path) {
        for entry in read_dir.filter_map(|e| e.ok()) {
            let is_dir = entry.file_type().map(|t| t.is_dir()).unwrap_or(false);
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with('.') { continue; }
            
            entries.push(DirEntry {
                name,
                path: entry.path().to_string_lossy().to_string(),
                is_dir,
            });
        }
    }

    entries.sort_by(|a, b| {
        if a.is_dir == b.is_dir {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        } else if a.is_dir {
            std::cmp::Ordering::Less
        } else {
            std::cmp::Ordering::Greater
        }
    });

    Ok(entries)
}

#[tauri::command]
fn create_directory(path: String, name: String) -> Result<(), String> {
    let parent_path = if path.trim().is_empty() {
        let exe_path = env::current_exe().map_err(|e| e.to_string())?;
        exe_path.ancestors().last().unwrap_or(&exe_path).to_path_buf()
    } else {
        PathBuf::from(path)
    };

    let target = parent_path.join(&name);
    if target.exists() {
        return Err(format!("Folder '{}' already exists", name));
    }
    
    fs::create_dir_all(&target).map_err(|e| format!("Permission denied or invalid name: {}", e))
}

#[tauri::command]
fn save_custom_language(slug: String, config: serde_json::Value) -> Result<(), String> {
    let path = get_store_path()?.join("languages.json");
    let content = fs::read_to_string(&path).map_err(|e| e.to_string())?;
    
    let mut map: serde_json::Value = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    if let Some(obj) = map.as_object_mut() {
        obj.insert(slug, config);
    }

    let pretty = serde_json::to_string_pretty(&map).map_err(|e| e.to_string())?;
    fs::write(path, pretty).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::save_portable_settings,  
            commands::load_portable_settings,
            commands::load_info,
            commands::save_info,
            commands::get_pages_files,
            commands::rename_file, 
            commands::load_all_custom_themes,
            commands::save_notebook,
            commands::load_all_notebooks,
            commands::delete_notebook,
            commands::save_code_file,
            commands::load_all_code_files,
            commands::delete_code_file,
            commands::update_code_file,
            commands::execute_code,
            commands::get_available_languages,
            commands::export_raw_code,
            commands::delete_raw_code,
            commands::get_installed_languages,
            read_directory,
            create_directory,
            save_custom_language,
        ])
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            if let Err(e) = seeder::seed_default_languages_on_boot() {
                println!("Warning: Failed to bootstrap default languages layout directory: {}", e);
            }
            
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