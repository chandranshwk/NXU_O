import { useOutletContext, useParams } from "react-router-dom";
import SimpleToolBar from "../components/SimpleToolBar";
import { EditorProvider, useEditorContext } from "../contexts/editorContext";
import DocumentEditorDoc from "../components/DocumentEditorDoc";
import { ScratchProvider } from "../contexts/scratchContext";
import CreaterPointer from "../components/CreaterPointer";
import HeaderSlide from "../components/HeaderSlide";
import { useState, useEffect } from "react";
import { FiFeather, FiType } from "react-icons/fi";
import { useSettings } from "../contexts/settingsContext";
import { matchShortcut } from "../utils/matchKey";

const NewDocumentContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { id } = useParams<{ id: string }>();
  const context = useEditorContext();

  const [editorMode, setEditorMode] = useState<"text" | "draw">("text");
  const settings = useSettings();

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // 🚀 FIXED: Evaluate the strict shortcut matching conditions FIRST before checking targets
      const isTextMatch = matchShortcut(e, settings.textModeShortcut);
      const isCanvasMatch = matchShortcut(e, settings.canvasModeShortcut);

      // If either of your custom workspace shortcuts are an exact match, intercept immediately!
      if (isTextMatch) {
        e.preventDefault(); // Blocks character insertion or browser address bar overrides
        setEditorMode("text");
        console.log("⌨️ Workspace Mode Shifted: Text Mode Active.");
        return; // Complete execution block pass
      }

      if (isCanvasMatch) {
        e.preventDefault();
        setEditorMode("draw");
        console.log("⌨️ Workspace Mode Shifted: Canvas Mode Active.");
        return;
      }

      // 🚀 NATIVE PASS-THROUGH FALLBACK:
      // If the keystroke wasn't an exact shortcut match, let everything else pass through
      // untouched so your letters, caps lock, backspaces, and spacing work naturally.
    };

    window.addEventListener("keydown", handleGlobalKeys);
    return () => window.removeEventListener("keydown", handleGlobalKeys);
  }, [settings.textModeShortcut, settings.canvasModeShortcut]);

  return (
    <div
      className={`h-screen w-full flex flex-col gap-2 pt-2 px-10 overflow-hidden relative ${!darkMode ? "bg-white" : "bg-[#18181b]"}`}
    >
      {/* Top Fixed Toolbar Panel Wrapper */}
      <div
        className={`flex flex-col gap-4 shrink-0 rounded-sm ${darkMode ? "bg-zinc-600/5" : "bg-zinc-300/10"} p-5 pb-4`}
      >
        <div className="flex items-center justify-between w-full h-10">
          <div className="flex flex-col">
            <h1
              className={`text-base font-bold leading-tight ${darkMode ? "text-zinc-50" : "text-zinc-800"}`}
            >
              Editing Document
            </h1>
            <p
              className={`text-[10px] opacity-80 ${darkMode ? "text-zinc-400" : "text-zinc-500"} font-mono mt-0.5`}
            >
              Doc ID: {id}
            </p>
          </div>

          <div
            className={`flex items-center gap-5 py-1.5 px-3 rounded-lg select-none border transition-colors duration-200 ${
              darkMode
                ? "bg-zinc-900/60 border-zinc-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                : "bg-zinc-100/80 border-zinc-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            }`}
          >
            <button
              onClick={() => setEditorMode("text")}
              title="Text Mode (Mod+Alt+T)"
              className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold rounded-lg transition-all duration-150 cursor-pointer outline-none ${
                editorMode === "text"
                  ? darkMode
                    ? "bg-zinc-800 text-zinc-100 shadow-xs"
                    : "bg-white text-zinc-900 font-bold shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                  : darkMode
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiType className="w-2.5 h-2.5 opacity-70" />
              <span>Text</span>
            </button>

            <button
              onClick={() => setEditorMode("draw")}
              title="Canvas Mode (Mod+Alt+D)"
              className={`flex items-center gap-1.5 px-3 py-1 text-[12px] font-semibold rounded-lg transition-all duration-150 cursor-pointer outline-none ${
                editorMode === "draw"
                  ? darkMode
                    ? "bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                    : "bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/10"
                  : darkMode
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-zinc-400 hover:text-zinc-700"
              }`}
            >
              <FiFeather className="w-2.5 h-2.5 opacity-70" />
              <span>Canvas</span>
            </button>
          </div>
        </div>

        {/* Text formatting options toolbar stays isolated below */}
        <SimpleToolBar
          darkMode={darkMode}
          type="rich"
          size="full"
          context={context}
        />
      </div>

      {/* Primary Workspace Viewport Container */}
      <div className="flex-1 relative min-h-0 overflow-hidden mb-1">
        <CreaterPointer className="w-full h-full relative overflow-hidden">
          <div className="h-full flex">
            <div className="no-drag pointer-events-auto h-full flex">
              <HeaderSlide />
            </div>

            <DocumentEditorDoc size="full" content="" mode={editorMode} />
          </div>
        </CreaterPointer>
      </div>
    </div>
  );
};

const NewDocument = () => {
  return (
    <EditorProvider>
      <ScratchProvider>
        <NewDocumentContent />
      </ScratchProvider>
    </EditorProvider>
  );
};

export default NewDocument;
