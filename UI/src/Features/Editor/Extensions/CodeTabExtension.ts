import { Extension } from "@tiptap/core";

/**
 * @extension CodeTabExtension
 * @description Overrides browser and default TipTap focus traps to catch the
 * Tab key, inserting four literal spaces into the code workspace.
 *
 * @architecture
 * - Uses a raw ProseMirror transaction (`state.tr.insertText`) instead of
 *   `editor.commands.insertContent("    ")`. The command path routes strings
 *   through `JSON.parse` → `DOMParser` → whitespace normalisation, which
 *   collapses runs of spaces to a single space. A raw transaction bypasses
 *   all of that and writes exactly four spaces into the doc.
 * - `Shift-Tab` removes up to four leading spaces from the current line, or
 *   from every line in a multi-line selection, so indentation is reversible
 *   without leaving the keyboard.
 *
 * @note Indentation is only *visible* when `.tiptap p` has
 *   `white-space: pre-wrap`. See the scoped style block inside `CodeIDE.tsx`.
 */
export const CodeTabExtension = Extension.create({
  name: "codeTabExtension",

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const { state, view } = editor;
        view.dispatch(state.tr.insertText("    ", state.selection.from));
        return true;
      },

      "Shift-Tab": ({ editor }) => {
        const { state, view } = editor;
        const { from, to } = state.selection;

        // Guard: if the cursor isn't inside a paragraph (e.g. at doc root),
        // `$from.parent` is the doc itself and `start()` targets an invalid
        // delete position. Bail out cleanly.
        const $from = state.doc.resolve(from);
        if ($from.depth === 0) return true;

        // Collect all paragraph start positions that intersect the selection.
        // For a cursor (from === to), this is exactly one line; for a range,
        // it's every line the selection touches.
        const lineStarts: number[] = [];
        state.doc.nodesBetween(from, to, (node, pos) => {
          if (node.type.name === "paragraph") {
            lineStarts.push(pos + 1); // +1 skips the paragraph's opening token
          }
        });

        if (lineStarts.length === 0) return true;

        // Delete in a single transaction, descending so earlier positions
        // aren't invalidated by later deletions.
        let tr = state.tr;
        for (const start of [...lineStarts].sort((a, b) => b - a)) {
          const paragraph = state.doc.nodeAt(start - 1);
          if (!paragraph) continue;
          const lineText = paragraph.textContent;
          const leadingSpaces = lineText.match(/^ +/)?.[0].length ?? 0;
          const stripCount = Math.min(4, leadingSpaces);
          if (stripCount > 0) {
            tr = tr.delete(start, start + stripCount);
          }
        }

        if (tr.docChanged) {
          view.dispatch(tr);
        }
        return true;
      },
    };
  },
});
