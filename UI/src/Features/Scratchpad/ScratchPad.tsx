/**
 * @file ScratchPad.tsx
 * @component ScratchPad
 * @description The main page for the scratchpad writing area. It loads a
 * fast-switching tab header for separate drafts alongside a lightweight
 * version of the core text editor.
 *
 * @architecture
 * - Binds the shared editor state via `<EditorProvider>`.
 * - Binds the document storage state via `<ScratchProvider>`.
 * - Combines `<Pages />` (tab switcher) and `<SimpleToolBar />` into a single top menu bar.
 */

import { useOutletContext } from "react-router-dom";
import {
  FiFileText,
  FiClock,
  FiCheckCircle,
  FiSave,
  FiDownload,
} from "react-icons/fi";
import SimpleToolBar from "../Editor/Components/SimpleToolBar";
import EditorDoc from "../Editor/Components/EditorDoc";
import { EditorProvider, useEditorContext } from "../Editor/editorContext";
import Pages from "./Pages";
import { ScratchProvider, useScratchContext } from "./scratchContext";
import { SCRATCHPAD_STEPS } from "../../Tours/pageTours";
import { useTourAutoStart } from "../../Hooks/useTourAutoStart";

const ScratchPadContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const context = useEditorContext();
  const settings = useScratchContext();

  useTourAutoStart({
    storageKey: "nxuo-tour-scratchpad-v1",
    steps: SCRATCHPAD_STEPS,
    enabled: settings.activeSlots.length > 0 && !settings.loading,
  });

  const wordCount = settings.info
    ? settings.info
        .replace(/<[^>]+>/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;

  const handleSave = () => {
    const event = new KeyboardEvent("keydown", { key: "s", ctrlKey: true });
    window.dispatchEvent(event);
  };

  return (
    // DARK/GREY DESK BACKGROUND
    <div
      className={`h-full flex flex-col font-sans transition-colors ${!darkMode ? "bg-zinc-100" : "bg-[#09090b]"}`}
    >
      {/* HEADER (Tabs + Actions) */}
      <div
        className={`flex flex-col shrink-0 z-30 ${darkMode ? "bg-[#121214]" : "bg-white"}`}
      >
        <div className="px-2 h-11 flex items-center border-b border-zinc-400/50">
          <Pages
            darkMode={darkMode}
            allPads={settings.allPads}
            setAllPads={settings.setAllPads}
            activeSlots={settings.activeSlots}
            setActiveSlots={settings.setActiveSlots}
          />
        </div>

        <div className="px-8 py-3 flex items-center justify-between gap-4 max-w-4xl w-full mx-auto">
          <div className="flex items-center gap-4">
            <h1
              className={`text-xl font-bold tracking-tight ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}
            >
              {settings.activeSlots[settings.activeSlot]?.name || "Untitled"}
            </h1>
            <div
              className={`flex items-center gap-3 pl-4 border-l text-[11px] font-medium ${darkMode ? "border-zinc-800 text-zinc-500" : "border-zinc-200 text-zinc-500"}`}
            >
              <span className="flex items-center gap-1.5">
                <FiFileText size={12} /> {wordCount} words
              </span>
              <span
                className={`flex items-center gap-1.5 ${settings.saveStatus === "Saving..." ? "text-amber-500" : "text-emerald-500"}`}
              >
                {settings.saveStatus === "Saving..." ? (
                  <FiClock size={12} />
                ) : (
                  <FiCheckCircle size={12} />
                )}
                {settings.saveStatus || "Saved"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md border transition-all ${darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800" : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-sm"}`}
            >
              <FiSave size={12} /> Save
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${darkMode ? "bg-indigo-500 text-white hover:bg-indigo-400" : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"}`}
            >
              <FiDownload size={12} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* MAIN DESK AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative ">
        {/* THE PAPER */}
        <div
          className={`max-w-4xl mx-auto min-h-full  shadow-lg border flex flex-col ${
            darkMode
              ? "bg-[#121214] border-zinc-800/80 shadow-black/50"
              : "bg-white border-zinc-200 shadow-zinc-200/50"
          }`}
        >
          {settings.activeSlots.length > 0 ? (
            <>
              {/* Sticky Toolbar inside paper */}
              <div
                className={`sticky top-0 z-20 px-8 py-4 border-b rounded-t-xl backdrop-blur-md ${
                  darkMode
                    ? "bg-[#121214]/95 border-zinc-800/80"
                    : "bg-white/95 border-zinc-100"
                }`}
              >
                <SimpleToolBar
                  darkMode={darkMode}
                  type="simple"
                  size="full"
                  context={context}
                />
              </div>

              {/* Text Editor */}
              <div
                className="flex-1 px-8 md:px-16 py-10 cursor-text"
                onClick={() => {
                  if (context.editor && !context.editor.isFocused)
                    context.editor.commands.focus("end");
                }}
              >
                <EditorDoc size="full" content={settings.info} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 h-full min-h-[400px]">
              <FiFileText size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No active scratchpads</p>
              <p className="text-xs mt-1">
                Click the + button above to create one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ScratchPad = () => {
  return (
    <EditorProvider>
      <ScratchProvider>
        <ScratchPadContent />
      </ScratchProvider>
    </EditorProvider>
  );
};

export default ScratchPad;
