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
  /** Variant toggle mapping a fluid 100% viewport container vs a restricted, centered paper canvas */
  size: "full" | "short";
  /** Initial raw HTML layout text string loaded from file state streams */
  content: string;
}

export const EditorDoc: React.FC<props> = ({ size, content }) => {
  /** Accesses dark mode state provided globally by the main layout shell */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  /** Connects to global text formatting state hooks and selections indicators */
  const context = useEditorContext();

  /** Fetches baseline IDE parameters, spacing dimensions, and custom hotkey maps */
  const settings = useSettings();

  /** References scratchpad state variables, tracking draft content buffer adjustments */
  const scratch = useScratchContext();

  // Enforce background color fallbacks based on sizing rules and visual modes
  settings.setDefaultColor(
    size === "full" ? (darkMode ? "#fff" : "#000") : "#000",
  );

  /** Lock flag tracking asset transformations to prevent infinite loop draw updates */
  const isTransitioningRef = useRef<boolean>(false);

  // ==========================================
  // TIPTAP ENGINE TEXT COMPILER INITIALIZER
  // ==========================================
  const editor = useEditor({
    editorProps: {
      attributes: {
        className:
          "prose dark:prose-invert max-w-full w-full break-words [word-break:break-word] outline-none min-h-[500px] px-4 py-2 [&_span[style*='CalibriLocal']]:leading-[0.4]",
      },
    },

    extensions: getEditorExtensions({ settings }),
    content: content,

    // Triggered whenever text inputs alter data structures inside fields
    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      const currentHTML = currentEditor.getHTML();
      // Pipe fresh modifications directly back into the temporary tab data store
      if (scratch.info !== currentHTML) {
        scratch.setInfo(currentHTML);
      }
    },

    // ==========================================
    // TRANSACTION LOOP: ALIGN SELECTION TRAPS
    // ==========================================
    /**
     * Triggers continuously on cursor changes. Scrapes marks, block styles, alignment matrices,
     * and heading tags out of active selections and synchronizes them with parent toolbar indicators.
     */
    onTransaction: ({ editor: currentEditor }) => {
      // 1. Audit active character inline layout format modifications
      const isBold = currentEditor.isActive("bold");
      const isItalic = currentEditor.isActive("italic");
      const isUnderline = currentEditor.isActive("underline");
      const isStrike = currentEditor.isActive("strike");
      const isBullet = currentEditor.isActive("bulletList");
      const isOrdered = currentEditor.isActive("orderedList");
      const isBlockquote = currentEditor.isActive("blockquote");
      const isCodeBlock = currentEditor.isActive("codeBlock");

      // Sync button indicators only if values genuinely deviate to avoid render thrashing
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

      // 2. Propagate text color states up towards main formatting channels
      if (context.highlightedColor !== targetHighlight) {
        context.setHighlightedColor(targetHighlight);
      }
      if (context.textColor !== targetColor) {
        context.setTextColor(targetColor);
      }

      // 3. Scan heading weight properties to map heading states (H1-H6)
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

  // ==========================================
  // LIFECYCLE 1: EXTERNAL DATA SYNC LOOP
  // ==========================================
  /** Forces content text updates down the engine if storage files change out parameters */
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

  // ==========================================
  // LIFECYCLE 2: INSTANCE HOOK INTERCEPTOR
  // ==========================================
  /** Binds the initialized engine wrapper directly into shared context focus channels */
  useEffect(() => {
    if (editor) {
      context.setEditor(editor);
    }
  }, [editor, context]);

  /** Viewport tracking coordinates used to anchor table modification option menus */
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  /** Dismisses open contextual overlay layout cards */
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
      {/* ==========================================
          SCROLLING PANELS: TEXT EDITOR INTERFACE AREA
          ========================================== */}
      <div
        className="flex-1 h-[120vh] overflow-y-auto px-10 py-0 pt-0 focus:outline-none"
        onContextMenu={(e) => {
          if (!editor) return;

          const targetElement = e.target as HTMLElement;
          const isClickedOnTable = targetElement.closest("table") !== null;

          // Catch context triggers specifically when right-clicking cells inside tables
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
          // Relocate typing indicators straight down to line endings if clicking blank bounds
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

      {/* FLOATING RIGHT-CLICK CELL MODIFIER SETTING MATRIX */}
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
