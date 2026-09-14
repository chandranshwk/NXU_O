use std::fs;
use std::path::PathBuf;
use serde_json::Value;

// Reuse the store path logic from your base module
use crate::get_store_path;

fn get_languages_path() -> Result<PathBuf, String> {
    let mut lang_path = get_store_path()?;
    lang_path.push("Languages");
    fs::create_dir_all(&lang_path).map_err(|e| e.to_string())?;
    Ok(lang_path)
}

/**
 * @function seed_default_languages_on_boot
 * @description Programmatically writes default Java and Python configurations to disk on first boot.
 * ⚡ FIXED: Shifted to double-hashed raw literal syntax r##"..."## to prevent quotes inside regex from breaking compilation.
 */
pub fn seed_default_languages_on_boot() -> Result<(), String> {
    let lang_dir = get_languages_path()?;

    // ☕ Java Predefined Template Seeder
    let java_path = lang_dir.join("java-theme.json");
    if !java_path.exists() {
        let java_raw = r##"{
            "modifiers": { "words": ["public", "private", "protected", "static", "final", "synchronized"] },
            "controlFlow": { "words": ["if", "else", "for", "while", "do", "switch", "case", "break", "continue", "return", "try", "catch"] },
            "keywords": { "words": ["class", "interface", "enum", "extends", "implements", "package", "import", "new", "this", "super"] },
            "primitives": { "words": ["void", "int", "double", "float", "long", "short", "byte", "char", "boolean"] },
            "builtins": { "words": ["System", "String", "Object", "List", "ArrayList", "Map", "HashMap", "out", "println"] },
            "strings": { "regex": "\"[^\"]*\"" },
            "numbers": { "regex": "\\b\\d+(\\.\\d+)?\\b" },
            "comments": { "regex": "//.*|/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*/" },
            "annotations": { "regex": "@[a-zA-Z_][a-zA-Z0-9_]*" }
        }"##;
        
        let parsed_java: Value = serde_json::from_str(java_raw).map_err(|e| e.to_string())?;
        let pretty_java = serde_json::to_string_pretty(&parsed_java).map_err(|e| e.to_string())?;
        fs::write(java_path, pretty_java).map_err(|e| e.to_string())?;
    }

    // 🐍 Python Predefined Template Seeder
    let python_path = lang_dir.join("python-theme.json");
    if !python_path.exists() {
        let python_raw = r##"{
            "modifiers": { "words": ["global", "nonlocal", "lambda"] },
            "controlFlow": { "words": ["if", "elif", "else", "for", "while", "break", "continue", "return", "try", "except", "finally", "raise", "with", "as", "yield"] },
            "keywords": { "words": ["import", "from", "def", "class", "pass", "assert", "del", "in", "is", "and", "or", "not"] },
            "primitives": { "words": ["True", "False", "None"] },
            "builtins": { "words": ["print", "len", "range", "str", "int", "float", "list", "dict", "set", "tuple", "input", "open", "append", "sum"] },
            "strings": { "regex": "'[^']*'|\"[^\"]*\"" },
            "numbers": { "regex": "\\b\\d+(\\.\\d+)?\\b" },
            "comments": { "regex": "#.*" },
            "annotations": { "regex": "@[a-zA-Z_][a-zA-Z0-9_]*" }
        }"##;

        let parsed_python: Value = serde_json::from_str(python_raw).map_err(|e| e.to_string())?;
        let pretty_python = serde_json::to_string_pretty(&parsed_python).map_err(|e| e.to_string())?;
        fs::write(python_path, pretty_python).map_err(|e| e.to_string())?;
    }

    Ok(())
}
