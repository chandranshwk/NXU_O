import { useOutletContext } from "react-router-dom";
import SimpleToolBar from "../components/SimpleToolBar";
import EditorDoc from "../components/EditorDoc";
import { EditorProvider, useEditorContext } from "../contexts/editorContext";
import Pages from "./Pages";
import { ScratchProvider, useScratchContext } from "../contexts/scratchContext";

const ScratchPadContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const context = useEditorContext();
  const settings = useScratchContext();

  return (
    <div
      className={`h-full flex flex-col justify-center overflow-hidden ${!darkMode ? "bg-white" : "bg-[#141414]"}`}
    >
      <div className="shrink-0 flex px-2 items-center justify-between w-full bg-transparent relative z-40">
        <Pages
          darkMode={darkMode}
          allPads={settings.allPads}
          setAllPads={settings.setAllPads}
          activeSlots={settings.activeSlots}
          setActiveSlots={settings.setActiveSlots}
        />
        <SimpleToolBar
          darkMode={darkMode}
          type="simple"
          size="small"
          context={context}
        />
      </div>

      {settings.saveStatus && (
        <span
          className={`text-[11px] font-medium transition-opacity duration-200 ${
            settings.saveStatus === "Saved!"
              ? "text-green-500"
              : "text-amber-500"
          }`}
        >
          {settings.saveStatus}
        </span>
      )}

      {/* Scrollable text editing content layout below */}
      <div className="flex-1 overflow-y-auto focus:outline-none pb-12">
        <EditorDoc size="full" content={settings.info} />
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
