/**
 * @file DocumentEditorDoc.tsx
 * @component DocumentEditorDoc
 * @description The high-performance layout workspace layer for structured notebooks.
 * Combines full-canvas text editors with absolute-positioned floating stickies, while embedding
 * custom window tracking utilities like Ctrl+Wheel pinch-to-zoom scaling hooks.
 *
 * @architecture
 * - Leverages the specialized modular integration hook `useStickyEditor` to boot editor instances.
 * - Bridges the canvas layer with global workspace items mapped from `useWorkspace`.
 * - Uses hardware-accelerated CSS 3D scale transforms to manipulate active viewport sizes dynamically.
 */

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
  /** Size variant rule switching between a standard 100% layout and a narrow paper column */
  size: "full" | "short";
  /** Raw markdown content payload strings synced down from backend database layers */
  content: string;
  /** Toggles input response parameters across the field canvas layout ('text' | 'draw') */
  mode?: "text" | "draw";
}

export const DocumentEditorDoc: React.FC<props> = ({
  size,
  content,
  mode = "text",
}) => {
  /** Accesses dark mode state provided globally by the main layout shell */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();

  /** Central state context tracking font parameters, line spans, and layout indices */
  const context = useEditorContext();

  /** Accesses general text configs, line spacing records, and default colors */
  const settings = useSettings();

  /** Unpacks active absolute sticky data collections from the central spatial store */
  const { items, setItems } = useWorkspace();

  /** Localized Isolated Zoom State Engine (1 = 100% base scaling factor) */
  const [zoomScale, setZoomScale] = useState<number>(1);

  // Set default foreground hex strings depending on the color mode
  settings.setDefaultColor(
    size === "full" ? (darkMode ? "#fff" : "#000") : "#000",
  );

  // Initialize the text editing lifecycle via custom interceptor hooks
  const { editor, isTransitioningRef } = useStickyEditor({
    initialContent: content,
    darkMode: darkMode,
    autofocus: "end",
    trackHeaders: true, // Automates section monitoring for outline views
  });

  // ==========================================
  // INTERCEPTOR: CTRL + WHEEL PINCH ZOOM
  // ==========================================
  /**
   * Catches global scrolling actions inside capture execution frames.
   * When the Control key is held, it converts mouse wheel ticks into canvas scaling
   * limits, locking the zoom bounds between 50% and 200%.
   */
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        const isInsideEditor = (e.target as HTMLElement).closest(
          '[data-id="main-scroll-viewport"]',
        );

        if (isInsideEditor) {
          e.preventDefault();
          e.stopPropagation(); // Stifles TipTap selection mechanics from scrolling the screen

          setZoomScale((prevScale) => {
            const delta = e.deltaY < 0 ? 0.05 : -0.05;
            return Math.min(Math.max(prevScale + delta, 0.5), 2.0);
          });
        }
      }
    };

    // 'capture: true' hooks the listener into the primary top-level input phase
    window.addEventListener("wheel", handleGlobalWheel, {
      passive: false,
      capture: true,
    });

    return () => {
      window.removeEventListener("wheel", handleGlobalWheel, { capture: true });
    };
  }, []);

  // ==========================================
  // LIFECYCLE 1: MARKUP CONTENT UPDATE RE-SYNC
  // ==========================================
  /** Syncs editor blocks cleanly if external document streams modify data content variables */
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

  // ==========================================
  // LIFECYCLE 2: CANVAS MODE EDITABLE LOCKS
  // ==========================================
  /** Inactivates typing properties inside TipTap when switching out of text modes */
  useEffect(() => {
    if (!editor) return;
    editor.setOptions({ editable: mode === "text" });
  }, [mode, editor]);

  /** Viewport tracking coordinates used to anchor table property selector grids */
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  /** Dismisses active popover contextual cell menus */
  const closeContextMenu = () => setContextMenu(null);

  // ==========================================
  // CONTROL FOCUS COORDINATION MANAGER
  // ==========================================
  /** Intercepts background mouse down vectors to lock formatting focus flags */
  const claimDocumentToolbarFocus = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Safety guard: Drop intercept calculations if targeting floating card controls
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
          ? "pointer-events-none select-none opacity-85" // Restrict clicks when whiteboard layers engage
          : "pointer-events-auto"
      } ${
        size === "full"
          ? `w-full h-[80.8%] ${!darkMode ? "border-y border-r border-zinc-950/20 rounded-r-lg" : ""}`
          : "w-2/3 h-[120vh] top-0 border-5 border-zinc-800 relative left-[16.666667%]"
      } ${size === "short" ? "bg-white" : darkMode ? "bg-[#141414]" : "bg-white"}`}
    >
      {/* PRIMARY ACTIVE INTERACTION SCROLL VIEWPORT PATH */}
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
        {/* ==========================================
            GPU SCALING CORE LAYOUT TRANSLATION CONTAINER
            ========================================== */}
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "top center",
            transition: "transform 0.05s ease-out", // Snappy alignment feedback transitions
          }}
          className="w-full origin-top"
        >
          {/* Loop and draw floating overlay sticky elements on top of raw pages */}
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

          {/* Core editor typing pane container view */}
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

      {/* FLOATING RIGHT-CLICK TABLE SETTING MODALS */}
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
