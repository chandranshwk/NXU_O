import React, { useRef, useState } from "react";
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import {
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaTrash,
} from "react-icons/fa";

export const CustomImageBlockExtension = Node.create({
  name: "customImageBlock",
  group: "block",
  atom: true,
  selectable: false,

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
    return ReactNodeViewRenderer(
      ({ node, updateAttributes, deleteNode }) => {
        const { src, alt, width, alignment } = node.attrs;
        const containerRef = useRef<HTMLDivElement>(null);
        const [isResizing, setIsResizing] = useState(false);
        const startWidthRef = useRef<number>(0);
        const startXRef = useRef<number>(0);

        const alignmentClasses = {
          left: "justify-start",
          center: "justify-center",
          right: "justify-end",
        };

        const startResize = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();

          setIsResizing(true);
          if (containerRef.current) {
            startWidthRef.current = containerRef.current.offsetWidth;
          }
          startXRef.current = e.clientX;

          const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startXRef.current;
            const calculatedWidth =
              startWidthRef.current +
              (alignment === "center" ? deltaX * 2 : deltaX);

            const parentWidth =
              containerRef.current?.parentElement?.offsetWidth || 800;
            const finalWidthPercent = Math.min(
              Math.max((calculatedWidth / parentWidth) * 100, 20),
              100,
            );

            updateAttributes({ width: `${finalWidthPercent}%` });
          };

          const stopResize = () => {
            setIsResizing(false);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResize);
          };

          window.addEventListener("mousemove", handleMouseMove);
          window.addEventListener("mouseup", stopResize);
        };

        return (
          <NodeViewWrapper
            as="div"
            contentEditable={false}
            className={`flex w-full my-4 group/image relative select-none ${alignmentClasses[alignment as "left" | "center" | "right"]}`}
            // 🚀 FIXED: Added explicit React.MouseEvent types to callbacks to fix codes 7006
            onMouseUp={(e: React.MouseEvent) => e.stopPropagation()}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div
              ref={containerRef}
              style={{ width: width }}
              className="relative flex flex-col gap-2 border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg p-1 transition-colors"
            >
              {/* Floating Alignment & Delete Toolbar */}
              <div
                role="toolbar"
                className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover/image:opacity-100 flex items-center gap-1 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-2 py-1 rounded-lg shadow-xl transition-all z-40 text-xs font-medium"
              >
                <button
                  type="button"
                  onClick={() => updateAttributes({ alignment: "left" })}
                  className={`p-1.5 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer ${alignment === "left" ? "text-emerald-500" : ""}`}
                >
                  <FaAlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateAttributes({ alignment: "center" })}
                  className={`p-1.5 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer ${alignment === "center" ? "text-emerald-500" : ""}`}
                >
                  <FaAlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateAttributes({ alignment: "right" })}
                  className={`p-1.5 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 cursor-pointer ${alignment === "right" ? "text-emerald-500" : ""}`}
                >
                  <FaAlignRight className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-zinc-700 dark:bg-zinc-300 mx-1" />
                <button
                  type="button"
                  onClick={deleteNode}
                  className="p-1.5 rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 text-red-400 hover:text-red-500 cursor-pointer"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* The Display Image Asset */}
              <div className="relative overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800/50">
                <img
                  src={src}
                  alt={alt || "User uploaded content"}
                  className="w-full h-auto object-contain block pointer-events-none"
                />

                {/* Right/Side Resizing Drag Bar Handle */}
                <div
                  onMouseDown={startResize}
                  className={`resize-handle absolute top-0 right-0 h-full w-2 bg-emerald-500/0 hover:bg-emerald-500/40 cursor-ew-resize transition-colors ${isResizing ? "bg-emerald-500/60" : ""}`}
                />
              </div>

              {/* Metadata Alt Text Field Row Input */}
              <input
                type="text"
                value={alt}
                placeholder="Add alt text description..."
                onChange={(e) => updateAttributes({ alt: e.target.value })}
                className="w-full text-[11px] bg-transparent outline-none border-b border-transparent focus:border-zinc-200 dark:focus:border-zinc-800 text-center text-zinc-400 dark:text-zinc-500 py-0.5"
              />
            </div>
          </NodeViewWrapper>
        );
      },
      {
        update: ({ newNode }) => newNode.type.name === "customImageBlock",
        // 🚀 FIXED: Moved stopEvent here and specified its parameters correctly to fix codes 2353 and 7031
        stopEvent({ event }: { event: Event }) {
          const target = event.target as HTMLElement;
          if (
            target.closest("button") ||
            target.closest("input") ||
            target.closest(".resize-handle") ||
            target.closest('[role="toolbar"]')
          ) {
            return true;
          }
          return false;
        },
      },
    );
  },

  addCommands() {
    return {
      insertCustomImage:
        (attributes?: {
          src: string;
          alt?: string;
          width?: string;
          alignment?: "left" | "center" | "right";
        }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

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
