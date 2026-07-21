import type { Editor } from "@tiptap/core";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiColumns,
  FiLayers,
  FiPlus,
  FiTrash,
} from "react-icons/fi";

interface ContextMenuProps {
  contextMenu: { x: number; y: number } | null;
  darkMode: boolean;
  editor: Editor | null;
  closeContextMenu: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  contextMenu,
  darkMode,
  editor,
  closeContextMenu,
}) => {
  return (
    <div
      style={{ top: contextMenu?.y, left: contextMenu?.x }}
      onMouseDown={(e) => e.stopPropagation()}
      className={`absolute z-9999 min-w-52 rounded-md border p-1 font-sans shadow-xl outline-none select-none ${
        darkMode
          ? "bg-[#1f1f23] border-[#242425ab] text-zinc-200"
          : "bg-white border-slate-200 text-gray-700"
      }`}
    >
      <div className="flex items-center justify-between gap-1 pb-1.5 mb-1.5 border-b dark:border-zinc-800/60 border-slate-100 px-1">
        <span className="text-[10px] font-bold tracking-wide uppercase opacity-40">
          Cell Align:
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              editor?.chain().focus().setTextAlign("left").run();
              closeContextMenu();
            }}
            className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}
            title="Align Left"
          >
            <FiAlignLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              editor?.chain().focus().setTextAlign("center").run();
              closeContextMenu();
            }}
            className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}
            title="Align Center"
          >
            <FiAlignCenter className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              editor?.chain().focus().setTextAlign("right").run();
              closeContextMenu();
            }}
            className={`p-1.5 rounded transition-colors ${darkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`}
            title="Align Right"
          >
            <FiAlignRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {/* LAYER 1: INSERTION MODIFIERS */}
      <div className="flex flex-col gap-0.5 pb-1 mb-1 border-b dark:border-zinc-800/60 border-slate-100">
        <button
          onClick={() => {
            editor?.chain().focus().addRowBefore().run();
            closeContextMenu();
          }}
          className={`w-full flex items-center gap-2 text-left px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
        >
          <FiPlus className="w-3.5 h-3.5 opacity-60 rotate-0" /> Insert Row
          Above
        </button>

        <button
          onClick={() => {
            editor?.chain().focus().addColumnBefore().run();
            closeContextMenu();
          }}
          className={`w-full flex items-center gap-2 text-left px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
        >
          <FiPlus className="w-3.5 h-3.5 opacity-60 -rotate-90" /> Insert Column
          Left
        </button>

        <button
          onClick={() => {
            editor?.chain().focus().addColumnAfter().run();
            closeContextMenu();
          }}
          className={`w-full flex items-center gap-2 text-left px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
        >
          <FiPlus className="w-3.5 h-3.5 opacity-60 rotate-90" /> Insert Column
          Right
        </button>
      </div>

      {/* LAYER 2: CHOP/SLICE MODIFIERS */}
      <div className="flex flex-col gap-0.5 pb-1 mb-1 border-b dark:border-zinc-800/60 border-slate-100">
        <button
          onClick={() => {
            editor?.chain().focus().deleteRow().run();
            closeContextMenu();
          }}
          className={`w-full flex items-center gap-2 text-left px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
        >
          <FiLayers className="w-3.5 h-3.5 opacity-70" /> Delete Current Row
        </button>

        <button
          onClick={() => {
            editor?.chain().focus().deleteColumn().run();
            closeContextMenu();
          }}
          className={`w-full flex items-center gap-2 text-left px-2 py-1.5 text-xs font-medium rounded transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 text-zinc-300"
              : "hover:bg-zinc-100 text-zinc-700"
          }`}
        >
          <FiColumns className="w-3.5 h-3.5 opacity-70" /> Delete Current Column
        </button>
      </div>

      {/* LAYER 3: CRITICAL DESTRUCTION */}
      <button
        onClick={() => {
          editor?.chain().focus().deleteTable().run();
          closeContextMenu();
        }}
        className="w-full flex items-center gap-2 text-left px-2 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 rounded transition-colors"
      >
        <FiTrash className="w-3.5 h-3.5" /> Delete Entire Table
      </button>
    </div>
  );
};

export default ContextMenu;
