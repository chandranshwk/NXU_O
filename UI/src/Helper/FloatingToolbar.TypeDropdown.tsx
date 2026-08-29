// TypeDropdown.tsx
import React, { useState, useEffect } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { useToolbarConfigs } from "./FloatingToolbar.data";

interface TypeDropdownProps {
  editor: Editor;
  darkMode: boolean;
}

export const TypeDropdown: React.FC<TypeDropdownProps> = ({
  editor,
  darkMode,
}) => {
  const [isTypeOpen, setIsTypeOpen] = useState(false);

  // 1. Pull the unified TYPES configurations structure straight out of your data file hook
  // We feed it an empty properties object signature since TYPES logic doesn't depend on inline formatting flags
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

  const [selectedType, setSelectedType] = useState(TYPES[0]);

  // 2. Track the live document cursor context to determine what node block layout is active
  const activeBlockId = useEditorState({
    editor,
    selector: (ctx) => {
      if (ctx.editor.isActive("paragraph")) return "paragraph";
      if (ctx.editor.isActive("blockquote")) return "blockquote";
      if (ctx.editor.isActive("bulletList")) return "bulletList";
      if (ctx.editor.isActive("orderedList")) return "orderedList";

      // Scrapes individual heading tiers H1-H6
      for (let i = 1; i <= 6; i++) {
        if (ctx.editor.isActive("heading", { level: i })) return `h${i}`;
      }
      return "paragraph";
    },
  });

  // 3. Keep the visible dropdown label synced cleanly when shifting positions using keyboard arrows
  useEffect(() => {
    const currentActiveBlock = TYPES.find((t) => t.id === activeBlockId);
    if (currentActiveBlock) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedType(currentActiveBlock);
    }
  }, [activeBlockId, TYPES]);

  return (
    <div className="relative inline-block w-44 select-none font-sans antialiased text-xs">
      {/* Trigger Button */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-sm transition-all duration-150 cursor-pointer
          ${
            darkMode
              ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800"
              : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          }`}
        onMouseDown={(e) => {
          e.preventDefault(); // Prevents Tiptap selection from dropping out of focus
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

      {/* Custom Dropdown Items Menu */}
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
                  e.preventDefault(); // Holds editor highlight target properties completely static
                  type.action(e);
                  setSelectedType(type);
                  setIsTypeOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`shrink-0 transition-colors ${isSelected ? "text-blue-500" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`}
                  >
                    {type.icon}
                  </div>
                  <div>{type.label}</div>
                </div>

                {/* Right-aligned checkmark indicating active block type */}
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
