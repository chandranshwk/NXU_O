export interface LanguageConfig {
  name: string; // Display name (e.g., "Python")
  slug: string; // Used for syntax highlighting & execution (e.g., "python")
  extension: string; // File extension (e.g., "py")
  commentPrefix: string; // Used to generate fallback templates
}

//  FUTURE: In Tauri, you can invoke a Rust command to check which of these are actually installed on the user's machine.
export const AVAILABLE_LANGUAGES: LanguageConfig[] = [
  { name: "Python", slug: "python", extension: "py", commentPrefix: "#" },
  {
    name: "JavaScript",
    slug: "javascript",
    extension: "js",
    commentPrefix: "//",
  },
  {
    name: "TypeScript",
    slug: "typescript",
    extension: "ts",
    commentPrefix: "//",
  },
  { name: "Java", slug: "java", extension: "java", commentPrefix: "//" },
  { name: "C++", slug: "cpp", extension: "cpp", commentPrefix: "//" },
  { name: "Rust", slug: "rust", extension: "rs", commentPrefix: "//" },
  { name: "Go", slug: "go", extension: "go", commentPrefix: "//" },
];
