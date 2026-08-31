/**
 * @file TextNode.tsx
 * @component TextNode
 * @description The main text processing block. It splits incoming document
 * markup into separate sortable paragraphs, enabling dragging, block inserts,
 * contextual tables, and floating toolbars.
 *
 * @architecture
 * - Drag and Drop: Orchestrated by `@dnd-kit/core` using a vertical sorting strategy.
 * - Text Processing: Subdivides single text blocks into arrays via `extractParagraphsToBlocks`.
 * - State Coordination: Synchronizes TipTap typography updates directly with `useEditorContext`.
 */

import React, { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSettings } from "../contexts/settingsContext";
import {
  useEditorContext,
  type editorContextType,
} from "../contexts/editorContext";
import ContextMenu from "../components/ContextMenu";
import FloatingToolbar from "./FloatingToolbar";
import { Editor } from "@tiptap/react";
import { SortableParagraphBlock } from "./SortableParagraphBlock";
import { extractParagraphsToBlocks, type BlockItem } from "./TextNode.helper";

interface TextNodeProps {
  /** Raw content string containing document paragraphs or raw block markup */
  content: string;
  /** Unique identification token key tracking this node block instance */
  nodeId: string;
  /** Conditional layout modifier passing preset design constraints downward */
  hasPreset?: boolean;
}

export const TextNode: React.FC<TextNodeProps> = ({
  content,
  nodeId,
  hasPreset,
}) => {
  /** Accesses dark mode state provided globally by the main layout shell */
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const settings = useSettings();
  const context = useEditorContext();

  /** State array maintaining split paragraph nodes assigned for sorting items */
  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  /** References the active target TipTap engine instance receiving keyboard focus */
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  /** Computed display coordinates anchoring the floating bubble selection toolbar */
  const [selected, setSelected] = useState<editorContextType>();
  /** Computed display coordinates anchoring the floating bubble selection toolbar */
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  /** Anchor positions specifying viewport placement for custom table context menus */
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  /** Boundary target node measuring active bounding boxes for menu layout math */
  const containerRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // LIFECYCLE: HTML STRUCTURE PARSER
  // ==========================================
  /**
   * Watches incoming data changes. Safely tests for JSON wrappers before
   * extracting string bodies down into independent block paragraph indexes.
   */
  useEffect(() => {
    let targetHTML = content;
    try {
      if (content) {
        const parsed = JSON.parse(content);
        targetHTML = typeof parsed === "string" ? parsed : content;
      }
    } catch {
      targetHTML = content;
    }
    setTimeout(() => {
      setBlocks(extractParagraphsToBlocks(targetHTML));
    }, 0);
  }, [content, nodeId]);

  /** Closes the open contextual cell modifier overlays */
  const closeContextMenu = () => setContextMenu(null);

  // ==========================================
  // INTERACTION: SORTABLE DRAG HANDLERS
  // ==========================================
  /**
   * Runs upon mouse-release after drag interactions. Reorders items inside
   * the local array map and log updates back to tracking controllers.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);

        // Notify tracking delta context system of new HTML sequence layout
        if (activeEditor) {
          const combinedHTML = updated.map((b) => b.html).join("");
          console.log(combinedHTML);
        }
        return updated;
      });
    }
  };

  /** Injects a new blank block directly beneath targeted row elements */
  const handleUpdateBlockContent = (id: string, newHtml: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, html: newHtml } : b)),
    );
  };

  /** Injects a new blank block directly beneath targeted row elements */
  const handleInsertBelow = (id: string) => {
    setBlocks((prev) => {
      const index = prev.findIndex((b) => b.id === id);
      const newBlock = {
        id: `block-${Math.random().toString(36).substr(2, 5)}`,
        html: "<p></p>",
      };
      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });
  };

  /** Removes specific lines while shielding against zero-length array breaks */
  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) =>
      prev.length <= 1 ? prev : prev.filter((b) => b.id !== id),
    );
  };

  // ==========================================
  // ENGINE: TRANSACTION COORDINATE MATH
  // ==========================================
  /**
   * Triggers each time cursor bounding footprints shift. Scans type parameters,
   * updates the parent button context, and transforms relative text measurements
   * into absolute pixels to position the formatting popup bubble.
   */
  const handleBlockTransaction = (currentEditor: Editor) => {
    const { selection } = currentEditor.state;

    // Reset layout anchors if the text highlighting span contracts to empty
    if (selection.empty) {
      setSelected(undefined);
      setMenuCoords(null);
      return;
    }

    if (!context) return;

    // Sync typography formatting states to parent listeners
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

    setSelected({ ...context });

    try {
      if (!containerRef.current) return;
      const fromCoords = currentEditor.view.coordsAtPos(selection.from);
      const toCoords = currentEditor.view.coordsAtPos(selection.to);
      const containerRect = containerRef.current.getBoundingClientRect();

      // Computes structural center anchors tracking above selection lines
      const topOffset = fromCoords.top - containerRect.top - 54;
      const leftOffset =
        (fromCoords.left + toCoords.left) / 2 - containerRect.left;

      // Restricts popups from slipping beyond canvas boundaries
      const toolbarWidth = 320;
      const minLeftBoundary = toolbarWidth / 2;
      const maxLeftBoundary = containerRect.width - toolbarWidth / 2;
      const boundedLeft = Math.max(
        minLeftBoundary,
        Math.min(leftOffset, maxLeftBoundary),
      );

      setMenuCoords({ top: topOffset, left: boundedLeft });
    } catch (err) {
      console.warn(
        "ProseMirror text selection coordinates tracking skip:",
        err,
      );
    }
  };

  return (
    /* Visual container scales vertically via h-auto to adjust for paragraph counts */
    <div className="w-full h-auto relative z-10 -top-5 overflow-visible ">
      <div
        ref={containerRef}
        onClick={closeContextMenu}
        className="flex flex-col overflow-visible transition-all outline-none duration-200 relative w-full h-auto"
      >
        <div
          className="flex-1 w-full focus:outline-none space-y-1 h-auto"
          onContextMenu={(e) => {
            const targetElement = e.target as HTMLElement;
            // Capture table context actions right here
            if (targetElement.closest("table")) {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY });
            } else {
              closeContextMenu();
            }
          }}
        >
          {/* SORTABLE PARAGRAPH ITERATION DRAG CANVASES */}
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              {blocks.map((block) => (
                <SortableParagraphBlock
                  key={block.id}
                  hasPreset={hasPreset}
                  id={block.id}
                  html={block.html}
                  darkMode={darkMode}
                  settings={settings}
                  onUpdate={handleUpdateBlockContent}
                  onInsertBelow={handleInsertBelow}
                  onDeleteBlock={handleDeleteBlock}
                  onFocusSet={(editor) => {
                    setActiveEditor(editor);
                    if (context?.setEditor) context.setEditor(editor);
                  }}
                  onTransaction={handleBlockTransaction}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* FLOAT SELECTION HOVER TEXT FORMATTER PANEL */}
          {activeEditor && menuCoords && (
            <FloatingToolbar
              editor={activeEditor}
              darkMode={darkMode}
              context={selected}
              coords={menuCoords}
            />
          )}
        </div>

        {/* DATA OVERLAY CELL STYLING MENUS */}
        {contextMenu && activeEditor && (
          <ContextMenu
            contextMenu={contextMenu}
            darkMode={darkMode}
            editor={activeEditor}
            closeContextMenu={closeContextMenu}
          />
        )}
      </div>
    </div>
  );
};

export default TextNode;
