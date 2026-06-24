import React, { useEffect, useState } from "react";
import { getEditorTools } from "../assets/Tools";
import type { editorContextType } from "../contexts/editorContext";
import { ToolbarDropdown } from "./ToolBarDropdown";
import { IoTextOutline } from "react-icons/io5";
import { formatName } from "../assets/functions";
import { PiTextAUnderline } from "react-icons/pi";
import TablePickerDropdown from "./TablePickerDropdown";
import { FaHighlighter } from "react-icons/fa";
import { COLORS, FONTS } from "../assets/assets";

interface props {
  darkMode: boolean;
  type: "simple" | "rich";
  size: "small" | "full";
  context: editorContextType;
}

// 🎨 SUB-COMPONENT A: TEXT COLOR PICKER ACTIONS
const ColorNames = ({
  darkMode,
  color,
  context,
  total,
  idx,
}: {
  darkMode: boolean;
  color: string;
  context: editorContextType;
  idx: number;
  total: number;
}) => {
  return (
    <button
      onClick={() => {
        context.editor?.chain().focus().setColor(color).run();
        context.setTextColor(color);
      }}
      className={`size-10 flex items-center justify-center text-xs p-1  rounded-md ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } transition-all duration-150`}
    >
      <PiTextAUnderline
        color={idx === total ? (darkMode ? "#ffffff" : "#000000") : color}
        size={22}
      />
    </button>
  );
};

const HighLighterNames = ({
  darkMode,
  color,
  context,
  total,
  idx,
}: {
  darkMode: boolean;
  color: string;
  context: editorContextType;
  idx: number;
  total: number;
}) => {
  return (
    <button
      onClick={() => {
        // 🚀 COMPLIANT ATOMIC CALLS: Mutates TipTap data trees and syncs string token variables
        context.editor?.chain().focus().setHighlight({ color }).run();
        context.setHighlightedColor(color);
      }}
      className={`size-10 flex items-center justify-center text-xs p-1 rounded-md ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } transition-all duration-150`}
    >
      <PiTextAUnderline
        color={idx === total ? (darkMode ? "#ffffff" : "#000000") : color}
        size={22}
      />
    </button>
  );
};

// 🔤 SUB-COMPONENT C: FONTS SELECTOR ACTIONS
const FontNames = ({
  darkMode,
  font,
  context,
}: {
  darkMode: boolean;
  font: string;
  context: editorContextType;
}) => {
  return (
    <button
      onClick={() => {
        context.editor?.chain().focus().setFontFamily(font).run();
        context.setFont(font);
      }}
      style={{ fontFamily: font }}
      className={`w-full text-xs px-2 py-1.5 rounded outline-none ${
        darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
      } text-left font-sans`}
    >
      {formatName(font)}
    </button>
  );
};

