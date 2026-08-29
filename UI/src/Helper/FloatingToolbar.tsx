import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import type { editorContextType } from "../contexts/editorContext";
import { useToolbarConfigs } from "./FloatingToolbar.data";
import ColorDropdown from "./FloatingToolbar.ColorDropdown";
import TypeDropdown from "./FloatingToolbar.TypeDropdown";
import React from "react";

interface props {
  editor: Editor;
  darkMode: boolean;
  context: editorContextType | undefined;
  coords: { top: number; left: number };
}

const FloatingToolbar: React.FC<props> = ({
  editor,
  darkMode,
  context,
  coords,
}) => {
  const properties = useEditorState({
    editor,
    selector: (ctx) => {
      const paragraphAttrs = ctx.editor.getAttributes("paragraph");
      const headingAttrs = ctx.editor.getAttributes("heading");
      const activeAlignment =
        paragraphAttrs.textAlign || headingAttrs.textAlign || "left";

      return {
        isBold: ctx.editor.isActive("bold"),
        isItalic: ctx.editor.isActive("italic"),
        isUnderline: ctx.editor.isActive("underline"),
        isStrikeThrough: ctx.editor.isActive("strike"),
        isUL: ctx.editor.isActive("bulletList"),
        isOL: ctx.editor.isActive("orderedList"),
        highlightedColor: ctx.editor.getAttributes("highlight").color || "",
        font: ctx.editor.getAttributes("textStyle").fontFamily || "",
        fontSize: ctx.editor.getAttributes("textStyle").fontSize || "",
        color: ctx.editor.getAttributes("textStyle").color || "",
        alignment: activeAlignment,
      };
    },
  });

  const { TOOLS } = useToolbarConfigs({
    editor,
    properties,
    darkMode,
  });

  if (!context) return null;

  return (
    <div
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className={`flex items-center gap-1.5 p-1 rounded-md border shadow-xl w-max absolute -translate-x-1/2 z-555 px-4 select-none font-sans antialiased animate-in fade-in zoom-in-95 duration-100
        ${
          darkMode
            ? "bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/40"
            : "bg-white border-zinc-200 text-zinc-800 shadow-zinc-200/50"
        }`}
    >
      <TypeDropdown darkMode={darkMode} editor={editor} />
      <ColorDropdown
        darkMode={darkMode}
        editor={editor}
        properties={properties}
      />

      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {TOOLS.map((tool, idx) => {
        const isAlignmentButton = tool.label.startsWith("Align");

        const backgroundTheme = tool.isActive
          ? "bg-blue-600 text-white shadow-sm"
          : darkMode
            ? "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            : "bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 border-transparent";

        const iconColor = tool.isActive
          ? "white"
          : darkMode
            ? "rgb(161, 161, 170)"
            : "black";

        return (
          <div
            key={idx}
            title={tool.label}
            className={`w-8 h-8 rounded-lg cursor-pointer transition-all duration-150 flex items-center justify-center text-xs font-medium ${backgroundTheme}`}
            onMouseDown={(e) => tool.action(e)}
          >
            {React.isValidElement(tool.icon)
              ? React.cloneElement(
                  tool.icon as React.ReactElement<React.ComponentProps<"svg">>,
                  {
                    color: iconColor,
                    className:
                      tool.isActive && !isAlignmentButton
                        ? "text-bold"
                        : undefined,
                  },
                )
              : tool.icon}
          </div>
        );
      })}
    </div>
  );
};

export default FloatingToolbar;
