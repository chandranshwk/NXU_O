import React from "react";
import { FaPencilAlt } from "react-icons/fa";
import { FiSliders } from "react-icons/fi";

interface props {
  darkMode: boolean;
}

const RightColoumn: React.FC<props> = ({ darkMode }) => {
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
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <FiSliders className="w-3.5 h-3.5" /> Hot Keys for App
      </h3>
      {sidebarShortcuts.map((item) => (
        <div
          key={item.label}
          className={`p-5 rounded-2xl border transition-all duration-150 flex flex-col gap-3 ${
            darkMode
              ? "bg-[#1c1c1e] border-zinc-800 text-zinc-100 shadow-lg shadow-black/20"
              : "bg-white border-zinc-100 text-zinc-800 shadow-sm shadow-zinc-200/50"
          }`}
        >
          {/* 2. PRIMARY TITLE */}
          <div className="relative flex items-center justify-between w-full">
            {/* The line itself */}
            <div className="absolute inset-x-0 border-t border-dashed border-zinc-200" />

            {/* The items with z-index and background to hide the line */}
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

          <div className="relative flex items-center justify-between w-full">
            <span
              className={`relative z-10 pl-2 text-xs  ${!darkMode ? "bg-white text-zinc-400" : "bg-[#1c1c1e] text-zinc-500"}`}
            >
              {item.description}
            </span>
          </div>

          {/* 4. SEPARATOR LINE */}
          <div
            className={`border-t my-1 ${darkMode ? "border-zinc-800/60" : "border-zinc-100"}`}
          />

          {/* 5. INTERACTIVE FOOTER ROW */}
          <div className="flex items-center justify-between mt-0.5">
            {/* Hotkey Keycap Badges Grouped on Bottom Left */}

            <div className="flex items-center gap-1.5">
              {item.keys.map((key, idx) => (
                <kbd
                  key={idx}
                  className="h-9 px-3 rounded-md flex items-center justify-center bg-[#45a9f5] text-white shadow-[0_2px_0_#2b8cd7] font-sans text-xs font-semibold select-none border-b border-white/20 min-w-"
                >
                  {key}
                </kbd>
              ))}

              {/* Fluent Editing Pen Trigger Button */}
              <button
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

            {/* Counter Icon Nodes on Bottom Right */}

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

export default RightColoumn;
