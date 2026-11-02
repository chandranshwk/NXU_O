use std::fs;
use serde_json::Value;
use crate::get_store_path;

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