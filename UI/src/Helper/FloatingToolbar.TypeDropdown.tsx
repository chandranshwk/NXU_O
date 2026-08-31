/**
 * @file TypeDropdown.tsx
 * @component TypeDropdown
 * @description A dropdown block selector for the floating toolbar. It tracks
 * cursor context using useEditorState and swaps the active block node type
 * (e.g., standard text paragraphs, h1-h6 headings, block-quotes, or list formats).
 *
 * @architecture
 * - Leverages `useEditorState` to track active cursor context flags in real time.
 * - Extracts uniform schema formatting configurations from `useToolbarConfigs`.
 * - Intercepts mouse events to swap block configurations without releasing text selection highlight layers.
 */

import React, { useState, useEffect } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useToolbarConfigs } from "./FloatingToolbar.data";

interface TypeDropdownProps {
  /** Active TipTap core text engine receiving formatting node actions */
  editor: Editor;
  /** Shared dark mode setting flag used to toggle UI themes */
  darkMode: boolean;
}

export const TypeDropdown: React.FC<TypeDropdownProps> = ({
  editor,
  darkMode,
}) => {
  /** Visibility toggle flag controlling the dropdown panel layout view */
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // ==========================================
  // CONFIGURATIONS: EXTRACT BLOCK SCHEMA
  // ==========================================
  /**
   * Pulls structural configurations from the central toolbar blueprint hook.
   * Feeds it an empty fallback object signature because global node swaps
   * operate independently of character style states like bold or italic.
   */
  const { TYPES } = useToolbarConfigs({
    editor,
    properties: {
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isStrikeThrough: false,
      alignment: "left",
    },
    darkMode,
  });

  /** Active selection state tracker displaying the component label badge */
  const [selectedType, setSelectedType] = useState(TYPES[0]);

  // ==========================================
  // SELECTOR: LIVE CURSOR BLOCK MONITOR
  // ==========================================
  /**
   * Automatically interrogates TipTap view states on cursor changes.
   * Maps current paragraph positions, block-quotes, lists, or heading tiers.
   */
  const activeBlockId = useEditorState({
    editor,
    selector: (ctx) => {
      if (ctx.editor.isActive("paragraph")) return "paragraph";
      if (ctx.editor.isActive("blockquote")) return "blockquote";
      if (ctx.editor.isActive("bulletList")) return "bulletList";
      if (ctx.editor.isActive("orderedList")) return "orderedList";

      // Scan individual heading weights h1 to h6
      for (let i = 1; i <= 6; i++) {
        if (ctx.editor.isActive("heading", { level: i })) return `h${i}`;
      }
      return "paragraph";
    },
  });

  // ==========================================
  // LIFECYCLE: LABEL DISPLAY SYNCHRONIZER
  // ==========================================
  /**
   * Keeps labels perfectly updated when users cycle blocks using keyboard hotkeys,
   * avoiding context configuration drift.
   */
  useEffect(() => {
    const currentActiveBlock = TYPES.find((t) => t.id === activeBlockId);
    if (currentActiveBlock) {
      setTimeout(() => {
        setSelectedType(currentActiveBlock);
      }, 0);
    }
  }, [activeBlockId, TYPES]);

  return (
    <div className="relative inline-block w-44 select-none font-sans antialiased text-xs">
      {/* ==========================================
          TRIGGER CONTROLLER: ACTIVE VALUE DISPLAY CARD
          ========================================== */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-sm transition-all duration-150 cursor-pointer
          ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800"
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          }`}
        onMouseDown={(e) => {
          // Stifles default actions to hold active selection highlight layers locked
          e.preventDefault();
          setIsTypeOpen(!isTypeOpen);
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="text-zinc-500 shrink-0">{selectedType.icon}</div>
          <span className="font-medium text-xs">{selectedType.label}</span>
        </div>
        <span
          className="text-[10px] text-zinc-400 font-bold transition-transform duration-200"
          style={{ transform: isTypeOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          ▼
        </span>
      </div>

      {/* ==========================================
          DROPDOWN OVERLAY: NODE ACTION BLOCK MENU
          ========================================== */}
      {isTypeOpen && (
        <div
          className={`absolute left-0 mt-2 w-56 border rounded-xl p-1.5 shadow-xl z-999 max-h-80 overflow-y-auto outline-none
            ${
              darkMode
                ? "bg-zinc-900 border-zinc-800 text-zinc-200 shadow-black/40"
                : "bg-white border-zinc-100 text-zinc-700 shadow-zinc-200/50"
            }`}
        >
          {TYPES.map((type, idx) => {
            const isSelected = type.id === activeBlockId;
            return (
              <div
                key={idx}
                className={`h-max w-full px-3 py-2 flex items-center justify-between cursor-pointer transition-colors duration-100 rounded-lg text-xs font-medium group
                  ${
                    darkMode
                      ? isSelected
                        ? "bg-zinc-800 text-white"
                        : "hover:bg-zinc-800/80 text-zinc-300"
                      : isSelected
                        ? "bg-zinc-100 text-zinc-900"
                        : "hover:bg-zinc-50 text-zinc-600"
                  }`}
                onMouseDown={(e) => {
                  // Prevents focus from dropping out of the editing pane highlight selection
                  e.preventDefault();
                  type.action(e);
                  setSelectedType(type);
                  setIsTypeOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Action Icon Indicator Swatch */}
                  <div
                    className={`shrink-0 transition-colors ${isSelected ? "text-blue-500" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`}
                  >
                    {type.icon}
                  </div>
                  <div>{type.label}</div>
                </div>

                {/* Right-aligned active verification checkmark */}
                {isSelected && (
                  <span className="text-xs text-blue-500 dark:text-blue-400 font-semibold pr-0.5">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TypeDropdown;
