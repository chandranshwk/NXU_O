import { useOutletContext } from "react-router-dom";
import { EditorContent } from "@tiptap/react";
import "regenerator-runtime/runtime";

import { useEffect, useState } from "react";
import { useSettings } from "../contexts/settingsContext";
import { useEditorContext } from "../contexts/editorContext";
import { useStickyEditor } from "../Hooks/useStickyEditor";

interface props {
  size: "full" | "short";
  content: string;
}

const StickyEditor: React.FC<props> = ({ size, content }) => {
  const outletContext = useOutletContext<{ darkMode: boolean }>() || {
    darkMode: false,
  };
  const darkMode = outletContext.darkMode;

  const context = useEditorContext();
  const settings = useSettings();

  if (settings?.setDefaultColor) {
    settings.setDefaultColor(
      size === "full" ? (darkMode ? "#fff" : "#000") : "#000",
    );
  }

  // ⚡️ CLEAN HOOK REUSE: Completely cleans up the configuration boilerplate
  const { editor, isTransitioningRef } = useStickyEditor({
    initialContent: content,
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

  // ❌ REMOVED: The problematic mount useEffect block is completely gone.

  const [, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const closeContextMenu = () => setContextMenu(null);

  // Explicitly binds this active editor instance to your formatting toolbar on demand
  const claimToolbarFocus = (e: React.MouseEvent) => {
    // 🔥 Stop click event from bubbling up and triggering parent note container dragging
    e.stopPropagation();
    if (editor && context?.setEditor) {
      context.setEditor(editor);
    }
  };

  return (
    <div
      onClick={closeContextMenu}
      // 🔥 INTERCEPT HERE: Safely claims the toolbar context right when clicked
      onMouseDown={claimToolbarFocus}
      className={`flex flex-col outline-none transition-all duration-200 relative w-full h-full ${
        size === "short"
          ? "bg-transparent"
          : darkMode
            ? "bg-[#141414]"
            : "bg-white"
      }`}
    >
      <div
        className="flex-1 w-full h-full focus:outline-none"
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
          if (editor && !editor.isFocused) {
            e.stopPropagation();
            editor.commands.focus();
          }
        }}
      >
        <EditorContent editor={editor} className="w-full h-full text-left" />
      </div>
    </div>
  );
};

export default StickyEditor;
