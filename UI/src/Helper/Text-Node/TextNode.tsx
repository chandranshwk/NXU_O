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
import { useSettings } from "../../contexts/settingsContext";
import {
  useEditorContext,
  type editorContextType,
} from "../../contexts/editorContext";
import ContextMenu from "../../components/ContextMenu";
import { Editor } from "@tiptap/react";
import { SortableParagraphBlock } from "../FloatingToolbar/SortableParagraphBlock";
import { extractParagraphsToBlocks, type BlockItem } from "./TextNode.helper";
import FloatingToolbar from "../FloatingToolbar/FloatingToolbar";

interface TextNodeProps {
  content: string;
  nodeId: string;
  hasPreset?: boolean;
  onUpdate?: (newContent: string) => void;
}

export const TextNode: React.FC<TextNodeProps> = ({
  content,
  nodeId,
  hasPreset,
  onUpdate,
}) => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const settings = useSettings();
  const context = useEditorContext();

  const [blocks, setBlocks] = useState<BlockItem[]>([]);
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
  const [selected, setSelected] = useState<editorContextType>();
  const [menuCoords, setMenuCoords] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const lastPushedHtmlRef = useRef<string>("");

  // ==========================================
  // LIFECYCLE: HTML STRUCTURE PARSER
  // ==========================================
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

    // 🔥 STOP THE CHURN: If Zustand is just echoing back what we typed, ignore it.
    if (targetHTML === lastPushedHtmlRef.current) return;

    lastPushedHtmlRef.current = targetHTML;
    setTimeout(() => {
      setBlocks(extractParagraphsToBlocks(targetHTML));
    }, 0);
  }, [content, nodeId]);

  // ==========================================
  // SYNC BLOCKS BACK TO ZUSTAND
  // ==========================================
  useEffect(() => {
    if (blocks.length === 0 || !onUpdate) return;

    const combinedHtml = blocks.map((b) => b.html).join("");

    // Only push if it's actually different from what we last pushed
    if (combinedHtml !== lastPushedHtmlRef.current) {
      lastPushedHtmlRef.current = combinedHtml;
      onUpdate(combinedHtml);
    }
  }, [blocks, onUpdate]);

  const closeContextMenu = () => setContextMenu(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleUpdateBlockContent = (id: string, newHtml: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, html: newHtml } : b)),
    );
  };

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

  const handleDeleteBlock = (id: string) => {
    setBlocks((prev) =>
      prev.length <= 1 ? prev : prev.filter((b) => b.id !== id),
    );
  };

  const handleBlockTransaction = (currentEditor: Editor) => {
    const { selection } = currentEditor.state;

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

    setSelected({ ...context });

    try {
      if (!containerRef.current) return;
      const fromCoords = currentEditor.view.coordsAtPos(selection.from);
      const toCoords = currentEditor.view.coordsAtPos(selection.to);
      const containerRect = containerRef.current.getBoundingClientRect();

      const topOffset = fromCoords.top - containerRect.top - 54;
      const leftOffset =
        (fromCoords.left + toCoords.left) / 2 - containerRect.left;

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
    <div className="w-full h-auto relative z-10 -top-5 overflow-visible cursor-text">
      <div
        ref={containerRef}
        onClick={closeContextMenu}
        className="flex flex-col overflow-visible transition-all outline-none duration-200 relative w-full h-auto"
      >
        <div
          className="flex-1 w-full focus:outline-none space-y-1 h-auto"
          onContextMenu={(e) => {
            const targetElement = e.target as HTMLElement;
            if (targetElement.closest("table")) {
              e.preventDefault();
              setContextMenu({ x: e.clientX, y: e.clientY });
            } else {
              closeContextMenu();
            }
          }}
        >
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

          {activeEditor && menuCoords && (
            <FloatingToolbar
              editor={activeEditor}
              darkMode={darkMode}
              context={selected}
              coords={menuCoords}
            />
          )}
        </div>

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
