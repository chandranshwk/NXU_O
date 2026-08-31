/**
 * @file SectionC.tsx
 * @component SectionC
 * @description The configurations panel for global application keyboard shortcuts.
 * Loops through configurable macro commands (zen mode, canvas switches, view hotkeys)
 * and links edit buttons to the central key recording overlay menu.
 *
 * @architecture
 * - Renders a collection of preference elements via the reusable `<Cards />` layout wrapper.
 * - Parses system shortcut combinations (e.g. "Ctrl-Shift-K") into standalone `<kbd>` key-caps.
 * - Broadcasts layout references up to parent settings monitors to launch hotkey recording sessions.
 */

import React, { type SetStateAction } from "react";
import { FaPencilAlt, FaSubscript } from "react-icons/fa";
import { MdShortcut } from "react-icons/md";
import { Cards } from "../../components/Cards";
import { BiCommand } from "react-icons/bi";
import type { settingsContextType } from "../../contexts/settingsContext";
import {
  FiEdit3,
  FiFeather,
  FiFileText,
  FiMoon,
  FiTerminal,
  FiType,
} from "react-icons/fi";
import { LuFolderTree } from "react-icons/lu";
import { v4 as uuidv4 } from "uuid";

interface props {
  /** Shared dark mode setting flag used to switch visual palette states */
  darkMode: boolean;
  /** Global settings context tracking all active user-configured macro strings */
  settings: settingsContextType;
  /** State modifier showing or hiding the floating key-cap recorder modal overlay */
  setOpenKeyEditor: React.Dispatch<SetStateAction<boolean>>;
  /** State modifier forwarding the name of the target hotkey being adjusted */
  setTitleEditor: React.Dispatch<SetStateAction<string>>;
  /** State modifier loading active hotkey combinations into recording buffers */
  setKeys: React.Dispatch<SetStateAction<string>>;
}

/**
 * @component SectionC
 * @description Compiles hotkey metadata entries, handles uppercase formatting strings,
 * and connects click triggers to launch the shortcut editor.
 */
const SectionC: React.FC<props> = ({
  darkMode,
  settings,
  setOpenKeyEditor,
  setTitleEditor,
  setKeys,
}) => {
  /** Static collection indexing available system macro actions, descriptors, and design icons */
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
      label: "Folder Explorer Open Formatting",
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
    {
      label: "Switch to Text Mode",
      keys: settings.textModeShortcut,
      description:
        "Activates the standard rich text editor canvas for standard document writing, paragraphs, and list entries.",
      icon: (
        <FiType className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
      ),
    },
    {
      label: "Switch to Canvas Mode",
      keys: settings.canvasModeShortcut,
      description:
        "Toggles the infinite sketchpad layer to draw shapes, annotate lines, and position floating elements seamlessly over text entries.",
      icon: (
        <FiFeather className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
      ),
    },
    {
      label: "Toggle Zen Mode",
      keys: settings.zenModeShortcut,
      description:
        "Toggles the zen mode for a distraction-free writing experience.",
      icon: (
        <FiMoon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200" />
      ),
    },
  ];
  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Category Section Group Label Title */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <MdShortcut className="w-3.5 h-3.5" /> Activation Shortcuts
      </h3>

      {/* Loop and render individual card lines */}
      {sidebarShortcuts.map((item) => {
        const uniqueRowKey = `row-${uuidv4()}`;
        return (
          <Cards
            key={uniqueRowKey}
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
            {/* ==========================================
                RIGHT CARD RAIL: RENDERED HOTKEY KEY-CAP BADGES
                ========================================== */}
            <div className="flex items-center gap-1.5">
              {item.keys.split("-").map((key, idx) => (
                <kbd
                  key={idx}
                  className="h-9 px-3 rounded-md flex items-center justify-center bg-[#45a9f5] text-white shadow-[0_2px_0_#2b8cd7] font-sans text-xs font-semibold select-none border-b border-white/20 min-w-"
                >
                  {/* Capitalize first characters of text keys safely */}
                  {key.charAt(0).toLocaleUpperCase() +
                    key.substring(1, key.length)}
                </kbd>
              ))}

              {/* Action trigger: Launch shortcut recording modal pane */}
              <button
                type="button"
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
        );
      })}
    </div>
  );
};

export default SectionC;
