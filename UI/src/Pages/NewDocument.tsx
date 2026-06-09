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
      className={`h-full flex flex-col gap-4 px-10 pt-5 overflow-hidden ${!darkMode ? "bg-white" : "bg-[#18181b]"}`}
    >
      <div>
        <h1
          className={`text-xl font-bold mb-auto ${darkMode ? "text-zinc-50" : "text-zinc-800"}`}
        >
          Editing Document
        </h1>
        <p
          className={`text-xs ${darkMode ? "text-zinc-400" : "text-zinc-600"} font-mono mb-4`}
        >
          Doc ID: {id}
        </p>
      </div>
      <SimpleToolBar
        darkMode={darkMode}
        type="rich"
        size="full"
        context={context}
      />
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
