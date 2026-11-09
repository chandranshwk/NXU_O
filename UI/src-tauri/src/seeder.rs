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
 * @description Programmatically writes default language configurations and syntax themes to disk on first boot.
 */
pub fn seed_default_languages_on_boot() -> Result<(), String> {
    let lang_dir = get_languages_path()?;
    let store_dir = get_store_path()?;

    // ==========================================
    // 1. SEED EXECUTION ENGINE CONFIG (languages.json)
    // ==========================================
    let exec_config_path = store_dir.join("languages.json");
    if !exec_config_path.exists() {
        let exec_raw = r##"{
  "python": {
    "name": "Python",
    "slug": "python",
    "extension": "py",
    "commentPrefix": "#",
    "runCmd": ["python", "{file}"]
  },
  "javascript": {
    "name": "JavaScript",
    "slug": "javascript",
    "extension": "js",
    "commentPrefix": "//",
    "runCmd": ["node", "{file}"]
  },
  "typescript": {
    "name": "TypeScript",
    "slug": "typescript",
    "extension": "ts",
    "commentPrefix": "//",
    "runCmd": ["npx", "tsx", "{file}"]
  },
  "cpp": {
    "name": "C++",
    "slug": "cpp",
    "extension": "cpp",
    "commentPrefix": "//",
    "compileCmd": ["g++", "{file}", "-o", "{exePath}"],
    "runCmd": ["{exePath}"]
  },
  "c": {
    "name": "C",
    "slug": "c",
    "extension": "c",
    "commentPrefix": "//",
    "compileCmd": ["gcc", "{file}", "-o", "{exePath}"],
    "runCmd": ["{exePath}"]
  },
  "java": {
    "name": "Java",
    "slug": "java",
    "extension": "java",
    "commentPrefix": "//",
    "requiresClassMatch": true,
    "compileCmd": ["javac", "{file}"],
    "runCmd": ["java", "-cp", "{dir}", "Solution"]
  },
  "rust": {
    "name": "Rust",
    "slug": "rust",
    "extension": "rs",
    "commentPrefix": "//",
    "compileCmd": ["rustc", "{file}", "-o", "{exePath}"],
    "runCmd": ["{exePath}"]
  },
  "go": {
    "name": "Go",
    "slug": "go",
    "extension": "go",
    "commentPrefix": "//",
    "runCmd": ["go", "run", "{file}"]
  },
  "ruby": {
    "name": "Ruby",
    "slug": "ruby",
    "extension": "rb",
    "commentPrefix": "#",
    "runCmd": ["ruby", "{file}"]
  },
  "php": {
    "name": "PHP",
    "slug": "php",
    "extension": "php",
    "commentPrefix": "//",
    "runCmd": ["php", "{file}"]
  },
  "bash": {
    "name": "Bash",
    "slug": "bash",
    "extension": "sh",
    "commentPrefix": "#",
    "runCmd": ["bash", "{file}"]
  },
  "perl": {
    "name": "Perl",
    "slug": "perl",
    "extension": "pl",
    "commentPrefix": "#",
    "runCmd": ["perl", "{file}"]
  },
  "swift": {
    "name": "Swift",
    "slug": "swift",
    "extension": "swift",
    "commentPrefix": "//",
    "runCmd": ["swift", "{file}"]
  },
  "kotlin": {
    "name": "Kotlin",
    "slug": "kotlin",
    "extension": "kt",
    "commentPrefix": "//",
    "requiresClassMatch": true,
    "runCmd": ["kotlin", "{file}"]
  },
  "csharp": {
    "name": "C#",
    "slug": "csharp",
    "extension": "cs",
    "commentPrefix": "//",
    "requiresClassMatch": true,
    "runCmd": ["dotnet", "script", "{file}"]
  },
  "dart": {
    "name": "Dart",
    "slug": "dart",
    "extension": "dart",
    "commentPrefix": "//",
    "runCmd": ["dart", "run", "{file}"]
  },
  "r": {
    "name": "R",
    "slug": "r",
    "extension": "r",
    "commentPrefix": "#",
    "runCmd": ["Rscript", "{file}"]
  },
  "lua": {
    "name": "Lua",
    "slug": "lua",
    "extension": "lua",
    "commentPrefix": "--",
    "runCmd": ["lua", "{file}"]
  },
  "elixir": {
    "name": "Elixir",
    "slug": "elixir",
    "extension": "exs",
    "commentPrefix": "#",
    "runCmd": ["elixir", "{file}"]
  },
  "haskell": {
    "name": "Haskell",
    "slug": "haskell",
    "extension": "hs",
    "commentPrefix": "--",
    "runCmd": ["runhaskell", "{file}"]
  },
  "scala": {
    "name": "Scala",
    "slug": "scala",
    "extension": "scala",
    "commentPrefix": "//",
    "requiresClassMatch": true,
    "runCmd": ["scala", "{file}"]
  },
  "clojure": {
    "name": "Clojure",
    "slug": "clojure",
    "extension": "clj",
    "commentPrefix": ";",
    "runCmd": ["clojure", "{file}"]
  },
  "julia": {
    "name": "Julia",
    "slug": "julia",
    "extension": "jl",
    "commentPrefix": "#",
    "runCmd": ["julia", "{file}"]
  },
  "groovy": {
    "name": "Groovy",
    "slug": "groovy",
    "extension": "groovy",
    "commentPrefix": "//",
    "runCmd": ["groovy", "{file}"]
  },
  "fsharp": {
    "name": "F#",
    "slug": "fsharp",
    "extension": "fsx",
    "commentPrefix": "//",
    "runCmd": ["dotnet", "fsi", "{file}"]
  },
  "objective-c": {
    "name": "Objective-C",
    "slug": "objective-c",
    "extension": "m",
    "commentPrefix": "//",
    "compileCmd": ["clang", "-framework", "Foundation", "{file}", "-o", "{exePath}"],
    "runCmd": ["{exePath}"]
  },
  "assembly": {
    "name": "Assembly (GCC)",
    "slug": "assembly",
    "extension": "s",
    "commentPrefix": "#",
    "compileCmd": ["gcc", "-x", "assembler", "{file}", "-o", "{exePath}"],
    "runCmd": ["{exePath}"]
  },
  "fortran": {
    "name": "Fortran",
    "slug": "fortran",
    "extension": "f90",
    "commentPrefix": "!",
    "compileCmd": ["gfortran", "{file}", "-o", "{exePath}"],
    "runCmd": ["{exePath}"]
  },
  "zig": {
    "name": "Zig",
    "slug": "zig",
    "extension": "zig",
    "commentPrefix": "//",
    "runCmd": ["zig", "run", "{file}"]
  },
  "nim": {
    "name": "Nim",
    "slug": "nim",
    "extension": "nim",
    "commentPrefix": "#",
    "compileCmd": ["nim", "c", "-r", "{file}"],
    "runCmd": []
  }
}"##;

        let parsed_exec: Value = serde_json::from_str(exec_raw).map_err(|e| e.to_string())?;
        let pretty_exec = serde_json::to_string_pretty(&parsed_exec).map_err(|e| e.to_string())?;
        fs::write(exec_config_path, pretty_exec).map_err(|e| e.to_string())?;
    }

    // ==========================================
    // 2. SEED SYNTAX HIGHLIGHTING THEMES
    // ==========================================
    
    // Java Predefined Template Seeder
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

    // Python Predefined Template Seeder
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