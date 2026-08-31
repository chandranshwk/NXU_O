/**
 * @file SectionA.tsx
 * @component SectionA
 * @description The configurations panel for data safety and desktop preferences.
 * Manages core workspace behaviors including window theme selection selectors, background data
 * auto-save timers, and native directory directory mapping anchors.
 *
 * @architecture
 * - Leverages the reusable layout template engine `<Cards />` to bundle rows.
 * - Bridges desktop filesystem calls with the Tauri native API layer via `@tauri-apps/plugin-dialog`.
 * - Computes and converts local milliseconds slider values directly to parent state seconds parameters.
 */

import { Cards } from "../../components/Cards";
import { FiFolder, FiSliders } from "react-icons/fi";
import type { settingsContextType } from "../../contexts/settingsContext";
import type { SetStateAction } from "react";
import { open as openTauriDialog } from "@tauri-apps/plugin-dialog";
import { formatName } from "../../assets/functions";

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

interface TauriFilePath {
  path: string;
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
  // ==========================================
  // TAURI LOCAL FILESYSTEM COMPILER HOOK
  // ==========================================
  /**
   * Spawns a native desktop directory explorer menu. Intercepts chosen parameters
   * and safely parses filesystem paths back down into root preferences variables.
   */
  const handleFolderSelect = async (): Promise<void> => {
    try {
      const selectedPath = await openTauriDialog({
        directory: true,
        multiple: false,
      });

      // Break execution sequence early if the window picker gets canceled
      if (!selectedPath) return;

      let cleanPathString = "";

      // Adaptable Type Check: Safely unwrap path fields across cross-platform dialogue shapes
      if (typeof selectedPath === "string") {
        cleanPathString = selectedPath;
      } else if (
        typeof selectedPath === "object" &&
        selectedPath !== null &&
        "path" in selectedPath
      ) {
        cleanPathString = (selectedPath as TauriFilePath).path;
      }

      if (cleanPathString) {
        settings.setDefaultSavingFolder(cleanPathString);
      }
    } catch (error) {
      console.error("Failed to select directory folder:", error);
    }
  };

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
        {/* Open native folder selector dial overlay panel */}
        <button
          className={`text-xs flex items-center gap-3 px-2.5 py-1.5 rounded border outline-none font-medium cursor-pointer ${
            darkMode
              ? "bg-zinc-800 border-zinc-700 text-zinc-200"
              : "bg-zinc-50 border-zinc-300 text-zinc-700"
          }`}
          onClick={handleFolderSelect}
        >
          <FiFolder className="w-3.5 h-3.5" /> Browse
        </button>
      </Cards>
    </div>
  );
};

export default SectionA;
