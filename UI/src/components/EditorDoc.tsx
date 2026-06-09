import { useOutletContext } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import "regenerator-runtime/runtime";

import { useEffect, useState } from "react";
import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiColumns,
  FiLayers,
  FiPlus,
  FiTrash,
} from "react-icons/fi";
import { getEditorExtensions } from "../assets/TipTapEditor";
import { useSettings } from "../contexts/settingsContext";
import { useEditorContext } from "../contexts/editorContext";

interface props {
  size: "full" | "short";
}

const EditorDoc: React.FC<props> = ({ size }) => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const context = useEditorContext();
  const settings = useSettings();
  settings.setDefaultColor(
    size === "full" ? (darkMode ? "#fff" : "#000") : "#000",
  );

  const editor = useEditor({
    editorProps: {
      attributes: {
        className:
          "prose dark:prose-invert max-w-full w-full break-words [word-break:break-word] outline-none min-h-[500px] px-4 py-2 [&_span[style*='CalibriLocal']]:leading-[0.4]",
      },
    },

    extensions: getEditorExtensions({ settings }),

    content: `     `,

    onSelectionUpdate: ({ editor: currentEditor }) => {
      context.setIsBold(currentEditor.isActive("bold"));
      context.setIsItalic(currentEditor.isActive("italic"));
      context.setIsUnderline(currentEditor.isActive("underline"));
      context.setIsStrikethrough(currentEditor.isActive("strike"));
      context.setIsBulletList(currentEditor.isActive("bulletList"));
      context.setIsOrderedList(currentEditor.isActive("orderedList"));
      context.setIsBlockquote(currentEditor.isActive("blockquote"));
      context.setIsCodeBlock(currentEditor.isActive("codeBlock"));
      const highlightAttrs = currentEditor.getAttributes("highlight");
      context.setHighlightedColor(highlightAttrs.color || "");

      let activeHeading = 0;
      for (let i = 1; i <= 6; i++) {
        if (currentEditor.isActive("heading", { level: i })) {
          activeHeading = i;
          break;
        }
      }

      context.toggleHeading(activeHeading);

      const attrs = currentEditor.getAttributes("textStyle");
      context.setFont(attrs.fontFamily || settings.defaultFont);
      context.setFontSize(attrs.fontSize || settings.defaultFontSize);
      context.setTextColor(attrs.color || settings.defaultColor);
    },
  });

  useEffect(() => {
    if (editor) {
      context.setEditor(editor);
      // context.setReadText(() => handleReadScratchpadText);
    }
  }, [editor, context]);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const closeContextMenu = () => setContextMenu(null);

  return (
    <div
      /* DISMISS ON CLICK AWAY: Clears the popup if clicking blank space */
      onClick={closeContextMenu}
      className={`flex flex-col overflow-hidden transition-all outline-none duration-200 relative ${
        size === "full"
          ? "w-full h-full"
          : "w-2/3 h-[120vh] top-0 border border-zinc-200/50 relative left-[16.666667%]"
      } ${
        size === "short" ? "bg-white" : darkMode ? "bg-[#18181b]" : "bg-white"
      }`}
    >
      <div
        className="flex-1 h-[120vh] overflow-y-auto px-10 py-0  pt-0 focus:outline-none"
        /* THE RIGHT-CLICK INTERCEPTOR INTERACTION */
        onContextMenu={(e) => {
          if (!editor) return;

          // Detect if the target click element node is inside a table layout cell
          const targetElement = e.target as HTMLElement;
          const isClickedOnTable = targetElement.closest("table") !== null;

          if (isClickedOnTable) {
            e.preventDefault(); // Stifles native gray system browser context popups

            // Capture exact mouse viewport coordinate locations
            setContextMenu({
              x: e.clientX,
              y: e.clientY,
            });
          } else {
            closeContextMenu();
          }
        }}
        onClick={() => {
          if (editor && !editor.isFocused) {
            editor.commands.focus("end"); // Places the flashing typing cursor neatly at the end of the text
          }
        }}
      >
        <EditorContent
          editor={editor}
          className={`w-full ${
            size === "full" ? "w-full min-h-[calc(100%-2rem)]" : "w-full pt-4"
          } focus:outline-none outline-none font-sans text-base leading-relaxed [&_.tiptap]:outline-none
              ${
                darkMode
                  ? " [&_.tiptap_h1]:text-white [&_.tiptap_p]:text-zinc-200 [&_.tiptap_ul]:text-zinc-100 [&_.tiptap_ol]:text-zinc-100"
                  : " [&_.tiptap_ul]:text-zinc-800 [&_.tiptap_ol]:text-zinc-800"
              }`}
          style={
            {
              "--editor-line-height": settings.lineHeight,
              "--editor-font-size": settings.defaultFontSize,
              "--editor-ordered-list-representer":
                settings.defaultOLRepresenter,
              "--editor-font-color": settings.defaultColor,
            } as React.CSSProperties
          }
        />
      </div>

      {contextMenu && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
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
              <FiPlus className="w-3.5 h-3.5 opacity-60 -rotate-90" /> Insert
              Column Left
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
              <FiPlus className="w-3.5 h-3.5 opacity-60 rotate-90" /> Insert
              Column Right
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
              <FiColumns className="w-3.5 h-3.5 opacity-70" /> Delete Current
              Column
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
      )}
    </div>
  );
};

export default EditorDoc;
