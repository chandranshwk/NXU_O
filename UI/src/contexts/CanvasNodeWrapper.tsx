import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNotebookStore } from "../contexts/notebook";
import type { MockPageNode } from "../assets/SAMPLE";

// =========================================================================
// TYPE DEFINITIONS
// =========================================================================
export type NodeComponentType = "text" | "calendar" | "map" | "todo";

export interface CanvasNodeData {
  id: string;
  type: NodeComponentType;
  x: number;
  y: number;
  width: number;
  height?: number;
  content: string;
  backgroundColor?: string;
}

interface CanvasNodeWrapperProps {
  node: MockPageNode;
  notebookId: string;
  sectionId: string;
  pageId: string;
  darkMode: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  children: React.ReactNode;
}

// =========================================================================
// COMPONENT
// =========================================================================
export const CanvasNodeWrapper: React.FC<CanvasNodeWrapperProps> = ({
  node,
  notebookId,
  sectionId,
  pageId,
  darkMode,
  isSelected,
  onSelect,
  children,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRect, setDialogRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [dialogOffset, setDialogOffset] = useState({ x: 0, y: 0 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);

  // Dialog local state
  const [dialogColor, setDialogColor] = useState(
    node.backgroundColor || "#ffffff",
  );
  const [dialogWidth, setDialogWidth] = useState(node.width);
  const [dialogHeight, setDialogHeight] = useState(node.height || 150);

  const nodeRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const dialogHeaderRef = useRef<HTMLDivElement>(null);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const nodeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const dialogDragStartRef = useRef({ x: 0, y: 0 });
  const dialogOffsetStartRef = useRef({ x: 0, y: 0 });

  // ----- Drag handlers for node -----
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizeHandleRef.current?.contains(e.target as Node)) return;
    if (!dragHandleRef.current?.contains(e.target as Node)) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(node.id);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    nodeStartRef.current = {
      x: node.x,
      y: node.y,
      width: node.width,
      height: node.height || 0,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const { updateNodePosition } = useNotebookStore.getState();
      updateNodePosition(
        notebookId,
        sectionId,
        pageId,
        node.id,
        Math.round(nodeStartRef.current.x + deltaX),
        Math.round(nodeStartRef.current.y + deltaY),
      );
    } else if (isResizing) {
      e.stopPropagation();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const targetWidth = Math.max(
        150,
        Math.round(nodeStartRef.current.width + deltaX),
      );
      const targetHeight = Math.max(
        80,
        Math.round(nodeStartRef.current.height + deltaY),
      );
      const { updateNodeSize } = useNotebookStore.getState();
      if (updateNodeSize) {
        updateNodeSize(
          notebookId,
          sectionId,
          pageId,
          node.id,
          targetWidth,
          targetHeight,
        );
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    } else if (isResizing) {
      setIsResizing(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handleResizeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(node.id);
    setIsResizing(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    const currentHeight =
      node.height ||
      e.currentTarget.parentElement?.getBoundingClientRect().height ||
      150;
    nodeStartRef.current = {
      x: node.x,
      y: node.y,
      width: node.width,
      height: currentHeight,
    };
    e.currentTarget.parentElement?.setPointerCapture(e.pointerId);
  };

  // ----- Dialog handlers -----
  const handleOpenDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = nodeRef.current?.getBoundingClientRect();
    if (rect) {
      setDialogRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setDialogColor(node.backgroundColor || "#ffffff");
    setDialogWidth(node.width);
    setDialogHeight(node.height || 150);
    setDialogOffset({ x: 0, y: 0 }); // reset position when opened
    setDialogOpen(true);
  };

  const handleCloseDialog = () => setDialogOpen(false);

  const handleApplyChanges = () => {
    if (dialogWidth < 150 || dialogHeight < 80) {
      alert("Width must be at least 150px and height at least 80px.");
      return;
    }
    const { updateNodeSize, updateNodeBackgroundColor } =
      useNotebookStore.getState();
    updateNodeSize(
      notebookId,
      sectionId,
      pageId,
      node.id,
      dialogWidth,
      dialogHeight,
    );
    updateNodeBackgroundColor(
      notebookId,
      sectionId,
      pageId,
      node.id,
      dialogColor,
    );
    setDialogOpen(false);
  };

  // ----- Dialog drag handlers -----
  const handleDialogPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!dialogRect) return;
    setIsDraggingDialog(true);
    dialogDragStartRef.current = { x: e.clientX, y: e.clientY };
    dialogOffsetStartRef.current = { x: dialogOffset.x, y: dialogOffset.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleDialogPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDialog || !dialogRect) return;
    const deltaX = e.clientX - dialogDragStartRef.current.x;
    const deltaY = e.clientY - dialogDragStartRef.current.y;
    setDialogOffset({
      x: dialogOffsetStartRef.current.x + deltaX,
      y: dialogOffsetStartRef.current.y + deltaY,
    });
  };

  const handleDialogPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingDialog) {
      setIsDraggingDialog(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  // ----- Preset colors -----
  const presetColors = [
    "#ffffff",
    "#f3f4f6",
    "#e5e7eb",
    "#fef3c7",
    "#fce7f3",
    "#e0f2fe",
    "#d1fae5",
    "#ede9fe",
    "#fed7aa",
    "#fecaca",
    "#cffafe",
    "#f3e8ff",
  ];

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <>
      <div
        ref={nodeRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: "absolute",
          transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
          width: `${node.width}px`,
          height: node.height ? `${node.height}px` : "auto",
          zIndex: isSelected || isDragging || isResizing ? 50 : 10,
          touchAction: "none",
          backgroundColor: node.backgroundColor || "transparent",
        }}
        className={`group rounded-xl border p-4 shadow-sm relative transition-shadow duration-150 ${
          isDragging || isResizing
            ? "select-none pointer-events-none shadow-lg"
            : ""
        } ${
          isSelected || isDragging
            ? "border-blue-500 border-2 ring-1 ring-blue-500/30"
            : darkMode
              ? "bg-zinc-900/90 border-zinc-800 text-zinc-100 hover:border-zinc-700"
              : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300"
        }`}
      >
        {/* Drag Handle */}
        <div
          ref={dragHandleRef}
          className={`absolute w-[calc(100%-7rem)] left-1/2 -translate-x-1/2 -top-2 z-30 flex items-center justify-center px-3 py-1 rounded-full select-none transition-all duration-200 ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          } ${
            darkMode
              ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border border-zinc-600"
              : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700 border border-zinc-300"
          } ${isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
        >
          <div className="flex gap-1.5 pointer-events-none">
            <span className="size-1 rounded-full bg-current" />
            <span className="size-1 rounded-full bg-current" />
            <span className="size-1 rounded-full bg-current" />
          </div>
        </div>

        {/* Node type label – click to open dialog */}
        <div
          className={`absolute -top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-mono border uppercase z-30 cursor-pointer ${
            darkMode
              ? "bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
              : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100"
          }`}
          onClick={handleOpenDialog}
        >
          <span>{node.type}</span>
        </div>

        {/* Node content */}
        <div
          className={`w-full h-full select-text relative z-20 mt-2 ${
            isDragging || isResizing
              ? "pointer-events-none"
              : "pointer-events-auto"
          }`}
        >
          {children}
        </div>

        {/* Resize Handle */}
        <div
          ref={resizeHandleRef}
          onPointerDown={handleResizeDown}
          className={`absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end p-0.5 rounded-br-md z-30 transition-opacity duration-150 ${
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"
          }`}
        >
          <svg
            width="8"
            height="8"
            viewBox="0 0 10 10"
            className={darkMode ? "text-zinc-600" : "text-zinc-400"}
          >
            <line
              x1="10"
              y1="2"
              x2="2"
              y2="10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="10"
              y1="6"
              x2="6"
              y2="10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* ============================================================
          DIALOG – draggable, positioned relative to the node
          ============================================================ */}
      {dialogOpen &&
        dialogRect &&
        createPortal(
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center "
            onClick={handleCloseDialog}
          >
            <div
              className="rounded-md shadow-2xl p-5 w-72 max-w-[90vw]"
              style={{
                position: "fixed",
                top: dialogRect.top + dialogRect.height / 2 + dialogOffset.y,
                left: dialogRect.left + dialogRect.width / 2 + dialogOffset.x,
                transform: "translate(-50%, -50%)",
                backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
                border: darkMode ? "1px solid #3d3d3d" : "1px solid #e5e5e5",
                userSelect: isDraggingDialog ? "none" : "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Drag Handle (Title bar) */}
              <div
                ref={dialogHeaderRef}
                className="flex justify-between items-center mb-3 cursor-grab active:cursor-grabbing select-none"
                onPointerDown={handleDialogPointerDown}
                onPointerMove={handleDialogPointerMove}
                onPointerUp={handleDialogPointerUp}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                    <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                    <span className="w-1 h-1 rounded-full bg-current opacity-40" />
                  </div>
                  <h4
                    className="text-sm font-medium"
                    style={{ color: darkMode ? "#e0e0e0" : "#1a1a1a" }}
                  >
                    Node Settings
                  </h4>
                </div>
              </div>

              {/* Preset Colors */}
              <div className="mb-3">
                <label
                  className="block text-xs font-medium mb-1.5"
                  style={{ color: darkMode ? "#aaa" : "#666" }}
                >
                  Background Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className="w-6 h-6 rounded-full border-2 transition-all hover:scale-110"
                      style={{
                        backgroundColor: color,
                        borderColor:
                          dialogColor === color
                            ? "#3b82f6"
                            : darkMode
                              ? "#444"
                              : "#ddd",
                      }}
                      onClick={() => setDialogColor(color)}
                    />
                  ))}
                  <button
                    type="button"
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
                    style={{
                      borderColor:
                        dialogColor === "#ffffff"
                          ? "#3b82f6"
                          : darkMode
                            ? "#444"
                            : "#ddd",
                      color: darkMode ? "#aaa" : "#666",
                      backgroundColor: "transparent",
                    }}
                    onClick={() => setDialogColor("#ffffff")}
                    title="Reset to transparent"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Width & Height */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: darkMode ? "#aaa" : "#666" }}
                  >
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={dialogWidth}
                    min="150"
                    step="10"
                    className="w-full rounded-lg border px-3 py-1.5 text-sm"
                    style={{
                      backgroundColor: darkMode ? "#2d2d2d" : "#f9fafb",
                      borderColor: darkMode ? "#3d3d3d" : "#d1d5db",
                      color: darkMode ? "#e0e0e0" : "#1a1a1a",
                    }}
                    onChange={(e) =>
                      setDialogWidth(parseInt(e.target.value, 10) || 150)
                    }
                  />
                </div>
                <div className="flex-1">
                  <label
                    className="block text-xs font-medium mb-1"
                    style={{ color: darkMode ? "#aaa" : "#666" }}
                  >
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={dialogHeight}
                    min="80"
                    step="10"
                    className="w-full rounded-lg border px-3 py-1.5 text-sm"
                    style={{
                      backgroundColor: darkMode ? "#2d2d2d" : "#f9fafb",
                      borderColor: darkMode ? "#3d3d3d" : "#d1d5db",
                      color: darkMode ? "#e0e0e0" : "#1a1a1a",
                    }}
                    onChange={(e) =>
                      setDialogHeight(parseInt(e.target.value, 10) || 80)
                    }
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-1.5 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: darkMode ? "#3d3d3d" : "#f3f4f6",
                    color: darkMode ? "#ccc" : "#333",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyChanges}
                  className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
