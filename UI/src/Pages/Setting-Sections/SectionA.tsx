import { Cards } from "../../components/Cards";
import { FiFolder, FiSliders } from "react-icons/fi";
import type { settingsContextType } from "../../contexts/settingsContext";
import type { SetStateAction } from "react";
import { open as openTauriDialog } from "@tauri-apps/plugin-dialog";
import { formatName } from "../../assets/functions";

interface props {
  darkMode: boolean;
  settings: settingsContextType;
  autoSaveDelay: number;
  setAutoSaveDelay: React.Dispatch<SetStateAction<number>>;
}

interface TauriFilePath {
  path: string;
}

const SectionA: React.FC<props> = ({
  darkMode,
  settings,
  autoSaveDelay,
  setAutoSaveDelay,
}) => {
  const handleFolderSelect = async (): Promise<void> => {
    try {
      const selectedPath = await openTauriDialog({
        directory: true,
        multiple: false,
      });

      if (!selectedPath) return;

      let cleanPathString = "";

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

  const type = ["Dark Mode", "Light Mode", "System-Settings"];
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 px-1">
        <FiSliders className="w-3.5 h-3.5" /> Storage & Backup Operations
      </h3>

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

      {/* POWERTOYS HORIZONTAL CARD 1: AUTO SAVE DELAY SLIDER */}
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

      {/* POWERTOYS HORIZONTAL CARD 2: DEFAULT EXPORT FOLDER */}
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
        {/* The Path Container */}

        {/* The Action Button */}
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
