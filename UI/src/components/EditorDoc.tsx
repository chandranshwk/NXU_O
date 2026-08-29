import { useOutletContext } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import "regenerator-runtime/runtime";

import { useEffect, useRef, useState } from "react";
import { getEditorExtensions } from "../assets/TipTapEditor";
import { useSettings } from "../contexts/settingsContext";
import { useEditorContext } from "../contexts/editorContext";
import { useScratchContext } from "../contexts/scratchContext";
import ContextMenu from "./ContextMenu";

interface props {
  size: "full" | "short";
  content: string;
}

const EditorDoc: React.FC<props> = ({ size, content }) => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const context = useEditorContext();
  const settings = useSettings();
  const scratch = useScratchContext();

  settings.setDefaultColor(
    size === "full" ? (darkMode ? "#fff" : "#000") : "#000",
  );
  const isTransitioningRef = useRef<boolean>(false);

  const editor = useEditor({
    editorProps: {
      attributes: {
        className:
          "prose dark:prose-invert max-w-full w-full break-words [word-break:break-word] outline-none min-h-[500px] px-4 py-2 [&_span[style*='CalibriLocal']]:leading-[0.4]",
      },
    },

    extensions: getEditorExtensions({ settings }),

    content: content,
    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      const currentHTML = currentEditor.getHTML();
      if (scratch.info !== currentHTML) {
        scratch.setInfo(currentHTML);
      }
    },

    onTransaction: ({ editor: currentEditor }) => {
      // 1. Compute target toggle booleans
      const isBold = currentEditor.isActive("bold");
      const isItalic = currentEditor.isActive("italic");
      const isUnderline = currentEditor.isActive("underline");
      const isStrike = currentEditor.isActive("strike");
      const isBullet = currentEditor.isActive("bulletList");
      const isOrdered = currentEditor.isActive("orderedList");
      const isBlockquote = currentEditor.isActive("blockquote");
      const isCodeBlock = currentEditor.isActive("codeBlock");

      if (context.isBold !== isBold) context.setIsBold(isBold);
      if (context.isItalic !== isItalic) context.setIsItalic(isItalic);
      if (context.isUnderline !== isUnderline)
        context.setIsUnderline(isUnderline);
      if (context.isStrikethrough !== isStrike)
        context.setIsStrikethrough(isStrike);
      if (context.isBulletList !== isBullet) context.setIsBulletList(isBullet);
      if (context.isOrderedList !== isOrdered)
        context.setIsOrderedList(isOrdered);
      if (context.isBlockquote !== isBlockquote)
        context.setIsBlockquote(isBlockquote);
      if (context.isCodeBlock !== isCodeBlock)
        context.setIsCodeBlock(isCodeBlock);

      const attrs = currentEditor.getAttributes("textStyle");
      const targetHighlight = attrs.backgroundColor || "";
      const targetColor = attrs.color || settings.defaultColor;

      // 2. ONLY propagate color values up if they genuinely deviate from current context states
      if (context.highlightedColor !== targetHighlight) {
        context.setHighlightedColor(targetHighlight);
      }
      if (context.textColor !== targetColor) {
        context.setTextColor(targetColor);
      }

      let activeHeading = 0;
      for (let i = 1; i <= 6; i++) {
        if (currentEditor.isActive("heading", { level: i })) {
          activeHeading = i;
          break;
        }
      }

      // We invoke 'toggleHeading' directly, letting the context handle its internal routing.
      context.toggleHeading(activeHeading);

      const targetFont = attrs.fontFamily || settings.defaultFont;
      const targetFontSize = attrs.fontSize || settings.defaultFontSize;

      if (context.font !== targetFont) context.setFont(targetFont);
      if (context.fontSize !== targetFontSize)
        context.setFontSize(targetFontSize);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();
    const currentText = editor.getText();

    if (content !== currentHTML && content !== currentText) {
      isTransitioningRef.current = true;
      editor.commands.setContent(content);
      isTransitioningRef.current = false;
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      context.setEditor(editor);
    }
  }, [editor, context]);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const closeContextMenu = () => setContextMenu(null);

  return (
    <div
      onClick={closeContextMenu}
      className={`flex flex-col overflow-hidden transition-all outline-none duration-200 relative ${
        size === "full"
          ? "w-full h-full"
          : "w-2/3 h-[120vh] top-0 border border-zinc-200/50 relative left-[16.666667%]"
      } ${
        size === "short" ? "bg-white" : darkMode ? "bg-[#141414]" : "bg-white"
      }`}
    >
      <div
        className="flex-1 h-[120vh] overflow-y-auto px-10 py-0 pt-0 focus:outline-none"
        onContextMenu={(e) => {
          if (!editor) return;

          const targetElement = e.target as HTMLElement;
          const isClickedOnTable = targetElement.closest("table") !== null;

          if (isClickedOnTable) {
            e.preventDefault();
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
            editor.commands.focus("end");
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
        <ContextMenu
          contextMenu={contextMenu}
          darkMode={darkMode}
          editor={editor}
          closeContextMenu={closeContextMenu}
        />
      )}
    </div>
  );
};

export default EditorDoc;
