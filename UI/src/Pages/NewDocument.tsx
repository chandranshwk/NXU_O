import { useOutletContext, useParams } from "react-router-dom";
import SimpleToolBar from "../components/SimpleToolBar";
import { EditorProvider, useEditorContext } from "../contexts/editorContext";
import EditorDoc from "../components/EditorDoc";

const NewDocumentContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { id } = useParams<{ id: string }>();
  const context = useEditorContext();

  return (
    <div
      className={`h-full flex flex-col gap-2 px-10 pt-5 overflow-hidden ${!darkMode ? "bg-white" : "bg-[#18181b]"}`}
    >
      <div className={`flec flex-col gap-5`}>
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
      {/* Your note content text canvas goes here */}
      <EditorDoc size="short" />
    </div>
  );
};

const NewDocument = () => {
  return (
    <EditorProvider>
      <NewDocumentContent />
    </EditorProvider>
  );
};

export default NewDocument;
