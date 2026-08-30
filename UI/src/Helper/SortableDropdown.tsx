// src/components/SortableDropdown.tsx
import React, { useState, useReducer, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  useToolbarConfigs,
  type EditorProperties,
} from "./FloatingToolbar.data";

// Explicitly type the individual color object parameters to clear implicit "any" warnings
interface ToolbarColorItem {
  name: string;
  hex: string;
}

interface SortableDropdownProps {
  editor: Editor;
  properties: EditorProperties;
  darkMode: boolean;
}

export const SortableDropdown: React.FC<SortableDropdownProps> = ({
  editor,
  properties,
  darkMode,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [dropdownCoords, setDialogCoords] = useState({ top: 0, left: 0 });
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  // Tie into active parent block node level attributes (NOT inline text spans)
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

  // FIXED: Explicitly isolate the background group block, falling back to a structured object literal
  // if find() returns undefined to guarantee TypeScript that the .array primitive is ALWAYS present.
  const backgroundGroup = TEXTSTYLE.find(
    (group) => group.name === "Background",
  ) ||
    (TEXTSTYLE[1] ? TEXTSTYLE[1] : TEXTSTYLE[0]) || {
      name: "Background",
      array: [],
    };

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

  useEffect(() => {
    const closeMenu = () => setIsColorOpen(false);
    if (isColorOpen) {
      window.addEventListener("click", closeMenu);
    }
    return () => window.removeEventListener("click", closeMenu);
  }, [isColorOpen]);

  return (
    <div className="flex items-center justify-between w-full select-none font-sans antialiased py-1">
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
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
              Background Color
            </div>

            {/* FIXED: Explicitly typed color and colorIdx parameters to clear the ts7006 implicit "any" errors */}
            {backgroundGroup.array.map(
              (color: ToolbarColorItem, colorIdx: number) => {
                const normalizedHex =
                  color.hex === "transparent" || color.hex === "inherit"
                    ? "transparent"
                    : color.hex;

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

                      editor
                        .chain()
                        .focus()
                        .updateAttributes(nodeType, {
                          backgroundColor: targetBg,
                        })
                        .run();

                      forceUpdate();
                      setIsColorOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 border rounded transition-colors shrink-0
                      ${darkMode ? "border-zinc-800" : "border-zinc-200"}`}
                        style={{
                          backgroundColor: normalizedHex,
                        }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </div>

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
