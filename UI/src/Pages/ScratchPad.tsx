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
import SimpleToolBar from "../components/SimpleToolBar";
import EditorDoc from "../components/EditorDoc";
import { EditorProvider, useEditorContext } from "../contexts/editorContext";
import Pages from "./Pages";
import { ScratchProvider, useScratchContext } from "../contexts/scratchContext";

/**
 * @component ScratchPadContent
 * @description Renders the structured workspace layout, coordinating open tab views,
 * editing toolbar inputs, and the active text editor document canvas.
 */
const ScratchPadContent = () => {
  /** Accesses dark mode state provided globally by the main layout shell */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  /** Connects to the text editor engine commands and selection states */
  const context = useEditorContext();

  /** Tracks active workspace data, open drafts, and tab slots */
  const settings = useScratchContext();

  return (
    /* MAIN WRAPPER CONTAINER: min-w-0 lets the entire panel shrink sideways when the sidebar expands */
    <div
      className={`h-full flex-1 min-w-0 flex flex-col justify-start overflow-hidden ${!darkMode ? "bg-white" : "bg-[#141414]"}`}
    >
      {/* ==========================================
          HEADER MENU ROW (TABS & TOOLBAR)
          ========================================== */}
      <div className="w-full h-11 pb-5 mt-4 shrink-0 flex px-4 items-center justify-between bg-transparent relative z-40 border-b border-zinc-800/40">
        {/* LEFT BLOCK: Handles horizontal tab truncation dynamically */}
        <div className="flex-1 min-w-0 pr-4 h-full flex items-center">
          <Pages
            darkMode={darkMode}
            allPads={settings.allPads}
            setAllPads={settings.setAllPads}
            activeSlots={settings.activeSlots}
            setActiveSlots={settings.setActiveSlots}
          />
        </div>

        {/* RIGHT BLOCK: Locks formatting tools securely on the right edge */}
        <div className="shrink-0 h-full flex items-center">
          <SimpleToolBar
            darkMode={darkMode}
            type="simple"
            size="small"
            context={context}
          />
        </div>
      </div>

      {/* ==========================================
          PRIMARY ACTIVE TEXT EDITOR CANVAS
          ========================================== */}
      {/* WORKSPACE CANVAS: This is the ONLY element allowed to absorb the remaining screen height */}
      <div className="flex-1 overflow-y-auto focus:outline-none pb-12 mt-4 w-full">
        {/* Checks if there is at least one active scratchpad tab open before loading the editor */}
        {settings.activeSlots.length > 0 ? (
          <EditorDoc size="full" content={settings.info} />
        ) : (
          /* FALLBACK WORKSPACE STATE: Prompt shown when all temporary tabs are completely closed */
          <div className="flex flex-col items-center justify-center w-full h-full text-zinc-500 italic text-sm">
            No active scratchpads opened. Use the menu dropdown to create or
            load a file.
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * @component ScratchPad
 * @description Context wrapper initialization layer. Protects the inner content
 * lifecycle by injecting independent state providers before component rendering occurs.
 */
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
