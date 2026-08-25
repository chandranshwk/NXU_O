import { useOutletContext } from "react-router-dom";
import { EditorContent } from "@tiptap/react";
import "regenerator-runtime/runtime";

import { useEffect, useState } from "react";
import { useSettings } from "../contexts/settingsContext";
import { useEditorContext } from "../contexts/editorContext";
import ContextMenu from "./ContextMenu";
import { useStickyEditor } from "../Hooks/useStickyEditor";
import StickyNote from "./StickyNotes";
import { useWorkspace } from "../contexts/workspaceContext";

interface props {
  size: "full" | "short";
  content: string;
  mode?: "text" | "draw";
}

const DocumentEditorDoc: React.FC<props> = ({
  size,
  content,
  mode = "text",
}) => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const context = useEditorContext();
  const settings = useSettings();
  const { items, setItems } = useWorkspace();

  // Localized Isolated Zoom State Engine (1 = 100%)
  const [zoomScale, setZoomScale] = useState<number>(1);

  settings.setDefaultColor(
    size === "full" ? (darkMode ? "#fff" : "#000") : "#000",
  );

  const { editor, isTransitioningRef } = useStickyEditor({
    initialContent: content,
    darkMode: darkMode,
    autofocus: "end",
    trackHeaders: true,
  });

  // Global Window-Level Interception Fix
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      // Check if Ctrl key is pressed
      if (e.ctrlKey) {
        // Find if the scroll is happening inside our editor container view path
        const isInsideEditor = (e.target as HTMLElement).closest(
          '[data-id="main-scroll-viewport"]',
        );

        if (isInsideEditor) {
          e.preventDefault();
          e.stopPropagation(); // Stop Tiptap from hijacking the mouse stroke data

          setZoomScale((prevScale) => {
            const delta = e.deltaY < 0 ? 0.05 : -0.05;
            // Bound the scaling metrics strictly between 50% and 200%
            return Math.min(Math.max(prevScale + delta, 0.5), 2.0);
          });
        }
      }
    };

    // "true" forces the browser event handler into the absolute earliest capture phase execution path
    window.addEventListener("wheel", handleGlobalWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("wheel", handleGlobalWheel, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!editor) return;
    const currentHTML = editor.getHTML();
    const currentText = editor.getText();

    if (content !== currentHTML && content !== currentText) {
      isTransitioningRef.current = true;
      editor.commands.setContent(content);
      isTransitioningRef.current = false;
    }
  }, [content, editor, isTransitioningRef]);

  useEffect(() => {
    if (!editor) return;
    editor.setOptions({ editable: mode === "text" });
  }, [mode, editor]);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const closeContextMenu = () => setContextMenu(null);

  const claimDocumentToolbarFocus = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("[data-sticky-note]") ||
      target.closest(".SimpleToolBar") ||
      target.closest(".context-menu") ||
      target.closest("[custom-header]") ||
      target.closest("[onmenu]")
    ) {
      return;
    }
    if (editor && context?.setEditor) {
      context.setEditor(editor);
    }
  };

  return (
    <div
      onClick={closeContextMenu}
      onMouseDown={claimDocumentToolbarFocus}
      className={`flex flex-col overflow-hidden transition-all outline-none duration-200 relative ${
        mode === "draw"
          ? "pointer-events-none select-none opacity-85"
          : "pointer-events-auto"
      } ${
        size === "full"
          ? `w-full h-[80.8%] ${!darkMode ? "border-y border-r border-zinc-950/20 rounded-r-lg" : ""}`
          : "w-2/3 h-[120vh] top-0 border-5 border-zinc-800 relative left-[16.666667%]"
      } ${size === "short" ? "bg-white" : darkMode ? "bg-[#141414]" : "bg-white"}`}
    >
      <div
        className="flex-1 h-[120vh] overflow-y-auto px-10 py-10 focus:outline-none relative"
        data-id="main-scroll-viewport"
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
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (
            target.closest("[data-sticky-note]") ||
            target.closest(".SimpleToolBar") ||
            target.closest(".context-menu") ||
            target.closest("[custom-header]") ||
            target.closest("[onmenu]")
          ) {
            return;
          }
          if (editor && !editor.isFocused && mode === "text") {
            editor.commands.focus("end");
          }
        }}
      >
        {/* Isolated Canvas Transform Box */}
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "top center",
            transition: "transform 0.05s ease-out",
          }}
          className="w-full origin-top"
        >
          {items.map((item, idx) => (
            <StickyNote
              key={item.id}
              id={item.id}
              index={idx}
              content={item.content}
              initialX={item.x}
              initialY={item.y}
              initialWidth={item.width}
              initialHeight={item.height}
              setItems={setItems}
            />
          ))}

          <EditorContent
            editor={editor}
            className={`w-full ${
              size === "full" ? "w-full min-h-[calc(100%-2rem)]" : "w-full pt-4"
            } focus:outline-none outline-none font-sans text-base leading-relaxed [&_.tiptap]:outline-none ${
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

export default DocumentEditorDoc;
