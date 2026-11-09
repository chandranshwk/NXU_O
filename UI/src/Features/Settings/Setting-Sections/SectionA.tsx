/**
 * @file SectionA.tsx
 * @component SectionA
 * @description The configurations panel for data safety and desktop preferences.
 * Manages core workspace behaviors including window theme selection selectors, background data
 * auto-save timers, and native directory directory mapping anchors.
 *
 * @architecture
 * - Leverages the reusable layout template engine `<Cards />` to bundle rows.
 * - Bridges desktop filesystem calls with a custom FileExplorerModal.
 * - Computes and converts local milliseconds slider values directly to parent state seconds parameters.
 */

import { useState } from "react";
import { Cards } from "../../../components/UI/Cards";
import { FiFolder, FiSliders, FiCode } from "react-icons/fi";
import type { settingsContextType } from "../../../contexts/settingsContext";
import type { SetStateAction } from "react";
import { formatName } from "../../../Lib/functions";
import { FileExplorerModal } from "../../../components/Modals/FileExplorerModal";
import { CustomLanguageModal } from "../../IDE/CustomLanguageModal"; // <-- IMPORT MODAL

interface props {
  /** Shared dark mode setting flag used to switch interface style rules */
  darkMode: boolean;
  /** Global settings layout containing fallback saving paths and timers */
  settings: settingsContextType;
  /** Tracks active debounce milliseconds value currently selected on screens */
  autoSaveDelay: number;
  /** Dispatch modifier tracking active background delay changes */
  setAutoSaveDelay: React.Dispatch<SetStateAction<number>>;
}

/**
 * @component SectionA
 * @description Renders preference options managing workspace appearance variables,
 * slider entry fields, and folder loader actions.
 */
const SectionA: React.FC<props> = ({
  darkMode,
  settings,
  autoSaveDelay,
  setAutoSaveDelay,
}) => {
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState(false); // <-- NEW STATE

  /** Local configuration listing mapping layout dropdown theme parameters */
  const type = ["Dark Mode", "Light Mode", "System-Settings"];

  return (
    <div className="flex flex-col gap-2">
      {/* Category Section Group Label Title */}
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <FiSliders className="w-3.5 h-3.5" /> Storage & Backup Operations
      </h3>

      {/* ==========================================
          ROW OPTION 1: THEME SELECTION DROPDOWN
          ========================================== */}
      <Cards
        type="normal"
        title="Workspace Theme"
        description="Select the Mode of the app."
        darkMode={darkMode}
      >
        <select
          value={settings.systemView}
          onChange={(e) => {
            const type = e.target.value;
            settings.setSystemView(type);
          }}
          className={`text-xs px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 "
              : "bg-zinc-50 border-zinc-300 "
          }`}
        >
          {type.map((type, idx) => (
            <option value={type} key={idx}>
              {formatName(type)}
            </option>
          ))}
        </select>
      </Cards>

      {/* ==========================================
          ROW OPTION 2: DEBOUNCE AUTO-SAVE SLIDER
          ========================================== */}
      <Cards
        type="normal"
        title="Auto-Save Interceptor Delay"
        description="Adjust the debounce timer before Tauri writes file states down to local app storage."
        darkMode={darkMode}
      >
        <input
          type="range"
          min="500"
          max="3000"
          step="250"
          value={autoSaveDelay}
          onChange={(e) => {
            const nextDelayMs = Number(e.target.value);
            const nextTimerSeconds = nextDelayMs / 1000;

            setAutoSaveDelay(nextDelayMs);
            settings.setSaveTimer(nextTimerSeconds);
          }}
          className="w-28 accent-blue-500 cursor-pointer h-1 rounded-lg bg-zinc-700"
        />
        <span className="text-xs font-mono w-12 text-right text-zinc-400">
          {autoSaveDelay}ms
        </span>
      </Cards>

      {/* ==========================================
          ROW OPTION 3: EXPORT DIRECTORY PATH EXPLORER
          ========================================== */}
      <Cards
        type="normal"
        title="Global Export Directory"
        description={
          <div className="font-mono text-xs text-zinc-500 mt-1 select-all truncate max-w-70">
            {settings.defaultSavingFolder || "No folder selected"}
          </div>
        }
        darkMode={darkMode}
      >
        <button
          type="button"
          className={`text-xs flex items-center gap-3 px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer transition-colors ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
              : "bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
          onClick={() => setIsExplorerOpen(true)}
        >
          <FiFolder className="w-3.5 h-3.5" /> Browse
        </button>
      </Cards>

      {/* ==========================================
          ROW OPTION 4: CUSTOM LANGUAGES
          ========================================== */}
      <Cards
        type="normal"
        title="Custom Languages"
        description="Add your own compiler or interpreter to the Code IDE."
        darkMode={darkMode}
      >
        <button
          type="button"
          className={`text-xs w-max flex items-center gap-3 px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer transition-colors ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700"
              : "bg-zinc-50 border-zinc-300 text-zinc-700 hover:bg-zinc-100"
          }`}
          onClick={() => setIsLangModalOpen(true)}
        >
          <FiCode className="w-3.5 h-3.5" /> Manage Languages
        </button>
      </Cards>

      {/* MODALS */}
      <FileExplorerModal
        isOpen={isExplorerOpen}
        onClose={() => setIsExplorerOpen(false)}
        onSelectFolder={(path) => settings.setDefaultSavingFolder(path)}
        darkMode={darkMode}
      />

      <CustomLanguageModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        onSuccess={() => {
          // Optional: show a toast or console log here
          console.log("Custom language added successfully!");
        }}
        darkMode={darkMode}
      />
    </div>
  );
};

export default SectionA;
