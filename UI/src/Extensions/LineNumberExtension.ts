import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/**
 * @extension LineNumberExtension
 * @description Attaches row identifiers and cursor coordinates natively
 * to each block element to drive a performance-optimized CSS layout gutter.
 */
export const LineNumberExtension = Extension.create({
  name: "lineNumberExtension",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("lineNumberKey"),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            let lineNumber = 1;
            const { from } = state.selection;

            state.doc.descendants((node, pos) => {
              if (node.isBlock && node.type.name !== "doc") {
                const isCursorOnThisLine =
                  from >= pos && from <= pos + node.nodeSize;

                // Single, lightweight node wrapper decoration
                decorations.push(
                  Decoration.node(pos, pos + node.nodeSize, {
                    class: "editor-code-row",
                    "data-line-number": String(lineNumber),
                    "data-active-row": String(isCursorOnThisLine),
                  }),
                );

                lineNumber++;
              }
              return false;
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
