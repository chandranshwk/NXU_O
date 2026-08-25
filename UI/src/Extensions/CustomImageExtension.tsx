import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import Images from "../Helper/Images";

// Declare module augmentation so TypeScript registers your custom command
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customImageBlock: {
      insertCustomImage: (attributes?: {
        src: string;
        alt?: string;
        width?: string;
        alignment?: "left" | "center" | "right";
      }) => ReturnType;
    };
  }
}

export const CustomImageBlockExtension = Node.create({
  name: "customImageBlock",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-src") || "",
        renderHTML: (attributes) => ({ "data-src": attributes.src }),
      },
      alt: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-alt") || "",
        renderHTML: (attributes) => ({ "data-alt": attributes.alt }),
      },
      width: {
        default: "100%",
        parseHTML: (element) => element.getAttribute("data-width") || "100%",
        renderHTML: (attributes) => ({ "data-width": attributes.width }),
      },
      alignment: {
        default: "center",
        parseHTML: (element) =>
          element.getAttribute("data-alignment") || "center",
        renderHTML: (attributes) => ({
          "data-alignment": attributes.alignment,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="custom-image-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "custom-image-block" }),
    ];
  },

  addNodeView() {
    // 2. Pass your Images component directly to the renderer
    return ReactNodeViewRenderer(Images, {
      update: ({ newNode }) => newNode.type.name === "customImageBlock",

      stopEvent({ event }) {
        const target = event.target as HTMLElement;

        if (
          target.closest("button") ||
          target.closest("input") ||
          target.closest(".resize-handle") ||
          target.closest('[role="toolbar"]')
        ) {
          // 3. Fix text entry bug: prevent Tiptap from hijacking keyboard strokes inside the input box
          if (event.type === "keydown" && target.closest("input")) {
            event.stopPropagation();
          }
          return true;
        }
        return false;
      },
    });
  },

  addCommands() {
    return {
      insertCustomImage:
        (attributes?) =>
        ({ commands }) => {
          // 4. Fixed return path so chaining commands functions correctly
          return commands.insertContent({
            type: "customImageBlock",
            attrs: attributes,
          });
        },
    };
  },
});
