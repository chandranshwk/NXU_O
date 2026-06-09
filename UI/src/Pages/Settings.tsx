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

  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  // Local state tracking placeholders for our PowerToys controls
  const [autoSaveDelay, setAutoSaveDelay] = useState<number>(
    settings.saveTimer * 1000,
  );
  const [marginPreset, setMarginPreset] = useState<string>("compact");
  const [openKeyEditor, setOpenKeyEditor] = useState<boolean>(false);

  const [titleEditor, setTitleEditor] = useState<string>("");

  const [keys, setKeys] = useState<string>("");
  const [newKeys, setNewKeys] = useState<string[]>([]);

  useEffect(() => {
    // Guard clause: Don't execute if the user hasn't pressed any new keys yet
    if (newKeys.length === 0) return;

    const normalizedTitle = titleEditor.toLowerCase();

    const newShortCut = newKeys.join("-");
    console.log("Newly generated string:", newShortCut);

    if (normalizedTitle === "open nxu_o key formatting") {
      settings.setOpenShortcut(newShortCut);
    } else if (normalizedTitle === "strike through formatting") {
      settings.setDefaultStrikeThroughShortcut(newShortCut);
    } else if (normalizedTitle === "notes view formatting") {
      settings.setNotesViewShortcut(newShortCut);
    } else if (normalizedTitle === "folder explorer open foramtting") {
      settings.setFolderExplorerShortcut(newShortCut);
    } else if (normalizedTitle === "scratchpad open formatting") {
      settings.setScratchpadOpenShortcut(newShortCut);
    } else if (normalizedTitle === "open command bar hotkey") {
      settings.setOpenCommandBarKeys(newShortCut);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewKeys([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newKeys, titleEditor]);

  return (
    <>
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
        <div className="absolute bottom-5 right-10 flex items-center gap-4 z-50 text-[10px] px-1.5 py-2 rounded font-mono font-medium bg-zinc-500/10 text-zinc-400">
          v1.0.0 NXU_O Engine
        </div>
        {/* Header */}
        <div
          className={`uppercase w-full z-20 h-max flex justify-center tracking-widest border-b py-5 font-semibold fixed top-0 shrink-0 ${
            darkMode
              ? "bg-[#18181b] text-zinc-100 border-zinc-800/80 shadow-lg shadow-zinc-950/20"
              : "bg-[#f4f4f5] text-zinc-800 border-zinc-200 shadow-sm shadow-zinc-200/20"
          }`}
        >
          Settings Panel
        </div>
        <div
          className={`w-[calc(50%+15rem)] mt-16 overflow-x-hidden relative left-[calc(15%+3rem)] border h-full flex-1 py-6 px-4 transition-all duration-200 overflow-y-auto ${
            darkMode
              ? "bg-[#18181b] text-zinc-100 border-zinc-800/80 shadow-zinc-950/40"
              : "bg-[#f4f4f5] text-zinc-800 border-zinc-200 shadow-zinc-200/50"
          }`}
        >
          {/* LEFT COLUMN: DENSE POWERTOYS ACTION CARD LISTING TRACK */}
          <div className="flex flex-col gap-6 font-sans w-full">
            {/* ================= SECTION A: DATA SAFETY & AUTOMATION ================= */}
            <SectionA
              darkMode={darkMode}
              autoSaveDelay={autoSaveDelay}
              setAutoSaveDelay={setAutoSaveDelay}
              settings={settings}
            />

            {/* ================= SECTION B: TYPOGRAPHY ENGINE ================= */}
            <SectionB darkMode={darkMode} settings={settings} />

            {/* ================= SECTION C: KEYBOARD SHORTCUTS MATRIX ================= */}
            <SectionC
              darkMode={darkMode}
              settings={settings}
              setKeys={setKeys}
              setOpenKeyEditor={setOpenKeyEditor}
              setTitleEditor={setTitleEditor}
            />

            {/* ================= SECTION D: INTERFACE WORKSPACE ================= */}
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