// =========================================================================
// MAIN WORKSPACE TOOLBAR CONTROLLER LAYOUT
// =========================================================================
const SimpleToolBar: React.FC<props> = ({ darkMode, type, size, context }) => {
  const ELEMENTS = getEditorTools(type, context);

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
      case "Heading 4":
        return context.isHeading(4);
      case "Heading 5":
        return context.isHeading(5);
      case "Heading 6":
        return context.isHeading(6);
      default:
        return false;
    }
  };

  const [fSize, setSize] = useState<string>(context.fontSize);

  useEffect(() => {
    if (context.fontSize) {
      queueMicrotask(() => {
        setSize(context.fontSize);
      });
    }
  }, [context.fontSize]);

  if (!context) return null;

  return (
    <div
      className={`
        flex flex-1  items-center justify-center gap-3 py-1.5 px-3 select-none outline-none transition-all duration-200
        ${
          darkMode
            ? "bg-[#121211] text-zinc-100 border-zinc-800/80 shadow-zinc-950/40"
            : "bg-zinc-100 text-zinc-800 border-zinc-200 shadow-zinc-200/50"
        } 
        ${
          size === "small"
            ? "w-max rounded-lg border my-2 mb-0 shadow-sm backdrop-blur-md"
            : "w-full border-b"
        }
      `}
    >
      {/* DROPDOWN 1: UNIQUE TEXT COLOR OPTIONS */}
      <ToolbarDropdown
        type="blocks"
        icon={
          <div className="flex items-center justify-center p-0.5">
            <PiTextAUnderline
              size={18}
              color={
                context.textColor !== ""
                  ? context.textColor
                  : darkMode
                    ? "#ffffff"
                    : "#000000"
              }
            />
          </div>
        }
        title="Text Color"
        darkMode={darkMode}
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
        <button
          onClick={() => {
            context.editor?.chain().focus().unsetColor().run();
            context.setTextColor("");
          }}
          className={`w-full text-left text-xs px-2 py-1.5 rounded border-t mt-1 transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 border-zinc-800 text-zinc-400"
              : "hover:bg-zinc-200 border-zinc-200 text-zinc-600"
          }`}
        >
          Reset Text Color
        </button>
      </ToolbarDropdown>

      {/* DROPDOWN: UNIQUE HIGHLIGHTER MARKER OPTIONS */}
      <ToolbarDropdown
        type="blocks"
        icon={
          <div className="flex items-center justify-center p-0.5">
            <FaHighlighter
              size={18}
              color={
                context.highlightedColor !== ""
                  ? context.highlightedColor
                  : darkMode
                    ? "#ffffff"
                    : "#000000"
              }
            />
          </div>
        }
        title="Text Color"
        darkMode={darkMode}
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
        <button
          onClick={() => {
            context.editor?.chain().focus().unsetHighlight().run();
            context.setHighlightedColor("");
          }}
          className={`w-full text-left text-xs px-2 py-1.5 rounded border-t mt-1 transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 border-zinc-800 text-zinc-400"
              : "hover:bg-zinc-200 border-zinc-200 text-zinc-600"
          }`}
        >
          Reset Highlight
        </button>
      </ToolbarDropdown>

      <input
        type="text"
        value={fSize}
        onChange={(e) => {
          setSize(e.target.value);
        }}
        onKeyDown={(e) => {
          // Check if the user pressed the Enter key
          if (e.key === "Enter") {
            // 1. Sanitize the string input to get raw numeric input digits
            const numericValue = parseInt(fSize);

            // 2. Fallback check if the string contains no parseable numbers
            if (isNaN(numericValue)) return;

            const sizeString = `${numericValue}px`;

            // 3. Fire the execution chain cleanly to context and editor canvas
            context.editor?.chain().focus().setFontSize(sizeString).run();
            context.setFontSize(sizeString);

            // 4. Optional: Blur the input field to remove active keyboard focus
            e.currentTarget.blur();
          }
        }}
        // Prevent focus-stealing conflicts with the underlying text canvas
        onMouseDown={(e) => e.stopPropagation()}
        className={`w-12 text-xs font-medium text-center py-1 px-1.5 rounded border outline-none transition-colors ${
          darkMode
            ? "bg-zinc-900 border-zinc-800 text-zinc-200 focus:border-zinc-600"
            : "bg-slate-50 border-slate-200 text-slate-700 focus:border-slate-400"
        }`}
      />

      {/* CONTAINER LAYER 3: THE TYPOGRAPHY FONT PICKER DROPDOWN */}
      <ToolbarDropdown
        type="col"
        icon={
          <div
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md border text-zinc-400 gap-3 min-w-30 transition-colors ${
              darkMode
                ? "bg-zinc-900 border-zinc-800 text-zinc-200 hover:border-zinc-700"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
            style={{ fontFamily: context.font }}
          >
            {/* Left Icon and Text Label container block */}
            <div className="flex items-center gap-2">
              <IoTextOutline className="text-sm opacity-60" />
              <span className="text-xs font-medium tracking-wide">
                {formatName(context.font)}
              </span>
            </div>

            {/* A tiny subtle dropdown indicator arrow layout decoration */}
            <span className="text-[10px] opacity-40">▼</span>
          </div>
        }
        width="w-max h-4"
        title="Font Family"
        darkMode={darkMode}
      >
        {FONTS.map((font, idx) => (
          <div key={idx}>
            <FontNames darkMode={darkMode} font={font} context={context} />
          </div>
        ))}
        <button
          onClick={() => {
            context.editor?.chain().focus().unsetFontFamily().run();
            context.setFont("sans-serif");
          }}
          className="w-full text-xs px-2 py-1.5 rounded hover:bg-zinc-800 text-left text-zinc-500 border-t border-zinc-800 mt-1"
        >
          Default Font
        </button>
      </ToolbarDropdown>

      <TablePickerDropdown darkMode={darkMode} editor={context.editor!} />
      {ELEMENTS.map((el, idx) => {
        const isActive = checkIsActive(el.name);
        return (
          <button
            key={idx}
            title={el.name}
            aria-label={el.name}
            className={`p-2 rounded transition-colors duration-150 outline-none ${
              isActive
                ? "bg-blue-500 text-white shadow-inner font-semibold"
                : `${darkMode ? "hover:bg-white hover:text-black" : "hover:bg-zinc-950 hover:text-white"} text-zinc-400`
            }`}
            onClick={() => {
              el.onClick(context.editor!, context);
            }}
          >
            <div className="w-4 h-4 flex items-center justify-center text-base">
              {el.icon}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SimpleToolBar;
