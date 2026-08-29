import { EditorContent, useEditor } from "@tiptap/react";
import { getEditorExtensions } from "../assets/TipTapEditor";
import { useSettings } from "../contexts/settingsContext";
import {
  useEditorContext,
  type editorContextType,
} from "../contexts/editorContext";
import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ContextMenu from "../components/ContextMenu";
import FloatingToolbar from "./FloatingToolbar";

interface TextNodeProps {
  content: string;
  nodeId: string;
}

export const TextNode: React.FC<TextNodeProps> = ({ content, nodeId }) => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  const settings = useSettings();
  const context = useEditorContext();
  const [selected, setSelected] = useState<editorContextType>();

  // Dynamic screen coordinate allocations
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isTransitioningRef = useRef<boolean>(false);

  const getInitialHTML = () => {
    try {
      if (content) {
        const parsed = JSON.parse(content);
        return typeof parsed === "string" ? parsed : content;
      }
    } catch {
      return content;
    }
    return "<p></p>";
  };

  const editor = useEditor({
    editorProps: {
      attributes: {
        className:
          "prose dark:prose-invert max-w-full w-full break-words [word-break:break-word] outline-none min-h-[150px] px-4 py-2 [&_span[style*='CalibriLocal']]:leading-[0.4]",
      },
    },
    extensions: getEditorExtensions({ settings }),
    content: getInitialHTML(),

    onFocus: ({ editor: currentEditor }) => {
      if (context?.setEditor) {
        context.setEditor(currentEditor);
      }
    },

    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      const currentHTML = currentEditor.getHTML();
      console.log(`Node ${nodeId} text content delta changed:`, currentHTML);
    },

    onTransaction: ({ editor: currentEditor }) => {
      const { selection } = currentEditor.state;

      // Clear toolbar coordinates immediately if text highlight range drops empty
      if (selection.empty) {
        setSelected(undefined);
        setMenuCoords(null);
        return;
      }

      if (!context) return;

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

      const updatedContext = { ...context };
      setSelected(updatedContext);

      // FIX: LOCALIZED SELECTION COORDINATE CALCULATION MATRIX
      try {
        if (!containerRef.current) return;

        // Fetch character positions straight out from the ProseMirror document mapping layout
        const fromCoords = currentEditor.view.coordsAtPos(selection.from);
        const toCoords = currentEditor.view.coordsAtPos(selection.to);
        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate center placement vectors relative ONLY to your local node wrapper card envelope
        const topOffset = fromCoords.top - containerRect.top - 54;
        const leftOffset =
          (fromCoords.left + toCoords.left) / 2 - containerRect.left;

        // BOUNDARY GUARD: Enforce maximum and minimum margin safety scales to keep it on screen
        const toolbarWidth = 320; // Estimated minimum width footprint of toolbar box module
        const minLeftBoundary = toolbarWidth / 2;
        const maxLeftBoundary = containerRect.width - toolbarWidth / 2;
        const boundedLeft = Math.max(
          minLeftBoundary,
          Math.min(leftOffset, maxLeftBoundary),
        );

        setMenuCoords({
          top: topOffset,
          left: boundedLeft,
        });
      } catch (err) {
        console.warn(
          "ProseMirror text selection coordinates tracking skip:",
          err,
        );
      }
    },
  });

  useEffect(() => {
    if (!editor) return;

    let targetHTML = "";
    try {
      if (content) {
        const parsed = JSON.parse(content);
        targetHTML = typeof parsed === "string" ? parsed : content;
      }
    } catch {
      targetHTML = content;
    }

    const currentHTML = editor.getHTML();
    if (targetHTML !== currentHTML) {
      isTransitioningRef.current = true;
      editor.commands.setContent(targetHTML);
      isTransitioningRef.current = false;
    }
  }, [content, editor]);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const closeContextMenu = () => setContextMenu(null);

  return (
    <div className="w-full h-full relative z-10 -top-5 resize ">
      <div
        ref={containerRef}
        onClick={closeContextMenu}
        className="flex flex-col overflow-visible transition-all outline-none duration-200 relative w-full h-full"
      >
        <div
          className="flex-1 w-full focus:outline-none"
          onContextMenu={(e) => {
            if (!editor) return;
            const targetElement = e.target as HTMLElement;
            const isClickedOnTable = targetElement.closest("table") !== null;

            if (isClickedOnTable) {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY });
            } else {
              closeContextMenu();
            }
          }}
          onClick={(e) => {
            const target = e.target as HTMLElement;

            const isDragAction =
              target.closest(".cursor-grab") ||
              target.closest(".cursor-grabbing") ||
              target.closest("[ref]");

            if (isDragAction) {
              return;
            }

            if (editor && !editor.isFocused) {
              editor.commands.focus("end");
            }
          }}
        >
          <EditorContent
            editor={editor}
            className={`w-full focus:outline-none outline-none font-sans text-base leading-relaxed [&_.tiptap]:outline-none
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

          {editor && menuCoords && (
            <FloatingToolbar
              editor={editor}
              darkMode={darkMode}
              context={selected}
              coords={menuCoords}
            />
          )}
        </div>

        {contextMenu && editor && (
          <ContextMenu
            contextMenu={contextMenu}
            darkMode={darkMode}
            editor={editor}
            closeContextMenu={closeContextMenu}
          />
        )}
      </div>
    </div>
  );
};

export default TextNode;
