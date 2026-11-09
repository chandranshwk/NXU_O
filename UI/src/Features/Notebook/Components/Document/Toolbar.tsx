/**
 * @file Toolbar.tsx
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

import { useSettings } from "../../../../contexts/settingsContext";
import { useEditorContext } from "../../../Editor/editorContext";
import { ToolbarDropdown } from "../../../Editor/Components/ToolBarDropdown";
import TablePickerDropdown from "../../../Editor/Components/TablePickerDropdown";

import { formatName } from "../../../../Lib/functions";
import { checkIsActive, COLORS, FONTS } from "../../../../assets/assets";
import { getEditorTools } from "../../../Editor/Config/Tools";
import { ColorNames, HighLighterNames } from "../../../Editor/Config/Utils";
import { useCanvas } from "../../Canvas/Canvas/CanvasContext";
import { useWorkspaceStore } from "../../../../Store/store"; // <-- ADDED IMPORT
import WidgetDrop from "./WidgetDrop";

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
  const canvas = useCanvas();

  // ==========================================
  // Z-LAYER LOGIC (Bring to Front)
  // ==========================================
  const handleZLayer = () => {
    if (!canvas.selectedNodeId || !canvas.activePageId) {
      console.warn("Select a node first to change its layer.");
      return;
    }

    const store = useWorkspaceStore.getState();
    const activeNotebook = store.activeNotebook;
    if (!activeNotebook) return;

    // Directly update the store to move the selected node to the end of the array
    useWorkspaceStore.setState((state) => {
      const updatedNotebooks = state.notebooks.map((nb) => {
        if (nb.id !== activeNotebook.id) return nb;
        return {
          ...nb,
          pages: nb.pages.map((page) => {
            if (page.id !== canvas.activePageId) return page;

            const nodeIndex = page.nodes.findIndex(
              (n) => n.id === canvas.selectedNodeId,
            );
            if (nodeIndex === -1) return page;

            const newNodes = [...page.nodes];
            const [targetNode] = newNodes.splice(nodeIndex, 1);
            newNodes.push(targetNode); // Pushing to end renders it on top

            return { ...page, nodes: newNodes };
          }),
        };
      });
      return { notebooks: updatedNotebooks };
    });
  };

  const tool: ToolProps[] = [
    {
      name: "Select",
      icon: <BsCursor />,
      exec: () => {
        context.setActiveCanvasTool("Select");
      },
    },
    {
      name: "Selection",
      icon: <LuLassoSelect />,
      exec: () => console.log("Lasso mode"),
    },
    {
      name: "Sketch",
      icon: <BiBrush />,
      exec: () => {
        context.setActiveCanvasTool("Sketch");
      },
    },
    {
      name: "Erase",
      icon: <BiEraser />,
      exec: () => {
        context.setActiveCanvasTool("Erase");
      },
    },
    {
      name: "Pan",
      icon: <BsHandIndexThumb />,
      exec: () => {
        context.setActiveCanvasTool("Pan");
      },
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
      exec: () => {
        canvas.setWidgetOpen(!canvas.widgetOpen);
      },
    },
    {
      name: "Z-Layer",
      icon: <BiLayer />,
      exec: handleZLayer, // <-- WIRED UP HERE
    },
    {
      name: "Clear",
      icon: <GrClear className="text-red-500" />,
      exec: () => console.log("Clear drawings"),
    },
  ];

  const getBtnClass = (isActive: boolean) => {
    if (isActive) {
      return "bg-blue-600 text-white font-semibold shadow-md";
    }
    return darkMode
      ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
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
      className={`z-99999 w-full h-14 flex items-center justify-center gap-2 px-4 border-b transition-colors duration-200 ${
        darkMode
          ? "bg-zinc-950 border-zinc-800 text-zinc-200"
          : "bg-white border-zinc-200 text-zinc-800"
      }`}
    >
      {/* 1. Font Family */}
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

      {/* 2. Font Size */}
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

      {/* 3. Text Color */}
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
              context.editor
                .chain()
                .focus()
                .setMark("textStyle", { color: "" })
                .updateAttributes("textStyle", { color: null })
                .run();

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

      {/* 4. Highlight Color */}
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
              context.setHighlightedColor("");
            }
          }}
          className={resetBtnClass}
        >
          Reset Highlight
        </button>
      </ToolbarDropdown>

      {/* 5. Table Creator */}
      <div className="flex items-center ml-1">
        <TablePickerDropdown darkMode={darkMode} editor={context.editor!} />
      </div>

      {/* Vertical boundary layout partition line */}
      <div
        className={`w-px h-6 mx-2 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* 6. Formatting Elements */}
      <div className="flex items-center gap-1">
        {ELEMENTS.map((el, idx) => {
          const isActive = checkIsActive(el.name, context);
          return (
            <div
              className="relative group flex items-center justify-center"
              key={idx}
            >
              <button
                key={idx}
                type="button"
                title={el.name}
                className={`p-2 rounded transition-colors duration-150 outline-none group ${
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
              <span
                className={`text-[10px] tracking-wide pointer-events-none hidden group-hover:block absolute px-2 py-1 rounded shadow-md top-10 whitespace-nowrap z-50 transition-colors ${
                  darkMode
                    ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
                    : "bg-zinc-900 text-zinc-100"
                }`}
              >
                {el.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical partitioning layout line */}
      <div
        className={`w-px h-6 mx-2 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
      />

      {/* 7. Canvas Tools */}
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
                type="button"
                onClick={() => {
                  context.setActiveCanvasTool(item.name);
                  if (item.exec) item.exec();
                }}
                title={item.name}
                className={`w-8 h-8 flex items-center justify-center rounded-md text-base transition-all duration-150 outline-none ${activeStyle}`}
              >
                {item.icon}
              </button>

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

      {/* 8. Widget Drop (Passed darkMode) */}
      <WidgetDrop darkMode={darkMode} />
    </div>
  );
};

export default Toolbar;
