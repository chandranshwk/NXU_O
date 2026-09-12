/**
 * @file SortableDropdown.tsx
 * @component SortableDropdown
 * @description A block-level background color selector dropdown menu. It allows
 * users to apply a uniform background fill color to the parent text block
 * (heading or paragraph) using a floating portal menu layout.
 *
 * @architecture
 * - Utilizes `useEditorState` to track active parent block node tags and attributes.
 * - Extracts color arrays dynamically from shared floating toolbar theme configurations.
 * - Mounts the color grid using `createPortal` to slide outside layout clipping boundaries.
 */

import React, { useState, useReducer, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  useToolbarConfigs,
  type EditorProperties,
} from "./FloatingToolbar.data";

interface ToolbarColorItem {
  /** Display label name of the background option (e.g., "Red", "Blue") */
  name: string;
  /** Direct styling hex string value or system string keywords */
  hex: string;
}

interface SortableDropdownProps {
  /** Active TipTap core text engine editor target receiving style commands */
  editor: Editor;
  /** Mirror tracking object mapping active text selections inside the row */
  properties: EditorProperties;
  /** Shared dark mode setting flag used to switch visual palette states */
  darkMode: boolean;
}

export const SortableDropdown: React.FC<SortableDropdownProps> = ({
  editor,
  properties,
  darkMode,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  /** Visibility toggle flag controlling the floating background color modal grid */
  const [isColorOpen, setIsColorOpen] = useState(false);
  /** Saved coordinates mapping the anchor location where the overlay mounts */
  const [dropdownCoords, setDialogCoords] = useState({ top: 0, left: 0 });
  /** Local reducer dispatcher used to force UI re-draw frames when updating nodes */
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // ==========================================
  // SELECTOR: BLOCK BACKGROUND ATTRIBUTES
  // ==========================================
  /**
   * Targets the parent block structure wrapper instead of character slices.
   * Tracks whether the row is a heading or paragraph and returns its custom fill color.
   */
  const activeBlockStyle = useEditorState({
    editor,
    selector: (ctx) => {
      const isHeading = ctx.editor.isActive("heading");
      const targetType = isHeading ? "heading" : "paragraph";
      return {
        type: targetType,
        backgroundColor:
          ctx.editor.getAttributes(targetType).backgroundColor || "transparent",
      };
    },
  });

  const { TEXTSTYLE } = useToolbarConfigs({
    editor,
    properties,
    darkMode,
  });

  // Extract the specific background array out of global configuration blueprints
  const backgroundGroup = TEXTSTYLE.find(
    (group) => group.name === "Background",
  ) ||
    (TEXTSTYLE[1] ? TEXTSTYLE[1] : TEXTSTYLE[0]) || {
      name: "Background",
      array: [],
    };

  // ==========================================
  // COORDINATE CALCULATION INTERACTION
  // ==========================================
  /** Opens the selector grid, saving its location coordinates underneath the button */
  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isColorOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDialogCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
    setIsColorOpen((prev) => !prev);
  };

  /** Click Dismiss Handler: Dismisses open color windows when clicking outside */
  useEffect(() => {
    const closeMenu = () => setIsColorOpen(false);
    if (isColorOpen) {
      window.addEventListener("click", closeMenu);
    }
    return () => window.removeEventListener("click", closeMenu);
  }, [isColorOpen]);

  return (
    <div className="flex items-center justify-between w-full select-none font-sans antialiased py-1">
      {/* ==========================================
          TRIGGER ELEMENT: CURRENT STYLE INDICATOR
          ========================================== */}
      <div
        ref={triggerRef}
        onMouseDown={toggleDropdown}
        className={`flex items-center justify-between flex-1 max-w-full ml-2 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all duration-150 text-sm font-medium
        ${
          darkMode
            ? "bg-[#1f1f22] border-zinc-800 text-zinc-300 hover:bg-zinc-800/80 hover:border-zinc-700"
            : "bg-zinc-50/50 border-zinc-200 text-zinc-700 hover:bg-zinc-100/70 hover:border-zinc-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Active color preview swatch block indicator */}
          <span
            className="w-4 h-4 rounded border border-zinc-300/40 shrink-0 shadow-sm"
            style={{
              backgroundColor: activeBlockStyle.backgroundColor,
            }}
          />
          <span className="truncate text-xs">Background</span>
        </div>
        <span
          className={`text-[9px] transition-transform duration-200 text-zinc-400 ml-1 ${isColorOpen ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </div>

      {/* ==========================================
          PORTAL LAYER: BACKGROUND SELECTION MENU
          ========================================== */}
      {isColorOpen &&
        createPortal(
          <div
            className={`fixed rounded-xl border shadow-2xl z-9999 max-h-64 overflow-y-auto p-1.5 scrollbar-thin w-56 flex flex-col gap-0.5 animate-in fade-in slide-in-from-top-1 duration-100
            ${
              darkMode
                ? "bg-[#19191a] border-zinc-800/80 text-zinc-200 shadow-black/50"
                : "bg-white border-zinc-200 text-zinc-700 shadow-zinc-300/30"
            }`}
            style={{
              top: dropdownCoords.top,
              left: dropdownCoords.left,
            }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent selection flashes inside editor tracking nodes
          >
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
              Background Color
            </div>

            {/* Render items by mapping individual configuration objects */}
            {backgroundGroup.array.map(
              (color: ToolbarColorItem, colorIdx: number) => {
                const normalizedHex =
                  color.hex === "transparent" || color.hex === "inherit"
                    ? "transparent"
                    : color.hex;

                // Test if loop iteration color matches current block hex attributes
                const isSelected =
                  activeBlockStyle.backgroundColor.toLowerCase() ===
                  normalizedHex.toLowerCase();

                return (
                  <button
                    key={colorIdx}
                    type="button"
                    className={`h-7 w-full px-2 flex items-center justify-between cursor-pointer transition-colors duration-75 rounded-md font-medium text-left outline-none
                  ${
                    darkMode
                      ? "hover:bg-zinc-800/60 text-zinc-300 hover:text-white focus:bg-zinc-800/60"
                      : "hover:bg-zinc-100/70 text-zinc-600 hover:text-zinc-900 focus:bg-zinc-100/70"
                  }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      const nodeType = activeBlockStyle.type;
                      const targetBg =
                        color.hex === "transparent" || color.hex === "inherit"
                          ? null
                          : color.hex.toLowerCase();

                      // Commit background color configuration directly into block structural nodes
                      editor
                        .chain()
                        .focus()
                        .updateAttributes(nodeType, {
                          backgroundColor: targetBg,
                        })
                        .run();

                      // Refresh interfaces and close portal sheets safely
                      forceUpdate();
                      setIsColorOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Color Option Identity Swatch Circle */}
                      <div
                        className={`w-4 h-4 border rounded transition-colors shrink-0
                      ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}
                        style={{
                          backgroundColor: normalizedHex,
                        }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </div>

                    {/* Active target verification marker */}
                    {isSelected && (
                      <span className="text-xs text-blue-500 font-bold pr-1">
                        ✓
                      </span>
                    )}
                  </button>
                );
              },
            )}
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SortableDropdown;
