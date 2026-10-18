/**
 * @file CanvasNodeWrapper.tsx
 * @component CanvasNodeWrapper
 * @description Structural chassis for absolute-positioned canvas cards. Handles
 * drag/resize, background color theming, and a settings dialog for size + color
 * + delete.
 *
 * @architecture
 * - Delegates pointer gestures to `useCanvasNodeHandlers`.
 * - Persists geometry + color mutations through `useWorkspaceStore`.
 * - Auto-syncs background hex between light/dark palette variants.
 * - Delete lives in the settings dialog; keyboard Del/Backspace is handled
 *   by the workspace's global listener.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CanvasNodeSettingsDialog,
  type AdaptableColor,
} from "./CanvasNodeSettingsDialog";
import { CanvasNodeDragHandle } from "./CanvasNodeDragHandle";
import { useCanvas } from "./CanvasContext";
import type { MockPageNode, NodeComponentType } from "../../assets/SAMPLE";
import { useCanvasNodeHandlers } from "../useCanvasNodeHandlers";

import { useWorkspaceStore } from "../../Store/store";

/**
 * Re-export for consumers that still import the union from this module.
 * Canonical definition lives in `stores/notebook/types`.
 */
export type { NodeComponentType };

interface CanvasNodeWrapperProps {
  node: MockPageNode;
  notebookId: string;
  pageId: string;
  darkMode: boolean;
  /** Whether this node currently holds focus. */
  isSelected: boolean;
  /** Focus assignment callback. */
  onSelect: (id: string) => void;
  children: React.ReactNode;
}

/**
 * Palette of tag-able backgrounds. Module-scoped so the auto-sync effect
 * doesn't need it in its dependency list.
 */
const PRESET_COLORS: AdaptableColor[] = [
  { name: "White/Charcoal", light: "#ffffff", dark: "#1f1f1f" },
  { name: "Gray", light: "#f3f4f6", dark: "#2d3139" },
  { name: "Silver", light: "#e5e7eb", dark: "#3a3f4b" },
  { name: "Amber/Yellow", light: "#fef3c7", dark: "#975314" },
  { name: "Pink", light: "#fce7f3", dark: "#4c283a" },
  { name: "Blue", light: "#e0f2fe", dark: "#1e3a5f" },
  { name: "Emerald/Green", light: "#d1fae5", dark: "#1a4731" },
  { name: "Purple", light: "#ede9fe", dark: "#3d2d61" },
  { name: "Orange", light: "#fed7aa", dark: "#4c2d1a" },
  { name: "Red", light: "#fecaca", dark: "#542323" },
  { name: "Cyan", light: "#cffafe", dark: "#164e63" },
  { name: "Violet", light: "#f3e8ff", dark: "#3b2261" },
];

