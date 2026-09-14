/**
 * @file lib.rs
 * @description The clean entry point gateway for the Tauri backend. 
 * Registers modules and wires up setup configurations securely.
 */

use std::env;
use std::fs;
use std::path::PathBuf;

// ⚡ REGISTER SUB-MODULES
mod commands;
mod seeder;

/**
 * @function get_store_path
 * @description Shared helper utility tracking executable directory bounds.
 */
pub fn get_store_path() -> Result<PathBuf, String> {
    let mut exe_path = env::current_exe().map_err(|e| e.to_string())?;
    exe_path.pop(); 
    exe_path.push("store");
    fs::create_dir_all(&exe_path).map_err(|e| e.to_string())?;
    Ok(exe_path)
}

/**
 * @function get_pages_path
 * @description Shared helper utility mapping user pages location paths.
 */
pub fn get_pages_path() -> Result<PathBuf, String> {
    let mut pages_path = get_store_path()?;
    pages_path.push("pages");
    fs::create_dir_all(&pages_path).map_err(|e| e.to_string())?;
    Ok(pages_path)
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
            commands::load_all_custom_themes
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
