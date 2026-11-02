import { Extension } from "@tiptap/core";

/**
 * @extension CodeTabExtension
 * @description Overrides browser and default TipTap focus traps to catch the Tab key
 * down signal, programmatically inserting space symbols inside the workspace instead.
 */
export const CodeTabExtension = Extension.create({
  name: "codeTabExtension",

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        // Enforce exact 4-space layout indentation rules
        return editor.commands.insertContent("    ");
      },
    };
  },
});
