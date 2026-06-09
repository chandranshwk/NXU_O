import React, { type SetStateAction } from "react";
import { FaPencilAlt, FaSubscript } from "react-icons/fa";
import { MdShortcut } from "react-icons/md";
import { Cards } from "../../components/Cards";
import { BiCommand } from "react-icons/bi";
import type { settingsContextType } from "../../contexts/settingsContext";
import { FiEdit3, FiFileText, FiTerminal } from "react-icons/fi";
import { LuFolderTree } from "react-icons/lu";

interface props {
  darkMode: boolean;
  settings: settingsContextType;
  setOpenKeyEditor: React.Dispatch<SetStateAction<boolean>>;
  setTitleEditor: React.Dispatch<SetStateAction<string>>;
  setKeys: React.Dispatch<SetStateAction<string>>;
}

const SectionC: React.FC<props> = ({
  darkMode,
  settings,
  setOpenKeyEditor,
  setTitleEditor,
  setKeys,
}) => {
  const sidebarShortcuts = [
    {
      label: "Open NXU_O Key Formatting",
      keys: settings.openShortcut,
      description:
        "Customize the shortcut to activate NXU_O throughout your computer",
      icon: <FiTerminal className="w-4 h-4" />,
    },
    {
      label: "Open Command Bar Hotkey",
      keys: settings.openCommandBarKeys,
      description: "Customize the shortcut to activate NXU_O's command bar.",
      icon: <BiCommand className="w-4 h-4" />,
    },
    {
      label: "Strike through Formatting",
      keys: settings.defaultStrikeThroughShortcut,
      description:
        "Customize the keyboard combination used to strike text lines.",
      icon: <FaSubscript className="w-4 h-4" />,
    },
    {
      label: "Notes View Formatting",
      keys: settings.notesViewShortcut,
      description:
        "Opens the document editor layout to create and manage markdown notes.",
      icon: <FiFileText className="w-4 h-4" />,
    },
    {
      label: "Folder Explorer Open Foramtting",
      keys: settings.folderExplorerShortcut,
      description:
        "Toggles the directory tree panel to browse workspaces and notebook groups.",
      icon: <LuFolderTree className="w-4 h-4" />,
    },
    {
      label: "Scratchpad Open Formatting",
      keys: settings.scratchpadOpenShortcut,
      description:
        "Brings up a floating overlay panel for quick, temporary text entries.",
      icon: <FiEdit3 className="w-4 h-4" />,
    },
  ];
  return (
    <div className="flex flex-col gap-2 mt-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <MdShortcut className="w-3.5 h-3.5" /> Activation Shortcuts
      </h3>

      {sidebarShortcuts.map((item, idx) => (
        <Cards
          key={idx}
          type="normal"
          title={item.label}
          description={item.description}
          darkMode={darkMode}
          icon={
            <div
              className={`p-2 rounded flex items-center justify-center ${darkMode ? "bg-zinc-800 text-zinc-300" : "bg-zinc-200 text-zinc-700"}`}
            >
              {item.icon}
            </div>
          }
        >
          <div className="flex items-center gap-1.5">
            {item.keys.split("-").map((key, idx) => (
              <kbd
                key={idx}
                className="h-9 px-3 rounded-md flex items-center justify-center bg-[#45a9f5] text-white shadow-[0_2px_0_#2b8cd7] font-sans text-xs font-semibold select-none border-b border-white/20 min-w-"
              >
                {key.charAt(0).toLocaleUpperCase() +
                  key.substring(1, key.length)}{" "}
                {/* Standard Microsoft Windows Fluent Logo Node */}
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
              onClick={() => {
                setOpenKeyEditor(true);
                setTitleEditor(item.label);
                setKeys(item.keys);
              }}
            >
              <FaPencilAlt className="w-3.5 h-3.5" />
            </button>
          </div>
        </Cards>
      ))}
    </div>
  );
};

export default SectionC;
