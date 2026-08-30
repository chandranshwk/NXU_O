// src/components/SortableParagraphBlock.tsx
import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  EditorContent,
  useEditor,
  Extension,
  useEditorState,
} from "@tiptap/react";
import { getEditorExtensions } from "../assets/TipTapEditor";
import { Editor } from "@tiptap/core";
import type { settingsContextType } from "../contexts/settingsContext";
import { PiDotsSix } from "react-icons/pi";
import { FiMoreHorizontal, FiTrash2 } from "react-icons/fi";
import { createPortal } from "react-dom";
import SortableDropdown from "./SortableDropdown";

interface SortableParagraphBlockProps {
  id: string;
  html: string;
  darkMode: boolean;
  settings: settingsContextType;
  onUpdate: (id: string, html: string) => void;
  onInsertBelow: (id: string) => void;
  onDeleteBlock: (id: string) => void;
  onFocusSet: (editor: Editor) => void;
  onTransaction: (editor: Editor, blockElement: HTMLElement) => void;
  hasPreset?: boolean;
}

export const SortableParagraphBlock: React.FC<SortableParagraphBlockProps> = ({
  id,
  html,
  darkMode,
  settings,
  onUpdate,
  onInsertBelow,
  onDeleteBlock,
  onFocusSet,
  onTransaction,
  hasPreset,
}) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const optionsBtnRef = useRef<HTMLButtonElement>(null);
  const isTransitioningRef = useRef(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogCoords, setDialogCoords] = useState({ top: 0, left: 0 });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const CanvasKeyboardShortcuts = Extension.create({
    name: "canvasKeyboardShortcuts",
    addKeyboardShortcuts() {
      return {
        Enter: ({ editor }) => {
          if (editor.state.selection.$from.parent.type.name === "hardBreak")
            return false;
          onInsertBelow(id);
          return true;
        },
        Backspace: ({ editor }) => {
          if (editor.isEmpty) {
            onDeleteBlock(id);
            return true;
          }
          return false;
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [...getEditorExtensions({ settings }), CanvasKeyboardShortcuts],
    content: html,
    editorProps: {
      attributes: {
        className:
          "focus:outline-none outline-none w-full break-words [word-break:break-word] min-h-[1.5rem]",
      },
    },
    onFocus: ({ editor: currentEditor }) => {
      onFocusSet(currentEditor);
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      onUpdate(id, currentEditor.getHTML());
    },
    onTransaction: ({ editor: currentEditor }) => {
      if (blockRef.current) {
        onTransaction(currentEditor, blockRef.current);
      }
    },
  });

  const properties = useEditorState({
    editor,
    selector: (ctx) => {
      const paragraphAttrs = ctx.editor.getAttributes("paragraph");
      const headingAttrs = ctx.editor.getAttributes("heading");
      const activeAlignment =
        paragraphAttrs.textAlign || headingAttrs.textAlign || "left";

      const isHeading = ctx.editor.isActive("heading");
      const blockType = isHeading ? "heading" : "paragraph";

      return {
        isBold: ctx.editor.isActive("bold"),
        isItalic: ctx.editor.isActive("italic"),
        isUnderline: ctx.editor.isActive("underline"),
        isStrikeThrough: ctx.editor.isActive("strike"),
        isUL: ctx.editor.isActive("bulletList"),
        isOL: ctx.editor.isActive("orderedList"),
        highlightedColor: ctx.editor.getAttributes("highlight").color || "",
        font: ctx.editor.getAttributes("textStyle").fontFamily || "",
        fontSize: ctx.editor.getAttributes("textStyle").fontSize || "",
        color: ctx.editor.getAttributes("textStyle").color || "",
        alignment: activeAlignment,
        blockBackground:
          ctx.editor.getAttributes(blockType).backgroundColor || "transparent",
      };
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    backgroundColor:
      properties.blockBackground === "transparent"
        ? "transparent"
        : properties.blockBackground,
  };

  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (html !== currentHTML) {
      isTransitioningRef.current = true;
      editor.commands.setContent(html);
      isTransitioningRef.current = false;
    }
  }, [html, editor]);

  // Automatic newly spawned focus task handler
  useEffect(() => {
    if (!editor) return;
    if (html === "<p></p>" || html === "") {
      const timeout = setTimeout(() => {
        editor.commands.focus("end");
      }, 30);
      return () => clearTimeout(timeout);
    }
  }, [editor, html]);

  const handleOptionsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = optionsBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setDialogCoords({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
      setOpenDialog((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => setOpenDialog(false);
    if (openDialog) {
      const timeout = setTimeout(() => {
        window.addEventListener("click", handleOutsideClick);
      }, 0);
      return () => {
        clearTimeout(timeout);
        window.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [openDialog]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 py-1 px-2 rounded-md transition-colors ${
        darkMode ? "hover:bg-zinc-800/30" : "hover:bg-zinc-100/50"
      } `}
    >
      {/* Visual Controls Action Handle Container */}
      <div
        block-id={id}
        ref={blockRef}
        className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 select-none pt-0.5"
      >
        <button
          ref={optionsBtnRef}
          type="button"
          onClick={handleOptionsClick}
          className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer outline-none focus:outline-none"
          title="Block options"
        >
          <FiMoreHorizontal size={14} />
        </button>

        <div
          {...attributes}
          {...listeners}
          className={`text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ${
            isDragging ? "cursor-grabbing text-blue-500" : "cursor-grab"
          }`}
          title="Drag to reorder"
        >
          <PiDotsSix size={16} className="rotate-90" />
        </div>
      </div>

      {/* Tiptap Rich Text Element Area */}
      <div className="flex-1 min-w-0 pl-1 py-0 h-max">
        <EditorContent
          editor={editor}
          className={`w-full font-sans text-base leading-relaxed m-0
            ${!hasPreset ? (darkMode ? "[&_tiptap_h]:text-white [&_tiptap_p]:text-zinc-200" : "") : ""}
          `}
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

      {/* Notion Options Portal Dropdown Menu */}
      {openDialog &&
        createPortal(
          <div
            className="absolute z-9999 rounded-xl shadow-xl border flex flex-col select-none p-1.5 w-60 transform duration-150 animate-in fade-in slide-in-from-top-1"
            style={{
              top: dialogCoords.top,
              left: dialogCoords.left,
              backgroundColor: darkMode ? "#19191a" : "#ffffff",
              borderColor: darkMode ? "#2c2c2e" : "#e4e4e7",
              boxShadow: darkMode
                ? "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)"
                : "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                onDeleteBlock(id);
                setOpenDialog(false);
              }}
              className="w-full text-left px-2.5 py-1.5 flex items-center gap-2.5 text-zinc-700 dark:text-zinc-300 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-sm font-medium transition-colors outline-none focus:bg-red-500/10 focus:text-red-600 group"
            >
              <FiTrash2
                size={15}
                className="text-zinc-400 group-hover:text-current transition-colors"
              />
              <span>Delete Block</span>
            </button>

            {/* Section: Color Options */}
            <div className="flex items-center justify-between w-full">
              <SortableDropdown
                darkMode={darkMode}
                editor={editor}
                properties={properties}
              />
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default SortableParagraphBlock;
