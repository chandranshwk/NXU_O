/**
 * @file FloatingToolbar.tsx
 * @component FloatingToolbar
 * @description A dynamic floating text formatting bubble menu. It places itself
 * precisely above active text selection highlights using absolute screen pixel
 * coordinates, offering quick typography controls.
 *
 * @architecture
 * - Collects inline formatting metrics using a localized `useEditorState` selector wrapper.
 * - Unpacks active formatting tools by routing configurations through `useToolbarConfigs`.
 * - Combines block switchers (`TypeDropdown`), textual shades (`ColorDropdown`), and control keys (`TOOLS`).
 */

import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import type { editorContextType } from "../contexts/editorContext";
import { useToolbarConfigs } from "./FloatingToolbar.data";
import ColorDropdown from "./FloatingToolbar.ColorDropdown";
import TypeDropdown from "./FloatingToolbar.TypeDropdown";
import React from "react";

interface props {
  /** Target active text engine receiving button selection commands */
  editor: Editor;
  /** Shared dark mode setting flag used to switch visual palette layouts */
  darkMode: boolean;
  /** Mirror tracking data interface validating selection life-cycles */
  context: editorContextType | undefined;
  /** Physical target pixel positions on screen anchoring this popup container bubble */
  coords: { top: number; left: number };
}

export const FloatingToolbar: React.FC<props> = ({
  editor,
  darkMode,
  context,
  coords,
}) => {
  // ==========================================
  // SELECTOR: CHARACTER LAYER DESIGN MODES
  // ==========================================
  /**
   * Directly interrogates ProseMirror selection metrics on state transactions.
   * Maps inline boolean rules (bold, italic, list states) to manage icon activation triggers.
   */
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

  // Pull individual button blueprints out of uniform configuration mapping files
  const { TOOLS } = useToolbarConfigs({
    editor,
    properties,
    darkMode,
  });

  // Structural Render Guard: Keep layout hidden if parent editor focus channels clear out
  if (!context) return null;

  return (
    /* MAIN FLOATING SHELL: Placed using absolute pixel positions based on text cursor bounds */
    <div
      style={{
        top: `${coords.top}px`,
        left: `${coords.left}px`,
      }}
      className={`flex items-center gap-1.5 p-1 rounded-md z-9999 border shadow-xl w-max absolute -translate-x-1/2 px-4 select-none font-sans antialiased animate-in fade-in zoom-in-95 duration-100
        ${
          darkMode
            ? "bg-zinc-900 border-zinc-800 text-zinc-100 shadow-black/40"
            : "bg-white border-zinc-200 text-zinc-800 shadow-zinc-200/50"
        }`}
    >
      {/* 1. NODE ABSTRACTION TYPE SWITCH dropdown block (e.g. Paragraph, Headings, Lists) */}
      <TypeDropdown darkMode={darkMode} editor={editor} />

      {/* 2. CHARACTER FONT COLOR & HIGHLIGHT palette selector menu grids */}
      <ColorDropdown
        darkMode={darkMode}
        editor={editor}
        properties={properties}
      />

      {/* Structural partitioning vertical boundary divider line */}
      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 shrink-0" />

      {/* ==========================================
          3. INLINE CHARACTER INLINE ACTIONS LOOP (TOOLS)
          ========================================== */}
      {TOOLS.map((tool, idx) => {
        const isAlignmentButton = tool.label.startsWith("Align");

        // Compute localized background colors matching active toggles
        const backgroundTheme = tool.isActive
          ? "bg-blue-600 text-white shadow-sm"
          : darkMode
            ? "bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            : "bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 border-transparent";

        // Dynamic theme fill routing tracking individual active items
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
            // Use onMouseDown to trigger formatting styles without blurring highlight focus spans
            onMouseDown={(e) => tool.action(e)}
          >
            {/* Inject dynamic visual adjustments directly into custom react-icon wrappers */}
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
