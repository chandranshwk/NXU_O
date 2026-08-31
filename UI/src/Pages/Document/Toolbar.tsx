/**
 * @file Toolbar.tsx (Snippet 1)
 * @component Toolbar
 * @description The structural document toolbar for the notebook workspace.
 * Combines dropdown font loaders, custom size controls, text and background highlight color
 * picker swatches, and inline text formatting action blocks into a sticky top control rail.
 *
 * @architecture
 * - Collects application preference settings via the shared `useSettings` context hook.
 * - Extracts inline character style flags directly from global text monitors via `useEditorContext`.
 * - Employs a decoupled structure supporting both traditional form selects and grid swatches.
 */

import React from "react";
import { BiBrush, BiEraser, BiLayer, BiShapePolygon } from "react-icons/bi";
import { BsCrosshair, BsCursor, BsHandIndexThumb } from "react-icons/bs";
import { GrClear } from "react-icons/gr";
import { LuLassoSelect } from "react-icons/lu";
import { MdOutlineWidgets } from "react-icons/md";
import { FaHighlighter } from "react-icons/fa";
import { PiTextAUnderline } from "react-icons/pi";

import { useSettings } from "../../contexts/settingsContext";
import { useEditorContext } from "../../contexts/editorContext";
import { ToolbarDropdown } from "../../components/ToolBarDropdown";

import { formatName } from "../../assets/functions";
import { checkIsActive, COLORS, FONTS } from "../../assets/assets";
import { getEditorTools } from "../../assets/Tools";
import { ColorNames, HighLighterNames } from "../../assets/Utils";

interface ToolProps {
  /** The unique key name identifying the purpose of the action tool */
  name: CanvasToolName;
  /** Graphic visual snippet element bound to the menu button container */
  icon: React.ReactNode;
  /** Optional activation command executed when tapping the action button */
  exec?: () => void;
}

export type CanvasToolName =
  | "Select"
  | "Sketch"
  | "Erase"
  | "Widget"
  | "Clear"
  | "Center"
  | "Selection"
  | "Z-Layer"
  | "Shape"
  | "Pan";

