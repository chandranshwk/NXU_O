/**
 * @file SimpleToolBar.tsx
 * @component SimpleToolBar
 * @description The layout orchestrator for the main text formatting toolbar.
 * Combines button arrays, color swatches, background highlighter grids, size fields,
 * and font pickers into a unified control rail.
 *
 * @architecture
 * - Scrapes default tool elements dynamically via the `getEditorTools` layout asset utility.
 * - Computes button activation indicators using a centralized conditional switch branch map.
 * - Wraps isolated palette grid items inside individual `<ToolbarDropdown />` chassis modules.
 */

import React, { useEffect, useState } from "react";
import { getEditorTools } from "../Config/Tools";
import type { editorContextType } from "../editorContext";
import { ToolbarDropdown } from "./ToolBarDropdown";
import { IoTextOutline } from "react-icons/io5";
import { formatName } from "../../../Lib/functions";
import { PiTextAUnderline } from "react-icons/pi";
import TablePickerDropdown from "./TablePickerDropdown";
import { FaHighlighter } from "react-icons/fa";
import { COLORS, FONTS } from "../../../assets/assets";
import { ColorNames, FontNames, HighLighterNames } from "../Config/Utils";

interface props {
  darkMode: boolean;
  type: "simple" | "rich";
  size: "small" | "full";
  context: editorContextType;
}

const SimpleToolBar: React.FC<props> = ({ darkMode, type, size, context }) => {
  const ELEMENTS = getEditorTools(type, context);
  const [fSize, setSize] = useState<string>(context.fontSize);

  useEffect(() => {
    if (context.fontSize) {
      queueMicrotask(() => setSize(context.fontSize));
    }
  }, [context.fontSize]);

  if (!context) return null;

  const checkIsActive = (name: string): boolean => {
    switch (name) {
      case "Bold":
        return context.isBold;
      case "Italic":
        return context.isItalic;
      case "Underline":
        return context.isUnderline;
      case "Strikethrough":
        return context.isStrikethrough;
      case "Bullet List":
        return context.isBulletList;
      case "Ordered List":
        return context.isOrderedList;
      case "Blockquote":
        return context.isBlockquote;
      case "Code Block":
        return context.isCodeBlock;
      case "Left Align":
        return context.alignment === "left";
      case "Center Align":
        return context.alignment === "center";
      case "Right Align":
        return context.alignment === "right";
      case "Heading 1":
        return context.isHeading(1);
      case "Heading 2":
        return context.isHeading(2);
      case "Heading 3":
        return context.isHeading(3);
      default:
        return false;
    }
  };

  const renderTools = () => {
    // We only want specific tools in the simple toolbar matching the photo
    const allowedTools = [
      "Bold",
      "Italic",
      "Underline",
      "Strikethrough",
      "Left Align",
      "Center Align",
      "Right Align",
      "Ordered List",
      "Bullet List",
      "Heading 1",
      "Heading 2",
      "Heading 3",
    ];
    return ELEMENTS.filter((el) => allowedTools.includes(el.name)).map(
      (el, idx) => {
        const isActive = checkIsActive(el.name);
        return (
          <button
            key={idx}
            title={el.name}
            onClick={() => el.onClick(context.editor!, context)}
            className={`p-1.5 rounded-md transition-colors ${
              isActive
                ? "bg-indigo-500 text-white shadow-sm"
                : darkMode
                  ? "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            <div className="w-4 h-4 flex items-center justify-center text-[15px]">
              {el.icon}
            </div>
          </button>
        );
      },
    );
  };

  return (
    <div
      className={`
        flex items-center gap-1 py-1.5 px-2 select-none outline-none transition-all
        ${darkMode ? "bg-[#18181b] text-zinc-300 border-zinc-800" : "bg-white text-zinc-800 border-zinc-200"}
        rounded-xl border shadow-sm
      `}
    >
      {/* 1. Text Color */}
      <ToolbarDropdown
        type="blocks"
        title="Text Color"
        darkMode={darkMode}
        icon={
          <PiTextAUnderline
            size={18}
            color={context.textColor || (darkMode ? "#fff" : "#000")}
          />
        }
      >
        {COLORS.map((color, idx) => (
          <ColorNames
            key={idx}
            darkMode={darkMode}
            color={color}
            context={context}
            total={COLORS.length - 1}
            idx={idx}
          />
        ))}
      </ToolbarDropdown>

      {/* 2. Highlight */}
      <ToolbarDropdown
        type="blocks"
        title="Highlight"
        darkMode={darkMode}
        icon={
          <FaHighlighter
            size={16}
            color={context.highlightedColor || (darkMode ? "#fff" : "#000")}
          />
        }
      >
        {COLORS.map((color, idx) => (
          <HighLighterNames
            key={idx}
            darkMode={darkMode}
            color={color}
            context={context}
            total={COLORS.length - 1}
            idx={idx}
          />
        ))}
      </ToolbarDropdown>

      {/* 3. Font Size */}
      <input
        type="text"
        value={fSize.replace("px", "")}
        onChange={(e) => setSize(e.target.value + "px")}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const val = parseInt(fSize, 10);
            if (!isNaN(val)) {
              context.editor?.chain().focus().setFontSize(`${val}px`).run();
              context.setFontSize(`${val}px`);
            }
            e.currentTarget.blur();
          }
        }}
        className={`w-10 text-center text-xs py-1 rounded-md border outline-none transition-colors ${
          darkMode
            ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700 focus:border-indigo-500"
            : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 focus:border-indigo-500"
        }`}
      />

      {/* 4. Font Family */}
      <ToolbarDropdown
        type="col"
        width="w-max"
        title="Font Family"
        darkMode={darkMode}
        icon={
          <div
            className={`flex items-center gap-2 px-2 py-1 rounded-md border text-xs min-w-[80px] ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}
          >
            <IoTextOutline size={14} className="opacity-50" />
            <span className="truncate">{formatName(context.font)}</span>
          </div>
        }
      >
        {FONTS.map((font, idx) => (
          <FontNames
            key={idx}
            darkMode={darkMode}
            font={font}
            context={context}
          />
        ))}
      </ToolbarDropdown>

      <div
        className={`w-px h-5 mx-1 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* 5. Table */}
      <TablePickerDropdown darkMode={darkMode} editor={context.editor!} />

      <div
        className={`w-px h-5 mx-1 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* 6. Formatting & Alignments & Headings */}
      <div className="flex items-center gap-0.5">{renderTools()}</div>
    </div>
  );
};

export default SimpleToolBar;