export const CanvasNodeWrapper: React.FC<CanvasNodeWrapperProps> = (props) => {
  const { node, notebookId, pageId, darkMode, isSelected, children } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRect, setDialogRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const nodeRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  const { zoom, selectedNodeId, deleteSelectedNode } = useCanvas();

  // Local prop wins; fall back to context selection as a safety net.
  const isActive =
    isSelected || (selectedNodeId !== null && selectedNodeId === node.id);

  const handlers = useCanvasNodeHandlers({
    ...props,
    setIsDragging,
    setIsResizing,
    isDragging,
    isResizing,
    nodeRef,
    dragHandleRef,
    resizeHandleRef,
    zoom,
  });

  // ==========================================
  // LIFECYCLE: AUTO PALETTE SYNC
  // ==========================================
  useEffect(() => {
    const bg = node.backgroundColor;
    if (!bg || bg === "transparent") return;

    const match = PRESET_COLORS.find(
      (c) =>
        c.light.toLowerCase() === bg.toLowerCase() ||
        c.dark.toLowerCase() === bg.toLowerCase(),
    );
    if (!match) return;

    const targetHex = darkMode ? match.dark : match.light;
    if (bg === targetHex) return;

    useWorkspaceStore
      .getState()
      .updateNodeBackgroundColor(notebookId, pageId, node.id, targetHex);
  }, [darkMode, node.id, node.backgroundColor, notebookId, pageId]);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleOpenDialog = useCallback((e: React.MouseEvent) => {
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
    setDialogOpen(true);
  }, []);

  const handleApplyChanges = useCallback(
    (width: number, height: number, backgroundColor: string) => {
      const { updateNodeSize, updateNodeBackgroundColor } =
        useWorkspaceStore.getState();

      updateNodeSize(notebookId, pageId, node.id, width, height);
      updateNodeBackgroundColor(notebookId, pageId, node.id, backgroundColor);
      setDialogOpen(false);
    },
    [notebookId, pageId, node.id],
  );

  /**
   * Deletes this node. Routes through `deleteSelectedNode` when this node is
   * the current selection (so context state clears), otherwise falls back to
   * a direct store call.
   */
  const handleDelete = useCallback(() => {
    if (selectedNodeId === node.id) {
      deleteSelectedNode();
      return;
    }

    useWorkspaceStore
      .getState()
      .deleteNodeFromPage(notebookId, pageId, node.id);
  }, [selectedNodeId, deleteSelectedNode, notebookId, pageId, node.id]);

  // ==========================================
  // COMPUTED STYLE
  // ==========================================
  const resolvedWidth = useMemo(() => `${node.width}px`, [node.width]);

  /** Text nodes are content-driven; map nodes honor their stored height. */
  const resolvedHeight = useMemo(() => {
    if (node.type === "text") return "auto";
    return node.height ? `${node.height}px` : "auto";
  }, [node.type, node.height]);

  const resolvedBackground = useMemo<string | undefined>(
    () => node.backgroundColor || undefined,
    [node.backgroundColor],
  );

  const isInteracting = isDragging || isResizing;

  return (
    <>
      {/* ==========================================
          PRIMARY CONTAINER SHELL
          ========================================== */}
      <div
        ref={nodeRef}
        onPointerDown={handlers.handlePointerDown}
        onPointerMove={handlers.handlePointerMove}
        onPointerUp={handlers.handlePointerUp}
        onPointerCancel={handlers.handlePointerCancel}
        style={{
          position: "absolute",
          transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
          width: resolvedWidth,
          height: resolvedHeight,
          zIndex: isActive || isInteracting ? 50 : 10,
          touchAction: "none",
          backgroundColor: resolvedBackground,
        }}
        className={`group rounded-xl border p-4 shadow-sm relative transition-shadow duration-150 ${
          isInteracting ? "select-none pointer-events-none shadow-lg" : ""
        } ${
          isActive || isDragging
            ? "border-blue-500 border-2 ring-1 ring-blue-500/30"
            : darkMode
              ? "bg-zinc-900/90 border-zinc-800 text-zinc-100 hover:border-zinc-700"
              : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300"
        }`}
      >
        <CanvasNodeDragHandle
          isDragging={isDragging}
          isSelected={isActive}
          darkMode={darkMode}
          innerRef={dragHandleRef}
        />

        {/* Floating type badge — opens the settings dialog */}
        <button
          type="button"
          onClick={handleOpenDialog}
          className={`absolute -top-3 right-3 z-30 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-mono border uppercase cursor-pointer ${
            darkMode
              ? "bg-zinc-950 border-zinc-800 text-zinc-500 hover:bg-zinc-800"
              : "bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100"
          }`}
          aria-label={`Open settings for ${node.type} block`}
        >
          {node.type}
        </button>

        {/* Content */}
        <div
          className={`w-full h-full select-text relative z-20 mt-2 ${
            isInteracting ? "pointer-events-none" : "pointer-events-auto"
          }`}
        >
          {children}
        </div>

        {/* Resize handle — text nodes resize horizontally only */}
        <div
          ref={resizeHandleRef}
          onPointerDown={handlers.handleResizeDown}
          className={`absolute bottom-1 right-1 w-3.5 h-3.5 flex items-end justify-end p-0.5 rounded-br-md z-30 transition-opacity duration-150 ${
            node.type === "text" ? "cursor-ew-resize" : "cursor-se-resize"
          } ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
        >
          {node.type === "text" ? (
            <div
              className={`w-1 h-3 rounded-full ${
                darkMode ? "bg-zinc-600" : "bg-zinc-400"
              }`}
            />
          ) : (
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
          )}
        </div>
      </div>

      <CanvasNodeSettingsDialog
        isOpen={dialogOpen}
        darkMode={darkMode}
        nodeType={node.type}
        initialColor={node.backgroundColor || "transparent"}
        initialWidth={node.width}
        initialHeight={node.height || 150}
        anchorRect={dialogRect}
        presetColors={PRESET_COLORS}
        onClose={() => setDialogOpen(false)}
        onDelete={() => {
          handleDelete();
          setDialogOpen(false);
        }}
        onApply={handleApplyChanges}
      />
    </>
  );
};

export default CanvasNodeWrapper;
