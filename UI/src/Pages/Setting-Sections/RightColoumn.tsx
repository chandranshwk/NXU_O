/**
 * @file RightColoumn.tsx
 * @component RightColumn
 * @description A side panel information card tracking application-wide navigation shortcuts.
 * It renders card items that match configuration settings to let users quickly look up
 * or re-bind hotkeys.
 *
 * @architecture
 * - Plugs in on the right edge of viewports alongside main settings sections.
 * - Employs absolute-positioned dashed borders to draw separator paths behind typography labels.
 * - Maps custom shortcuts down to styled `kbd` keycap badge component rows.
 */

import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import { FiSliders } from "react-icons/fi";

interface props {
  /** Shared dark mode setting flag used to toggle visual palette layouts */
  darkMode: boolean;
}

export const RightColumn: React.FC<props> = ({ darkMode }) => {
  /** Static collection defining app shortcut metadata parameters */
  const sidebarShortcuts = [
    {
      label: "Notes View",
      keys: ["Ctrl", "N"],
      metric: "24 Files",
      description:
        "Opens the document editor layout to create and manage markdown notes.",
    },
    {
      label: "Folder Explorer",
      keys: ["Ctrl", "F"],
      metric: "8 Groups",
      description:
        "Toggles the directory tree panel to browse workspaces and notebook groups.",
    },
    {
      label: "Scratchpad Layer",
      keys: ["Ctrl", "S"],
      metric: "Active",
      description:
        "Brings up a floating overlay panel for quick, temporary text entries.",
    },
  ];
  return (
    <div className="flex flex-col gap-4 font-sans w-sm overflow-hidden border-l pl-5 border-zinc-800/50 ">
      {/* Dynamic Header Label Sizing Section */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <FiSliders className="w-3.5 h-3.5" /> Hot Keys for App
      </h3>

      {/* Loop and draw configuration option cards */}
      {sidebarShortcuts.map((item) => (
        <div
          key={item.label}
          className={`p-5 rounded-2xl border transition-all duration-150 flex flex-col gap-3 ${
            darkMode
              ? "bg-[#1c1c1e] border-zinc-800 text-zinc-100 shadow-lg shadow-black/20"
              : "bg-white border-zinc-100 text-zinc-800 shadow-sm shadow-zinc-200/50"
          }`}
        >
          {/* ==========================================
              PRIMARY TITLE: DASHED BACKGROUND SEPARATOR ROW
              ========================================== */}
          <div className="relative flex items-center justify-between w-full">
            {/* The absolute dashed background vector path */}
            <div className="absolute inset-x-0 border-t border-dashed border-zinc-200" />

            {/* Typography items apply local backgrounds to overlap and mask the divider line */}
            <span
              className={`relative z-10 pr-2 font-medium  ${!darkMode ? "bg-white text-zinc-800" : "bg-[#1c1c1e] text-zinc-100"}`}
            >
              {item.label}
            </span>
            <span
              className={`relative z-10 pl-2 text-xs  ${!darkMode ? "bg-white text-zinc-400" : "bg-[#1c1c1e] text-zinc-500"}`}
            >
              {item.metric}
            </span>
          </div>

          {/* Description subtext explainer string */}
          <div className="relative flex items-center justify-between w-full">
            <span
              className={`relative z-10 pl-2 text-xs  ${!darkMode ? "bg-white text-zinc-400" : "bg-[#1c1c1e] text-zinc-500"}`}
            >
              {item.description}
            </span>
          </div>

          {/* Mid-card divider separation margin */}
          <div
            className={`border-t my-1 ${darkMode ? "border-zinc-800/60" : "border-zinc-100"}`}
          />

          {/* ==========================================
              INTERACTIVE FOOTER ROW: HOTKEYS & CONTROLS
              ========================================== */}
          <div className="flex items-center justify-between mt-0.5">
            {/* Left Box Cluster: Keyboard Keycap badging + Modification Triggers */}
            <div className="flex items-center gap-1.5">
              {item.keys.map((key, idx) => (
                <kbd
                  key={idx}
                  className="h-9 px-3 rounded-md flex items-center justify-center bg-[#45a9f5] text-white shadow-[0_2px_0_#2b8cd7] font-sans text-xs font-semibold select-none border-b border-white/20"
                >
                  {key}
                </kbd>
              ))}

              {/* Action shortcut edit pen trigger button */}
              <button
                type="button"
                className={`p-2 rounded-md ml-1 transition-colors ${
                  darkMode
                    ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    : "hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800"
                }`}
                title="Edit Shortcut"
              >
                <FaPencilAlt className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Right Box Cluster: Persistent identity metadata badge */}
            <span
              className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                darkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-400"
                  : "bg-zinc-50 border-zinc-200 text-zinc-500"
              }`}
            >
              Navigation Target
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RightColumn;
