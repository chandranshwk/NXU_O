import { useOutletContext, useParams } from "react-router-dom";
import SimpleToolBar from "../components/SimpleToolBar";
import { EditorProvider, useEditorContext } from "../contexts/editorContext";
import DocumentEditorDoc from "../components/DocumentEditorDoc";
import { ScratchProvider } from "../contexts/scratchContext";
import CreaterPointer from "../components/CreaterPointer";

const NewDocumentContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { id } = useParams<{ id: string }>();
  const context = useEditorContext();

  return (
    <div
      className={`h-full flex flex-col gap-2 px-10 pt-5 overflow-hidden ${!darkMode ? "bg-white" : "bg-[#18181b]"}`}
    >
      <div
        className={`flec flex-col gap-5 rounded-sm ${darkMode ? "bg-zinc-600/5" : "bg-zinc-300/10"} p-5`}
      >
        <h1
          className={`text-xl font-bold mb-2 ${darkMode ? "text-zinc-50" : "text-zinc-800"}`}
        >
          Editing Document
        </h1>
        <p
          className={`text-xs mb-1 ${darkMode ? "text-zinc-400" : "text-zinc-600"} font-mono`}
        >
          Doc ID: {id}
        </p>
        <SimpleToolBar
          darkMode={darkMode}
          type="rich"
          size="full"
          context={context}
        />
      </div>
      <CreaterPointer className={`flex-1 overflow-auto h-screen`}>
        <div onClick={(e) => e.stopPropagation()} className="h-full">
          <DocumentEditorDoc size="full" content="" />
        </div>
      </CreaterPointer>
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
