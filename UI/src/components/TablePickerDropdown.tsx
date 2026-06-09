import { useState } from "react";
import { MdGridOn } from "react-icons/md";
import { ToolbarDropdown } from "./ToolBarDropdown";
import type { Editor } from "@tiptap/core";

// ... Inside your SimpleToolBar or as an independent helper component layout:
const TablePickerDropdown = ({
  darkMode,
  editor,
}: {
  darkMode: boolean;
  editor: Editor;
}) => {
  // 1. TRACK STATE: Store the live row-by-column coordinates under the cursor pointer
  const [hoveredGrid, setHoveredGrid] = useState<{
    rows: number;
    cols: number;
  }>({ rows: 0, cols: 0 });

  const GRID_SIZE = 10; // Builds a high-density 5x5 dynamic allocation layout selector matrix
  const rowsArray = Array.from({ length: GRID_SIZE }, (_, r) => r + 1);
  const colsArray = Array.from({ length: GRID_SIZE }, (_, c) => c + 1);

  return (
    <ToolbarDropdown
      type="col"
      icon={
        <div
          className={`p-2 rounded transition-colors w-max duration-150 outline-none ${darkMode ? "hover:bg-white" : "hover:bg-zinc-950"}  text-zinc-400`}
        >
          <MdGridOn
            className={`size-full ${darkMode ? "group-hover:text-black" : "group-hover:text-white"} `}
          />
        </div>
      }
      width="size-max"
      wDropDown="w-75.5 px-3"
      title="Insert Table"
      darkMode={darkMode}
    >
      <div
        className="flex flex-col gap-2 font-sans select-none w-max"
        onMouseLeave={() => setHoveredGrid({ rows: 0, cols: 0 })}
      >
        {/* Header Display Tracker Sizing Tag */}
        <div className="text-[10px] font-semibold text-zinc-400 tracking-wide uppercase px-0.5">
          Insert Table{" "}
          {hoveredGrid.rows > 0
            ? `(${hoveredGrid.rows} × ${hoveredGrid.cols})`
            : ""}
        </div>

        {/* 📊 THE 2D INTERACTIVE SELECTION GRID LAYER */}
        <div className="flex flex-col gap-1 w-max">
          {rowsArray.map((rowNum) => (
            <div key={rowNum} className="flex gap-1">
              {colsArray.map((colNum) => {
                // 2. MATRIX FILTER VALUE: Check if this specific cell is trapped within active highlighted boundaries
                const isHighlighted =
                  rowNum <= hoveredGrid.rows && colNum <= hoveredGrid.cols;

                return (
                  <button
                    key={colNum}
                    // Capture hover matrices dynamically on mouse trackover events
                    onMouseEnter={() =>
                      setHoveredGrid({ rows: rowNum, cols: colNum })
                    }
                    onClick={() => {
                      // 3. EXECUTE CHANNELS: Fire structural elements straight into your TipTap text engine canvas
                      editor
                        ?.chain()
                        .focus()
                        .insertTable({
                          rows: rowNum,
                          cols: colNum,
                          withHeaderRow: true,
                        })
                        .run();
                    }}
                    className={`w-6 h-6 rounded-md border transition-all duration-75 outline-none ${
                      isHighlighted
                        ? "bg-blue-500 border-blue-600 scale-95 shadow-inner" // Premium blue lit selector states
                        : darkMode
                          ? "bg-zinc-800 border-zinc-700/80 hover:border-zinc-500"
                          : "bg-zinc-50 border-zinc-200 hover:border-zinc-400"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Optional Action Sub-Footer Options */}
        <div
          className={`text-[10px] text-zinc-500 border-t pt-1.5 mt-1.5 px-0.5 font-medium ${darkMode ? "border-zinc-800" : "border-slate-100"}`}
        >
          Edit Table options available inside selection...
        </div>
      </div>
    </ToolbarDropdown>
  );
};

export default TablePickerDropdown;
