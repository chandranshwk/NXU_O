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
  name: CanvasToolName;
  icon: React.ReactNode;
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
  const ELEMENTS = getEditorTools("rich", context);

  const darkMode = setting.darkMode;
  const activeCanvasTool = context.activeCanvasTool || "Select";

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

  // Shared utility function to compute dynamic style states cleanly
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
      {/* Font Family Dropdown */}
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

      {/* Font Size Dropdown */}
      <div className="flex items-center mr-2">
        <select
          value={setting.defaultFontSize}
          onChange={(e) => setting.setDefaultFontSize(e.target.value)}
          className={selectDropdownClass}
        >
          {Array.from({ length: 100 }, (_, i) => i + 1).map((size) => (
            <option key={size} value={`${size}px`}>
              {size}px
            </option>
          ))}
        </select>
      </div>

      {/* Text Color Picker Dropdown */}
      <ToolbarDropdown
        type="blocks"
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

              // 2. Fall back cleanly to your application default theme color variables
              // (Matches the exact default tracking values you pass inside your main EditorDoc file)
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

      {/* Text Highlighter Picker Dropdown */}
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
        <button
          type="button"
          onClick={() => {
            if (context.editor) {
              context.editor.chain().focus().unsetBackgroundColor().run();
              context.setHighlightedColor(""); // Highlights go back to a completely blank string (transparent)
            }
          }}
          className={resetBtnClass}
        >
          Reset Highlight
        </button>
      </ToolbarDropdown>

      {/* Structural Separator */}
      <div
        className={`w-px h-6 mx-2 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* Rich Text Elements Blocks Array Loop */}
      <div className="flex items-center gap-1">
        {ELEMENTS.map((el, idx) => {
          const isActive = checkIsActive(el.name, context);
          return (
            <button
              key={idx}
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

      {/* Structural Separator */}
      <div
        className={`w-px h-6 mx-2 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* Native Canvas Actions Blocks Array Loop */}
      <div className="flex items-center gap-1">
        {tool.map((item, idx) => {
          const isToolActive = activeCanvasTool === item.name;
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
              <button
                onClick={() => {
                  context.setActiveCanvasTool(item.name);
                  if (item.exec) item.exec();
                }}
                title={item.name}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-base transition-all duration-150 outline-none ${activeStyle}`}
              >
                {item.icon}
              </button>

              {/* Tooltip Overlay */}
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
