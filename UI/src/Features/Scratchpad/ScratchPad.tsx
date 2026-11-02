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

/**
 * @file ScratchPad.tsx
 * @component ScratchPad
 */

import { useOutletContext } from "react-router-dom";
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

  return (
    <div
      className={`h-full flex-1 min-w-0 flex flex-col overflow-hidden ${
        !darkMode ? "bg-[#f4f4f5]" : "bg-[#141414]"
      }`}
    >
      {/* ==========================================
          SOLID STICKY HEADER (TABS & TOOLBAR)
          ========================================== */}
      <div
        data-tour="scratchpad-tabbar"
        className={`w-full shrink-0 flex px-4 items-center justify-between relative z-40 border-b ${
          darkMode
            ? "bg-[#181818] border-zinc-800/80"
            : "bg-white border-zinc-200"
        }`}
      >
        {/* LEFT BLOCK: Tabs */}
        <div className="flex-1 min-w-0 h-12 flex items-center">
          <Pages
            darkMode={darkMode}
            allPads={settings.allPads}
            setAllPads={settings.setAllPads}
            activeSlots={settings.activeSlots}
            setActiveSlots={settings.setActiveSlots}
          />
        </div>

        {/* RIGHT BLOCK: Toolbar */}
        <div
          data-tour="scratchpad-toolbar"
          className="shrink-0 h-full flex items-center pl-4"
        >
          <SimpleToolBar
            darkMode={darkMode}
            type="simple"
            size="small"
            context={context}
          />
        </div>
      </div>

      {/* ==========================================
          CENTERED PAPER CANVAS
          ========================================== */}
      <div
        data-tour="scratchpad-editor"
        // 🔥 FIX: Focus the editor when clicking anywhere on the gray background
        onClick={() => {
          if (context.editor && !context.editor.isFocused) {
            context.editor.commands.focus("end");
          }
        }}
        className="flex-1 overflow-y-auto focus:outline-none w-full px-4 sm:px-8"
      >
        {settings.activeSlots.length > 0 ? (
          <div className="w-full max-w-4xl mx-auto min-h-full flex justify-center">
            {/* THE "PAPER" CONTAINER */}
            <div
              className={`w-full max-w-3xl border flex flex-col transition-all duration-200 ${
                darkMode
                  ? "bg-[#1a1a1a] border-zinc-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                  : "bg-white border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              }`}
            >
              {/* Internal padding creates the "margin" of the paper */}
              <div className="flex-1 px-12 py-12">
                <EditorDoc size="full" content={settings.info} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-zinc-500 italic text-sm">
            No active scratchpads opened. Use the menu dropdown to create or
            load a file.
          </div>
        )}
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
