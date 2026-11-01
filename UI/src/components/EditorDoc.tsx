/**
 * @file EditorDoc.tsx
 * @component EditorDoc
 * @description The unified core editing area canvas used inside scratchpads. It initializes
 * a single TipTap text engine instance, tracks cursor property selections, and updates local data
 * state buffers dynamically.
 *
 * @architecture
 * - Collects typography configurations from `getEditorExtensions` to build extension arrays.
 * - Broadcasts inline cursor selections (headings, alignments, marks) straight up to `useEditorContext`.
 * - Intercepts table node selections to spawn a custom right-click context menu overlay box.
 */

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

export const EditorDoc: React.FC<props> = ({ size, content }) => {
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
        // INCREASED font size, line-height, and removed weird margins
        className:
          "prose dark:prose-invert max-w-full w-full break-words [word-break:break-word] outline-none min-h-[60vh] text-lg leading-relaxed [&_span[style*='CalibriLocal']]:leading-[0.4]",
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
      className={`w-full relative transition-all outline-none duration-200 `}
    >
      <div
        className="w-full focus:outline-none"
        onContextMenu={(e) => {
          if (!editor) return;
          const targetElement = e.target as HTMLElement;
          if (targetElement.closest("table") !== null) {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY });
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
          className={`w-full focus:outline-none outline-none font-sans text-base leading-relaxed [&_.tiptap]:outline-none
              ${
                darkMode
                  ? " [&_.tiptap_h1]:text-white [&_.tiptap_h2]:text-zinc-100 [&_.tiptap_h3]:text-zinc-200 [&_.tiptap_p]:text-zinc-300 [&_.tiptap_ul]:text-zinc-300 [&_.tiptap_ol]:text-zinc-300"
                  : " [&_.tiptap_h1]:text-black [&_.tiptap_h2]:text-zinc-900 [&_.tiptap_h3]:text-zinc-800 [&_.tiptap_p]:text-zinc-700 [&_.tiptap_ul]:text-zinc-700 [&_.tiptap_ol]:text-zinc-700"
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
