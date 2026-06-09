import { useOutletContext } from "react-router-dom";
import SimpleToolBar from "../components/SimpleToolBar";
import EditorDoc from "../components/EditorDoc";
import { EditorProvider, useEditorContext } from "../contexts/editorContext";

const ScratchPadContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const context = useEditorContext();

  return (
    <div
      className={`h-full flex flex-col justify-center overflow-hidden ${!darkMode ? "bg-white" : "bg-[#18181b]"}`}
    >
      <div className="shrink-0 flex items-center justify-center w-full bg-transparent relative z-40">
        <SimpleToolBar
          darkMode={darkMode}
          type="simple"
          size="small"
          context={context}
        />
      </div>

      {/* Scrollable text editing content layout below */}
      <div className="flex-1 overflow-y-auto focus:outline-none pb-12">
        <EditorDoc size="full" />
      </div>
    </div>
  );
};

const ScratchPad = () => {
  return (
    <EditorProvider>
      <ScratchPadContent />
    </EditorProvider>
  );
};

export default ScratchPad;
