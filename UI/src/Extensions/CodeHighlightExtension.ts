import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { getDynamicLanguageTheme } from "./ThemeLoader";

// ⚡ Establish a unique, permanent state accessor key for this plugin instance
const codeHighlightPluginKey = new PluginKey("codeHighlightKey");

export const CodeHighlightExtension = Extension.create({
  name: "codeHighlightExtension",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: codeHighlightPluginKey,

        // ⚡ 1. DEFINE INTERNAL IMMUTABLE PLUGIN STATE
        state: {
          init() {
            return { language: "default" }; // Default tracking channel initialization
          },
          apply(tr, value) {
            // Intercept custom transaction metadata changes
            const nextLang = tr.getMeta("setLanguage");
            if (nextLang) {
              return { language: nextLang }; // Overwrites the internal language state channel
            }
            return value;
          },
        },

        // ⚡ 2. RENDER FLOW: Read directly from the updated plugin state
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            const { doc } = state;

            // Extract the active language from this plugin's own active state frame
            const pluginState = codeHighlightPluginKey.getState(state);
            const activeLang = pluginState?.language || "java";

            const activeTheme = getDynamicLanguageTheme(activeLang);

            // Strict Gate: If no theme layout maps out (like switching to Python), return empty decorations
            if (!activeTheme) {
              return DecorationSet.empty;
            }

            doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;
              const text = node.text;

              // Text Dictionary Scanners (Modifiers, ControlFlow, Keywords, Primitives, Built-ins)
              const groupKeys = [
                "modifiers",
                "controlFlow",
                "keywords",
                "primitives",
                "builtins",
              ] as const;
              groupKeys.forEach((key) => {
                const config = activeTheme[key];
                if (config && config.words && config.words.length > 0) {
                  const escapedWords = config.words.map((w: string) =>
                    w.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
                  );
                  const regex = new RegExp(
                    `\\b(${escapedWords.join("|")})\\b`,
                    "g",
                  );
                  let match;

                  while ((match = regex.exec(text)) !== null) {
                    decorations.push(
                      Decoration.inline(
                        pos + match.index,
                        // ⚡ CRITICAL FIX: Changed match.length to match[0].length
                        pos + match.index + match[0].length,
                        {
                          class: `token-${key === "controlFlow" ? "control" : key.replace(/s$/, "")}`,
                        },
                      ),
                    );
                  }
                }
              });

              // Regular Expression Pattern Scanners (Strings, Numbers, Comments, Annotations)
              const regexKeys = [
                "strings",
                "numbers",
                "comments",
                "annotations",
              ] as const;
              regexKeys.forEach((key) => {
                const config = activeTheme[key];
                if (config && config.regex) {
                  const regex = new RegExp(config.regex, "g");
                  let match;

                  while ((match = regex.exec(text)) !== null) {
                    // ⚡ FIXED: Prevent infinite loops using the full match string length
                    if (match[0].length === 0) {
                      regex.lastIndex++;
                      continue;
                    }
                    decorations.push(
                      Decoration.inline(
                        pos + match.index,
                        // ⚡ CRITICAL FIX: Changed match.length to match[0].length
                        pos + match.index + match[0].length,
                        {
                          class: `token-${key.replace(/s$/, "")}`,
                        },
                      ),
                    );
                  }
                }
              });
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});
