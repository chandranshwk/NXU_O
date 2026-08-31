/**
 * @file TablePickerDropdown.tsx
 * @component TablePickerDropdown
 * @description A 2D grid matrix table creator menu item. It monitors mouse trajectory
 * coordinates over an adjustable 10x10 matrix grid to insert structured,
 * multi-column markdown data tables into the active text editor.
 *
 * @architecture
 * - Leverages the reusable `<ToolbarDropdown />` layout blueprint frame.
 * - Manages an independent cell hover look-ahead state to update selection badges.
 * - Dispatches transactional node operations straight into TipTap via `insertTable`.
 */

import { useState } from "react";
import { MdGridOn } from "react-icons/md";
import { ToolbarDropdown } from "./ToolBarDropdown";
import type { Editor } from "@tiptap/core";

interface TablePickerDropdownProps {
  /** Shared dark mode setting flag used to adjust layout colors */
  darkMode: boolean;
  /** Active TipTap core text engine receiving table layout inserts */
  editor: Editor;
}

/**
 * @component TablePickerDropdown
 * @description Houses hover calculations, the dynamic 2D structural button element array matrix,
 * and text engine command dispatches.
 */
const TablePickerDropdown: React.FC<TablePickerDropdownProps> = ({
  darkMode,
  editor,
}) => {
  /** Tracks active dimension offsets bounded directly underneath mouse trajectory paths */
  const [hoveredGrid, setHoveredGrid] = useState<{
    rows: number;
    cols: number;
  }>({ rows: 0, cols: 0 });

  /** Defines the boundary allocation map limit to compile a 10x10 selector grid */
  const GRID_SIZE = 10;
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
        // Flush highlighted states instantly whenever the pointer breaks grid boundaries
        onMouseLeave={() => setHoveredGrid({ rows: 0, cols: 0 })}
      >
        {/* ==========================================
            HEADER INDICATOR: ACTIVE DIMENSION TAG
            ========================================== */}
        <div className="text-[10px] font-semibold text-zinc-400 tracking-wide uppercase px-0.5">
          Insert Table{" "}
          {hoveredGrid.rows > 0
            ? `(${hoveredGrid.rows} × ${hoveredGrid.cols})`
            : ""}
        </div>

        {/* ==========================================
            DYNAMIC 2D INTERACTIVE INTERSECTION GRID
            ========================================== */}
        <div className="flex flex-col gap-1 w-max">
          {rowsArray.map((rowNum) => (
            <div key={rowNum} className="flex gap-1">
              {colsArray.map((colNum) => {
                // Verify if this specific matrix index lies inside currently highlighted cells
                const isHighlighted =
                  rowNum <= hoveredGrid.rows && colNum <= hoveredGrid.cols;

                return (
                  <button
                    key={colNum}
                    type="button"
                    // Continuously update highlighting coordinates on pointer move frames
                    onMouseEnter={() =>
                      setHoveredGrid({ rows: rowNum, cols: colNum })
                    }
                    onClick={() => {
                      // Fire structural cell properties directly down into text canvases
                      editor
                        ?.chain()
                        .focus()
                        .insertTable({
                          rows: rowNum,
                          cols: colNum,
                          withHeaderRow: true, // Automatically appends the initial formatting header segment
                        })
                        .run();
                    }}
                    className={`w-6 h-6 rounded-md border transition-all duration-75 outline-none ${
                      isHighlighted
                        ? "bg-blue-500 border-blue-600 scale-95 shadow-inner"
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

        {/* ==========================================
            ACTION SUB-FOOTER RECONCILER NOTIFICATION
            ========================================== */}
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
