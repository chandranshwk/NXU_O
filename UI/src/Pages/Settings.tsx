/**
 * @file Settings.tsx
 * @component Settings
 * @description The main page for managing app preferences. It coordinates
 * localized states (like auto-save timers) with the central settings context
 * and handles custom hotkey reassignments.
 *
 * @architecture
 * - Reads and saves state using `src/contexts/settingsContext.tsx`.
 * - Divides options into four modular child components (SectionA to SectionD).
 * - Spawns a floating `<KeyEditor />` overlay to record new hotkeys.
 */

import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import KeyEditor from "../components/KeyEditor";
import SectionA from "./Setting-Sections/SectionA";
import SectionB from "./Setting-Sections/SectionB";
import SectionC from "./Setting-Sections/SectionC";
import SectionD from "./Setting-Sections/SectionD";
import { useSettings } from "../contexts/settingsContext";

export const Settings = () => {
  const settings = useSettings();

  /** Accesses the global dark mode state passed down from the App shell router */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  /** Tracks the live slider adjustments for the local save delay value */
  const [autoSaveDelay, setAutoSaveDelay] = useState<number>(
    settings.saveTimer * 1000,
  );

  /** Stores the active layout sizing rule (e.g., full width or compact) */
  const [marginPreset, setMarginPreset] = useState<string>("compact");

  /** Controls when the keybinding recorder overlay menu stays open */
  const [openKeyEditor, setOpenKeyEditor] = useState<boolean>(false);

  /** Holds the text title of the specific hotkey being actively edited */
  const [titleEditor, setTitleEditor] = useState<string>("");

  /** Stores the current key combination string to display inside the editor */
  const [keys, setKeys] = useState<string>("");

  /** Array holding raw keyboard inputs captured during an edit frame */
  const [newKeys, setNewKeys] = useState<string[]>([]);

  // ==========================================
  // ⌨️ SHORTCUT REASSIGNMENT SYNC ENGINE
  // ==========================================
  /**
   * Watches for new key arrays captured by KeyEditor. When received,
   * it converts the array into a dash-separated string (e.g., "Ctrl-Shift-K")
   * and maps it to the correct shortcut handler inside the central settings context.
   */
  useEffect(() => {
    // Stop execution if there are no new key sequences to process
    if (newKeys.length === 0) return;

    const normalizedTitle = titleEditor.toLowerCase();

    // Join the recorded layout keys into a unified config string
    const newShortCut = newKeys.join("-");

    // Route the string to the correct setting modifier matching the configuration name
    if (normalizedTitle === "open nxu_o key formatting") {
      settings.setOpenShortcut(newShortCut);
    } else if (normalizedTitle === "strike through formatting") {
      settings.setDefaultStrikeThroughShortcut(newShortCut);
    } else if (normalizedTitle === "notes view formatting") {
      settings.setNotesViewShortcut(newShortCut);
    } else if (normalizedTitle === "folder explorer open formatting") {
      settings.setFolderExplorerShortcut(newShortCut);
    } else if (normalizedTitle === "scratchpad open formatting") {
      settings.setScratchpadOpenShortcut(newShortCut);
    } else if (normalizedTitle === "open command bar hotkey") {
      settings.setOpenCommandBarKeys(newShortCut);
    } else if (normalizedTitle === "switch to text mode") {
      settings.setTextModeShortcut(newShortCut);
    } else if (normalizedTitle === "switch to canvas mode") {
      settings.setCanvasModeShortcut(newShortCut);
    } else if (normalizedTitle === "toggle zen mode") {
      settings.setZenModeShortcut(newShortCut);
    }

    // Flush the local array state to prepare for future key edits
    setTimeout(() => {
      setNewKeys([]);
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newKeys, titleEditor]);

  return (
    <>
      {/* KEYCAP INPUT CAPTURE LAYOVER WINDOW */}
      {openKeyEditor && (
        <KeyEditor
          darkMode={darkMode}
          keys={keys}
          titleEditor={titleEditor}
          setOpenKeyEditor={setOpenKeyEditor}
          setNewKeys={setNewKeys}
        />
      )}

      <div className="overflow-y-hidden">
        {/* Persistent engine version tag anchor decoration */}
        <div className="absolute bottom-5 right-10 flex items-center gap-4 z-50 text-[10px] px-1.5 py-2 rounded font-mono font-medium bg-zinc-500/10 text-zinc-400">
          v1.0.0 NXU_O Engine
        </div>

        {/* STICKY TOP BAR TITLE CARD */}
        <div
          className={`uppercase w-full z-20 h-max flex justify-center tracking-widest border-b py-5 font-semibold fixed top-0 shrink-0 ${
            darkMode
              ? "bg-[#141414] text-zinc-100 border-zinc-800/80 shadow-lg shadow-zinc-950/20"
              : "bg-[#f4f4f5] text-zinc-800 border-zinc-200 shadow-sm shadow-zinc-200/20"
          }`}
        >
          Settings Panel
        </div>

        {/* MAIN PANEL WORKSPACE CONTAINER */}
        <div
          className={`w-[calc(50%+15rem)] mt-16 overflow-x-hidden relative left-[calc(15%+3rem)] border h-full flex-1 py-6 px-4 transition-all duration-200 overflow-y-auto ${
            darkMode
              ? "bg-[#141414] text-zinc-100 border-zinc-800/80 shadow-zinc-950/40"
              : "bg-[#f4f4f5] text-zinc-800 border-zinc-200 shadow-zinc-200/50"
          }`}
        >
          <div className="flex flex-col gap-6 font-sans w-full">
            {/* SECTION A: Handles background data auto-saves, directories, and paths */}
            <SectionA
              darkMode={darkMode}
              autoSaveDelay={autoSaveDelay}
              setAutoSaveDelay={setAutoSaveDelay}
              settings={settings}
            />

            {/* SECTION B: Manages default fonts, line-splays, and baseline reading scales */}
            <SectionB darkMode={darkMode} settings={settings} />

            {/* SECTION C: Grid listing active hotkeys and triggers the input listener dialog */}
            <SectionC
              darkMode={darkMode}
              settings={settings}
              setKeys={setKeys}
              setOpenKeyEditor={setOpenKeyEditor}
              setTitleEditor={setTitleEditor}
            />

            {/* SECTION D: Adjusts canvas padding setups and handles cache wipes */}
            <SectionD
              darkMode={darkMode}
              setMarginPreset={setMarginPreset}
              marginPreset={marginPreset}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
