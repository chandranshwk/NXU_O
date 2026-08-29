import React, { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { EditorContent, useEditor, Extension } from "@tiptap/react";
import { getEditorExtensions } from "../assets/TipTapEditor";
import { Editor } from "@tiptap/core";
import type { settingsContextType } from "../contexts/settingsContext";
import { PiDotsSix } from "react-icons/pi";

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
}) => {
  const blockRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Injected Keyboard Actions extension to behave like a document canvas
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
          "focus:outline-none outline-none w-full break-words [word-break:break-word]",
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

  // Keep internal sub-editor block context fully in sync with external layout state shifts
  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    if (html !== currentHTML) {
      isTransitioningRef.current = true;
      editor.commands.setContent(html);
      isTransitioningRef.current = false;
    }
  }, [html, editor]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-1 py-0.5 px-2 rounded-md transition-colors ${
        darkMode ? "hover:bg-zinc-800/30" : "hover:bg-zinc-100/50"
      } ${isDragging ? "z-50 shadow-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800" : ""}`}
    >
      {/* Draggable Drag Action controls Container (Fades in on item hover) */}
      <div
        ref={blockRef}
        className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 select-none pt-1"
      >
        <div
          {...attributes}
          {...listeners}
          className={`cursor-grab text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
            isDragging ? "cursor-grabbing text-blue-500" : ""
          }`}
          title="Drag to reorder"
        >
          <PiDotsSix className="rotate-90" />
        </div>
      </div>

      {/* Actual Tiptap viewport render target container layout */}
      <div className="flex-1 min-w-0 pl-1">
        <EditorContent
          editor={editor}
          className={`w-full font-sans text-base leading-relaxed
            ${darkMode ? "[&_.tiptap_h1]:text-white [&_.tiptap_p]:text-zinc-200" : ""}
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
    </div>
  );
};
