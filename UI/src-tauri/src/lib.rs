use std::env;
use std::fs;
use std::path::PathBuf;

// REGISTER SUB-MODULES
mod commands;
mod seeder;

pub fn get_store_path() -> Result<PathBuf, String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    exe_path.pop(); 
    exe_path.push("store");
    fs::create_dir_all(&exe_path).map_err(|e| e.to_string())?;
    Ok(exe_path)
}

pub fn get_pages_path() -> Result<PathBuf, String> {
    let mut pages_path = get_store_path()?;
    pages_path.push("pages");
    fs::create_dir_all(&pages_path).map_err(|e| e.to_string())?;
    Ok(pages_path)
}

pub fn get_notebooks_path() -> Result<PathBuf, String> {
    let mut notebooks_path = get_store_path()?;
    notebooks_path.push("notebooks");
    fs::create_dir_all(&notebooks_path).map_err(|e| e.to_string())?;
    Ok(notebooks_path)
}

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

// Helper for external raw code exports
pub fn get_external_codes_path() -> Result<PathBuf, String> {
    let exe_path = env::current_exe().map_err(|e| e.to_string())?;
    
    // Find the absolute root of the drive (e.g., "D:\" or "/")
    let mut root_path = exe_path.ancestors().last().unwrap_or(&exe_path).to_path_buf();
    
    root_path.push("NXU_OCODES");
    fs::create_dir_all(&root_path).map_err(|e| e.to_string())?;
    Ok(root_path)
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