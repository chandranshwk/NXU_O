/**
 * @file ColorDropdown.tsx
 * @component ColorDropdown
 * @description A combined text color and highlight selection menu for character formatting.
 * It updates an indicator badge in real time and handles inline style states
 * using a single grouped layout structure.
 *
 * @architecture
 * - Leverages `useEditorState` to track inline text selections and highlight background states.
 * - Pulls distinct color arrays from `useToolbarConfigs` using the global preferences context.
 * - Fires custom text modifications without breaking active cursor focus positions.
 */

import React, { useState, useReducer } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  useToolbarConfigs,
  type EditorProperties,
} from "./FloatingToolbar.data";

interface ColorDropdownProps {
  /** Target active text engine editor receiving typography color commands */
  editor: Editor;
  /** Active formatting states describing current cursor selection details */
  properties: EditorProperties;
  /** Shared dark mode setting flag used to switch palette layouts */
  darkMode: boolean;
}

export const ColorDropdown: React.FC<ColorDropdownProps> = ({
  editor,
  properties,
  darkMode,
}) => {
  // ==========================================
  // 📊 SELECTOR: CHARACTER LAYER DESIGN MODES
  // ==========================================
  /**
   * Tracks inline font attributes and character highlight fills on selector changes,
   * updating the primary visual trigger button badge instantly.
   */
  const activeSelection = useEditorState({
    editor,
    selector: (ctx) => ({
      color: ctx.editor.getAttributes("textStyle").color || "inherit",
      backgroundColor:
        ctx.editor.getAttributes("textStyle").backgroundColor || "transparent",
    }),
  });

  const { TEXTSTYLE } = useToolbarConfigs({
    editor,
    properties,
    darkMode,
  });

  /** Visibility flag governing the open state of the style palette overlay card */
  const [isColorOpen, setIsColorOpen] = useState(false);
  /** Local reducer dispatcher used to force immediate button refreshes on click */
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <div className="relative inline-block select-none font-sans antialiased text-xs w-max">
      {/* ==========================================
          TRIGGER CONTROLLER: ACTIVE PALETTE SWATCH
          ========================================== */}
      <div
        className={`flex items-center gap-1.5 px-1 py-1 rounded-lg border cursor-pointer transition-colors duration-100 font-medium
        ${
          darkMode
            ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
        }`}
        onMouseDown={(e) => {
          e.preventDefault(); // Stifles default click events to preserve text highlights
          setIsColorOpen(!isColorOpen);
        }}
      >
        {/* Dynamic Character 'A' Swatch Block */}
        <span
          className="font-semibold text-sm px-1 py-0 flex items-center justify-center rounded-sm"
          style={{
            color:
              activeSelection.color === "inherit"
                ? "currentColor"
                : activeSelection.color,
            backgroundColor: activeSelection.backgroundColor,
          }}
        >
          A
        </span>
      </div>

      {/* ==========================================
          DROPDOWN LAYOVER: STYLE MODIFIER MATRIX
          ========================================== */}
      {isColorOpen && (
        <div
          className={`absolute left-0 mt-2 w-max pr-2 border rounded-xl shadow-xl z-50 max-h-80 overflow-y-auto p-1 scrollbar-thin
          ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-200 shadow-black/40"
              : "bg-white border-zinc-100 text-zinc-700 shadow-zinc-200/40"
          }`}
        >
          {TEXTSTYLE.map((group, groupIdx) => {
            const isTextGroup = group.name === "Text";

            // Extract target matching states based on whether loop runs values for Text or Highlight strings
            const currentActiveValue = isTextGroup
              ? activeSelection.color
              : activeSelection.backgroundColor;

            return (
              <div key={groupIdx} className="flex flex-col">
                {/* Partition Header Section (Text / Highlight) */}
                <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide select-none">
                  {group.name}
                </div>

                {/* Iterate over inner color objects */}
                {group.array.map((color, colorIdx) => {
                  const normalizedHex = isTextGroup
                    ? color.hex
                    : color.hex === "transparent" || color.hex === "inherit"
                      ? "transparent"
                      : color.hex;

                  // Verify if loop color matches active selection formatting attributes
                  const isSelected = currentActiveValue === normalizedHex;

                  return (
                    <div
                      key={colorIdx}
                      className={`h-8 w-full px-3 flex items-center justify-between cursor-pointer transition-colors duration-75 rounded-lg font-medium group
                      ${
                        darkMode
                          ? "hover:bg-zinc-800 text-zinc-300 hover:text-white"
                          : "hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900"
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Retains Tiptap selection layers intact

                        // ==========================================
                        // 🚀 SCHEDULER: APPLY DISPATCH RE-STYLES
                        // ==========================================
                        if (isTextGroup) {
                          if (color.hex === "inherit") {
                            editor
                              .chain()
                              .focus()
                              .updateAttributes("textStyle", { color: null })
                              .run();
                          } else {
                            editor
                              .chain()
                              .focus()
                              .setMark("textStyle", {
                                color: color.hex.toLowerCase(),
                              })
                              .run();
                          }
                        } else {
                          if (
                            color.hex === "transparent" ||
                            color.hex === "inherit"
                          ) {
                            editor
                              .chain()
                              .focus()
                              .updateAttributes("textStyle", {
                                backgroundColor: null,
                              })
                              .run();
                          } else {
                            editor
                              .chain()
                              .focus()
                              .setMark("textStyle", {
                                backgroundColor: color.hex.toLowerCase(),
                              })
                              .run();
                          }
                        }

                        // Force active re-evaluation across UI states and dismiss overlay
                        forceUpdate();
                        setIsColorOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Sample Identifier Swatch Character */}
                        <div
                          className={`w-5 h-5 flex items-center justify-center text-[11px] font-bold border rounded-sm shrink-0 transition-colors
                          ${darkMode ? "border-zinc-800 bg-zinc-950/40" : "border-zinc-200 bg-zinc-50/50"}`}
                          style={{
                            color: isTextGroup
                              ? color.hex === "inherit"
                                ? "currentColor"
                                : color.hex
                              : "currentColor",
                            backgroundColor: !isTextGroup
                              ? normalizedHex
                              : undefined,
                          }}
                        >
                          A
                        </div>
                        <span className="text-xs">{color.name}</span>
                      </div>

                      {/* Right Aligned Validation Checkmark Selection */}
                      {isSelected && (
                        <span className="text-xs text-zinc-800 dark:text-zinc-200 font-bold pr-0.5">
                          ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ColorDropdown;
