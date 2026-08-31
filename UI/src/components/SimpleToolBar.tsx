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
import { getEditorTools } from "../assets/Tools";
import type { editorContextType } from "../contexts/editorContext";
import { ToolbarDropdown } from "./ToolBarDropdown";
import { IoTextOutline } from "react-icons/io5";
import { formatName } from "../assets/functions";
import { PiTextAUnderline } from "react-icons/pi";
import TablePickerDropdown from "./TablePickerDropdown";
import { FaHighlighter } from "react-icons/fa";
import { COLORS, FONTS } from "../assets/assets";
import { ColorNames, FontNames, HighLighterNames } from "../assets/Utils";

interface props {
  /** Shared dark mode setting flag used to toggle UI themes */
  darkMode: boolean;
  /** Configuration filter sorting whether to load lightweight or fully loaded tool arrays */
  type: "simple" | "rich";
  /** Sizing variant rule determining full width bar extensions vs compact floating layout panels */
  size: "small" | "full";
  /** Shared text context manager holding editor instances and styling triggers */
  context: editorContextType;
}

/**
 * @component SimpleToolBar
 * @description Renders the formatting bar, synchronizes state indicators, and pipes
 * typography, font color, selection grid highlighting, and dimension commands down to TipTap.
 */
const SimpleToolBar: React.FC<props> = ({ darkMode, type, size, context }) => {
  /** Extracts functional metadata button arrays tailored matching formatting mode configs */
  const ELEMENTS = getEditorTools(type, context);

  // ==========================================
  // LOOK-UP VALUE STATUS ACTIVATION TRAP
  // ==========================================
  /**
   * Compares incoming button identities with active editor context variables,
   * returning flags used to light up matching interface items.
   */
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

  /** Local state tracking current text input inside the font size entry box */
  const [fSize, setSize] = useState<string>(context.fontSize);

  // ==========================================
  // LIFECYCLE: SIZE SELECTION SYNCHRONIZER
  // ==========================================
  /**
   * Uses low-priority microtask loops to sync local size variables with external
   * text changes, preventing typing latency inside the text editor pane.
   */
  useEffect(() => {
    if (context.fontSize) {
      queueMicrotask(() => {
        setSize(context.fontSize);
      });
    }
  }, [context.fontSize]);

  // Structural Render Guard: Prevent draw actions if active connection hooks clear out
  if (!context) return null;

  return (
    <div
      className={`
        flex items-center justify-center gap-3 py-1.5 px-3 select-none outline-none transition-all duration-200
        ${
          darkMode
            ? "bg-[#121211] text-zinc-100 border-zinc-800/80 shadow-zinc-950/40"
            : "bg-zinc-100 text-zinc-800 border-zinc-200 shadow-zinc-200/50"
        } 
        ${
          size === "small"
            ? "w-full rounded-lg  flex-1 border my-2 mb-0 shadow-sm backdrop-blur-md"
            : "w-full border-b rounded-lg"
        }
      `}
    >
      {/* ==========================================
          DROPDOWN 1: TEXT COLOR SELECTOR GRID
          ========================================== */}
      <ToolbarDropdown
        type="blocks" // Displays a compact icon matrix layout grid format
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
        {/* Reset Action: Erases text styles back to theme default conditions */}
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

      {/* ==========================================
          DROPDOWN 2: HIGHLIGHTER BACKGROUND SELECTOR
          ========================================== */}
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
        {/* Reset Action: Clear custom background textures back to transparency bounds */}
        <button
          onClick={() => {
            context.editor?.chain().focus().unsetBackgroundColor().run();
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

      {/* ==========================================
          INPUT BLOCK 3: NUMERIC FONT SIZE BOX FIELD
          ========================================== */}
      <input
        type="text"
        value={fSize}
        onChange={(e) => {
          setSize(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const numericValue = parseInt(fSize, 10);
            if (isNaN(numericValue)) return;

            const sizeString = `${numericValue}px`;

            // Commit sizing variables directly down to text highlight layers
            context.editor?.chain().focus().setFontSize(sizeString).run();
            context.setFontSize(sizeString);

            // Strip active keyboard cursor focus to complete inputs cleanly
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

      {/* ==========================================
          DROPDOWN 4: TYPOGRAPHY FAMILY SELECTION RAIL (FONTS)
          ========================================== */}
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