const Toolbar = () => {
  const setting = useSettings();
  const context = useEditorContext();
  /** Extracts rich formatting text item data mappings directly out of shared asset registries */
  const ELEMENTS = getEditorTools("rich", context);

  const darkMode = setting.darkMode;
  const activeCanvasTool = context.activeCanvasTool || "Select";

  /** Config array defining mock action handles and graphic icon snippets for whiteboards */
  const tool: ToolProps[] = [
    {
      name: "Select",
      icon: <BsCursor />,
      exec: () => console.log("Select mode"),
    },
    {
      name: "Selection",
      icon: <LuLassoSelect />,
      exec: () => console.log("Lasso mode"),
    },
    {
      name: "Sketch",
      icon: <BiBrush />,
      exec: () => console.log("Sketch mode"),
    },
    {
      name: "Erase",
      icon: <BiEraser />,
      exec: () => console.log("Erase mode"),
    },
    {
      name: "Pan",
      icon: <BsHandIndexThumb />,
      exec: () => console.log("Pan viewport"),
    },
    {
      name: "Center",
      icon: <BsCrosshair />,
      exec: () => console.log("Recenter view"),
    },
    {
      name: "Shape",
      icon: <BiShapePolygon />,
      exec: () => console.log("Shape tool"),
    },
    {
      name: "Widget",
      icon: <MdOutlineWidgets />,
      exec: () => console.log("Widget menu"),
    },
    {
      name: "Z-Layer",
      icon: <BiLayer />,
      exec: () => console.log("Layer stack"),
    },
    {
      name: "Clear",
      icon: <GrClear className="text-red-500" />,
      exec: () => console.log("Clear drawings"),
    },
  ];

  // ==========================================
  // VISUAL COMPILER HELPER CLASS BUILDERS
  // ==========================================
  /** Generates button layout style rules based on active selection state indicators */
  const getBtnClass = (isActive: boolean) => {
    if (isActive) {
      return "bg-blue-600 text-white font-semibold shadow-md";
    }
    return darkMode
      ? "hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200"
      : "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900";
  };

  const selectDropdownClass = `text-sm cursor-pointer rounded-md px-3 py-1.5 outline-none font-medium transition-colors ${
    darkMode
      ? "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-100"
      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
  }`;

  const resetBtnClass = `w-full text-left text-xs px-2 py-1.5 rounded border-t mt-1 transition-colors ${
    darkMode
      ? "hover:bg-zinc-800 border-zinc-800 text-zinc-400"
      : "hover:bg-zinc-200 border-zinc-200 text-zinc-600"
  }`;

  return (
    <div
      className={`w-full h-14 flex items-center justify-center gap-2 px-4 border-b transition-colors duration-200 ${
        darkMode
          ? "bg-zinc-950 border-zinc-800 text-zinc-200"
          : "bg-white border-zinc-200 text-zinc-800"
      }`}
    >
      {/* ==========================================
          DROPDOWN MODULE 1: GLOBAL FONT FAMILY SELECTION
          ========================================== */}
      <div className="flex items-center">
        <select
          value={setting.defaultFont}
          onChange={(e) => setting.setDefaultFont(e.target.value)}
          className={selectDropdownClass}
        >
          {FONTS.map((font, idx) => (
            <option key={idx} value={font}>
              {formatName(font)}
            </option>
          ))}
        </select>
      </div>

      {/* ==========================================
          DROPDOWN MODULE 2: FONT SIZE PIXEL SELECTOR
          ========================================== */}
      <div className="flex items-center mr-2">
        <select
          value={setting.defaultFontSize}
          onChange={(e) => setting.setDefaultFontSize(e.target.value)}
          className={selectDropdownClass}
        >
          {/* Dynamically build option rows from 1px up to 100px values */}
          {Array.from({ length: 100 }, (_, i) => i + 1).map((size) => (
            <option key={size} value={`${size}px`}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* ==========================================
          SWATCH DROPDOWN 3: INLINE FONT TEXT COLOR
          ========================================== */}
      <ToolbarDropdown
        type="blocks" // Displays a compact icon matrix grid format
        title="Text Color"
        darkMode={darkMode}
        icon={
          <PiTextAUnderline
            size={18}
            color={context.textColor || (darkMode ? "#ffffff" : "#000000")}
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
        {/* Reset Action: Erases text styles back to theme default conditions */}
        <button
          type="button"
          onClick={() => {
            if (context.editor) {
              // 1. Wipe custom color inline style parameters from the document node selection tree
              context.editor
                .chain()
                .focus()
                .setMark("textStyle", { color: "" })
                .updateAttributes("textStyle", { color: null })
                .run();

              // 2. Fall back cleanly to application default theme color variables
              context.setTextColor(
                setting.defaultColor || (darkMode ? "#fff" : "#000"),
              );
            }
          }}
          className={resetBtnClass}
        >
          Reset Text Color
        </button>
      </ToolbarDropdown>

      {/* ==========================================
          SWATCH DROPDOWN 4: CHARACTER BACKGROUND HIGHLIGHT
          ========================================== */}
      <ToolbarDropdown
        type="blocks"
        title="Highlight Color"
        darkMode={darkMode}
        icon={
          <FaHighlighter
            size={16}
            color={
              context.highlightedColor || (darkMode ? "#ffffff" : "#000000")
            }
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
        {/* Reset Action: Wipes active mark textures back to full transparency */}
        <button
          type="button"
          onClick={() => {
            if (context.editor) {
              context.editor.chain().focus().unsetBackgroundColor().run();
              context.setHighlightedColor("");
            }
          }}
          className={resetBtnClass}
        >
          Reset Highlight
        </button>
      </ToolbarDropdown>

      {/* Vertical boundary layout partition line */}
      <div
        className={`w-px h-6 mx-2 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* ==========================================
          INLINE BUTTON TRACK 5: FORMATTING ELEMENT MODIFIERS
          ========================================== */}
      <div className="flex items-center gap-1">
        {ELEMENTS.map((el, idx) => {
          const isActive = checkIsActive(el.name, context);
          return (
            <button
              key={idx}
              type="button"
              title={el.name}
              aria-label={el.name}
              className={`p-2 rounded transition-colors duration-150 outline-none ${
                isActive
                  ? "bg-blue-500 text-white shadow-inner font-semibold"
                  : `${darkMode ? "hover:bg-white hover:text-black" : "hover:bg-zinc-950 hover:text-white"}`
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

      {/* Vertical partitioning layout line */}
      <div
        className={`w-px h-6 mx-2 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* ==========================================
          TRACK SYSTEM A: RICH TEXT FORMATTING BUTTONS LOOP
          ========================================== */}
      <div className="flex items-center gap-1">
        {ELEMENTS.map((el, idx) => {
          const isActive = checkIsActive(el.name, context);
          return (
            <button
              key={idx}
              type="button"
              title={el.name}
              aria-label={el.name}
              className={`p-2 rounded transition-colors duration-150 outline-none ${
                isActive
                  ? "bg-blue-500 text-white shadow-inner font-semibold"
                  : `${darkMode ? "hover:bg-white hover:text-black" : "hover:bg-zinc-950 hover:text-white"}`
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

      {/* Vertical partitioning layout line */}
      <div
        className={`w-px h-6 mx-2 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* ==========================================
          TRACK SYSTEM B: WHITEBOARD SPATIAL CONTROL BUTTONS LOOP
          ========================================== */}
      <div className="flex items-center gap-1">
        {tool.map((item, idx) => {
          // Verify if the loop item matches the canvas tool currently selected by the user
          const isToolActive = activeCanvasTool === item.name;

          // Switch contrast styles depending on theme conditions when item is toggled active
          const activeStyle = isToolActive
            ? darkMode
              ? "bg-zinc-100 text-zinc-950 shadow-md font-semibold"
              : "bg-zinc-900 text-white shadow-md font-semibold"
            : getBtnClass(false);

          return (
            <div
              key={idx}
              className="relative group flex items-center justify-center"
            >
              {/* Spatial Action Trigger Button */}
              <button
                type="button"
                onClick={() => {
                  context.setActiveCanvasTool(item.name);
                  if (item.exec) item.exec(); // Execute the dummy action handle if mapped
                }}
                title={item.name}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-base transition-all duration-150 outline-none ${activeStyle}`}
              >
                {item.icon}
              </button>

              {/* ==========================================
                  INTERFACE ACCENT: FLOATING HOVER TOOLTIP
                  ========================================== */}
              <span
                className={`text-[10px] tracking-wide pointer-events-none hidden group-hover:block absolute px-2 py-1 rounded shadow-md top-10 whitespace-nowrap z-50 transition-colors ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                    : "bg-zinc-900 text-zinc-100"
                }`}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Toolbar;
