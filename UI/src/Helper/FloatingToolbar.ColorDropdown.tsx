// ColorDropdown.tsx
import React, { useState, useReducer } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  useToolbarConfigs,
  type EditorProperties,
} from "./FloatingToolbar.data";

interface ColorDropdownProps {
  editor: Editor;
  properties: EditorProperties;
  darkMode: boolean;
}

const ColorDropdown: React.FC<ColorDropdownProps> = ({
  editor,
  properties,
  darkMode,
}) => {
  // 1. Tie into the live selection state. This guarantees that whenever a style changes,
  // this component captures it instantly and updates the "A" trigger badge dynamically.
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

  const [isColorOpen, setIsColorOpen] = useState(false);
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <div className="relative inline-block select-none font-sans antialiased text-xs w-max">
      {/* Sleek Trigger Button */}
      <div
        className={`flex items-center gap-1.5 px-1 py-1 rounded-lg border cursor-pointer transition-colors duration-100 font-medium
        ${
          darkMode
            ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          setIsColorOpen(!isColorOpen);
        }}
      >
        <span
          className="font-semibold text-sm px-1 py-0 flex items-center justify-center rounded-sm"
          style={{
            // Reads from the active selection hook for real-time reactivity
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

      {/* Styled Dropdown Menu matching the image viewport layout */}
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

            // Match active comparison targets cleanly from baseline editor instance data
            const currentActiveValue = isTextGroup
              ? activeSelection.color
              : activeSelection.backgroundColor;

            return (
              <div key={groupIdx} className="flex flex-col">
                {/* Header Label (Text / Background) */}
                <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wide select-none">
                  {group.name}
                </div>

                {group.array.map((color, colorIdx) => {
                  // Normalized default check evaluation matching text and background options
                  const normalizedHex = isTextGroup
                    ? color.hex
                    : color.hex === "transparent" || color.hex === "inherit"
                      ? "transparent"
                      : color.hex;

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
                        e.preventDefault(); // Retains Tiptap text target highlight selections intact

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

                        // Forces React to re-evaluate editor.getAttributes() immediately on click
                        forceUpdate();
                        setIsColorOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Boxed 'A' Layout Indicator */}
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

                      {/* Right Aligned Selection Tick */}
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
