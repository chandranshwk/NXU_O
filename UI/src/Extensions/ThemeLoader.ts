/**
 * @file ThemeLoader.ts
 * @description Dynamic syntax highlighter theme router module mapping predefined built-in language
 * blueprints against hot-swappable local user filesystem schemas loaded via Tauri native binary bridges.
 */

import { invoke } from "@tauri-apps/api/core";

export interface TextTokenGroup {
  readonly words: readonly string[];
}

export interface RegexTokenGroup {
  readonly regex: string;
}

/**
 * @interface LanguageThemeProfile
 * @description Type safety contract defining the exact configuration schema
 * expected across all built-in and dynamic runtime language JSON profiles.
 */
export interface LanguageThemeProfile {
  readonly modifiers?: TextTokenGroup;
  readonly controlFlow?: TextTokenGroup;
  readonly keywords?: TextTokenGroup;
  readonly primitives?: TextTokenGroup;
  readonly builtins?: TextTokenGroup;
  readonly strings?: RegexTokenGroup;
  readonly numbers?: RegexTokenGroup;
  readonly comments?: RegexTokenGroup;
  readonly annotations?: RegexTokenGroup;
}

// ==========================================
// 📦 IMMUTABLE PREDEFINED FALLBACK BLUEPRINTS
// ==========================================
const PREDEFINED_THEMES: Record<string, LanguageThemeProfile> = {
  java: {
    modifiers: {
      words: [
        "public",
        "private",
        "protected",
        "static",
        "final",
        "synchronized",
      ],
    },
    controlFlow: {
      words: [
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "break",
        "continue",
        "return",
        "try",
        "catch",
      ],
    },
    keywords: {
      words: [
        "class",
        "interface",
        "enum",
        "extends",
        "implements",
        "package",
        "import",
        "new",
        "this",
        "super",
      ],
    },
    primitives: {
      words: [
        "void",
        "int",
        "double",
        "float",
        "long",
        "short",
        "byte",
        "char",
        "boolean",
      ],
    },
    builtins: {
      words: [
        "System",
        "String",
        "Object",
        "List",
        "ArrayList",
        "Map",
        "HashMap",
        "out",
        "println",
      ],
    },
    strings: { regex: '"[^"]*"' },
    numbers: { regex: "\\b\\d+(\\.\\d+)?\\b" },
    comments: { regex: "//.*|/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*/" },
    annotations: { regex: "@[a-zA-Z_][a-zA-Z0-9_]*" },
  },
  default: {
    modifiers: { words: [] },
    controlFlow: { words: [] },
    keywords: { words: [] },
    primitives: { words: [] },
    builtins: { words: [] },
  },
  // You can easily paste your predefined Python or JS schemas here later!
};

/** In-memory syntax rule storage cache combining built-ins and custom local user overrides */
export let loadedThemesRegistry: Record<string, LanguageThemeProfile> = {
  ...PREDEFINED_THEMES,
};

/**
 * @function initializeCustomLanguages
 * @description Triggers on boot. Loads hardcoded blueprints first, then layers any custom
 * local JSON files from the Rust binary folder on top as overrides.
 */
export const initializeCustomLanguages = async (): Promise<void> => {
  try {
    // 1. Invoke the native Rust background directory scanner
    const customUserThemes = await invoke<Record<string, LanguageThemeProfile>>(
      "load_all_custom_themes",
    );

    // 2. ⚡ MERGE ENGINE: Combine themes cleanly. User-added files overwrite built-in themes!
    loadedThemesRegistry = {
      ...PREDEFINED_THEMES,
      ...customUserThemes,
    };

    console.log(
      "Active language registry keys:",
      Object.keys(loadedThemesRegistry),
    );
  } catch (error) {
    console.warn(
      "Theme loader could not read local disk directories, falling back to built-ins:",
      error,
    );
    // Keep internal predefined memory intact if the Rust scanner throws a directory error
    loadedThemesRegistry = { ...PREDEFINED_THEMES };
  }
};

/**
 * @function getDynamicLanguageTheme
 * @description Instant lookup dictionary retrieval for the code highlighting extension loops.
 * ⚡ STRICT ENFORCEMENT FIX: Reads strictly from the normalized language target key.
 * Completely blocks accidental Java leaking by returning explicit null on missing profiles.
 */
export const getDynamicLanguageTheme = (
  lang: string,
): LanguageThemeProfile | null => {
  const normalizedKey = lang.toLowerCase();

  // Only return a theme if the precise key matches perfectly
  if (loadedThemesRegistry[normalizedKey]) {
    return loadedThemesRegistry[normalizedKey];
  }

  return null;
};
