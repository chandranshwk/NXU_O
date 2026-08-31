/**
 * @file CanvasNodeWrapper.tsx
 * @component CanvasNodeWrapper
 * @description A structural chassis wrapping absolute-positioned spatial canvas cards.
 * Provides base infrastructure for 3D translations, border handles, color adjustments,
 * and dimension overlays.
 *
 * @architecture
 * - Submits geometry adjustments back to `useNotebookStore` stores.
 * - Outsources operational input processing down to the `useCanvasNodeHandlers` utility hook.
 * - Dynamically renders resize indicator handles tailored to specific structural component rules.
 */

import React, { useRef, useState, useEffect } from "react";
import { useNotebookStore } from "../contexts/notebook";
import type { MockPageNode } from "../assets/SAMPLE";
import {
  CanvasNodeSettingsDialog,
  type AdaptableColor,
} from "./CanvasNodeSettingsDialog";
import { CanvasNodeDragHandle } from "./CanvasNodeDragHandle";
import { useCanvasNodeHandlers } from "./useCanvasNodeHandlers";

export type NodeComponentType = "text" | "calendar" | "map" | "todo";

export interface CanvasNodeData {
  /** Uniquely generated identification tracking string */
  id: string;
  /** Identifies targeted child content block render blueprints */
  type: NodeComponentType;
  /** Left offset margin coordinate across structural spatial grids */
  x: number;
  /** Top offset margin coordinate across structural spatial grids */
  y: number;
  /** Explicit horizontal boundary constraint parameter */
  width: number;
  /** Explicit vertical boundary constraint parameter */
  height?: number;
  /** String payload block formatting text or component states */
  content: string;
  /** Hex configuration value styling card background panels */
  backgroundColor?: string;
}

interface CanvasNodeWrapperProps {
  /** Raw spatial geometry metadata object block tracking card configurations */
  node: MockPageNode;
  /** Directory id linking components straight back to data store tables */
  notebookId: string;
  /** Section token parameters connecting structural path layers */
  sectionId: string;
  /** Target page location index layer housing absolute workspace boards */
  pageId: string;
  /** Shared dark mode setting flag used to modify palette ranges */
  darkMode: boolean;
  /** Evaluation flag confirming if this card instance holds focus */
  isSelected: boolean;
  /** Focus assignment callback highlighting frames above neighboring strands */
  onSelect: (id: string) => void;
  /** Embedded child layout node injected down factory switches */
  children: React.ReactNode;
}

export const CanvasNodeWrapper: React.FC<CanvasNodeWrapperProps> = (props) => {
  const {
    node,
    notebookId,
    sectionId,
    pageId,
    darkMode,
    isSelected,
    children,
  } = props;

  /** Operational status reporting if card dragging stays active */
  const [isDragging, setIsDragging] = useState(false);
  /** Operational status reporting if dimension adjustments stay active */
  const [isResizing, setIsResizing] = useState(false);
  /** Visibility toggle flag governing parameter setting dialogue modal overlays */
  const [dialogOpen, setDialogOpen] = useState(false);
  /** Bounding box metrics recording spatial footprints before spawning context grids */
  const [dialogRect, setDialogRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  /** Root structural wrapper link capturing element coordinate bounds */
  const nodeRef = useRef<HTMLDivElement>(null);
  /** Handle tracker anchoring drag click intersections */
  const dragHandleRef = useRef<HTMLDivElement>(null);
  /** Handle tracker anchoring resize click intersections */
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Bind operational inputs to shared motion configuration listeners
  const handlers = useCanvasNodeHandlers({
    ...props,
    setIsDragging,
    setIsResizing,
    isDragging,
    isResizing,
    nodeRef,
    dragHandleRef,
    resizeHandleRef,
  });

  /** Standard color configuration array matching light vs dark execution surfaces */
  const presetColors: AdaptableColor[] = [
    { name: "White/Charcoal", light: "#ffffff", dark: "#1f1f1f" },
    { name: "Gray", light: "#f3f4f6", dark: "#2d3139" },
    { name: "Silver", light: "#e5e7eb", dark: "#3a3f4b" },
    { name: "Amber/Yellow", light: "#fef3c7", dark: "#975314" },
    { name: "Pink", light: "#fce7f3", dark: "#4c283a" },
    { name: "Blue", light: "#e0f2fe", dark: "#1e3a5f" },
    { name: "Emerald/Green", light: "#d1fae5", dark: "#1a4731" },
    { name: "Purple", light: "#ede9fe", dark: "#3c2d61" },
    { name: "Orange", light: "#fed7aa", dark: "#4c2d1a" },
    { name: "Red", light: "#fecaca", dark: "#542323" },
    { name: "Cyan", light: "#cffafe", dark: "#164e63" },
    { name: "Violet", light: "#f3e8ff", dark: "#3b2261" },
  ];

  // ==========================================
  // LIFECYCLE: AUTOMATED PALETTE ALIGNER
  // ==========================================
  /**
   * Automatically swaps hex parameters when global system styles transition,
   * ensuring custom container backdrops match light vs dark themes gracefully.
   */
  useEffect(() => {
    if (!node.backgroundColor || node.backgroundColor === "transparent") return;

    const matchedColor = presetColors.find(
      (c) =>
        c.light.toLowerCase() === node.backgroundColor?.toLowerCase() ||
        c.dark.toLowerCase() === node.backgroundColor?.toLowerCase(),
    );

    if (matchedColor) {
      const targetColorHex = darkMode ? matchedColor.dark : matchedColor.light;

      if (node.backgroundColor !== targetColorHex) {
        const { updateNodeBackgroundColor } = useNotebookStore.getState();
        if (updateNodeBackgroundColor) {
          updateNodeBackgroundColor(
            notebookId,
            sectionId,
            pageId,
            node.id,
            targetColorHex,
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode, node.id, notebookId, sectionId, pageId, node.backgroundColor]);

  // ==========================================
  // ACTIONS: MODAL DIALOGUE PARAMETERS
  // ==========================================
  /** Captures DOM rectangle vectors right before drawing parameter menus */
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
    setDialogOpen(true);
  };

  /** Saves modified configuration values back into global application store layers */
  const handleApplyChanges = (
    width: number,
    height: number,
    backgroundColor: string,
  ) => {
    const { updateNodeSize, updateNodeBackgroundColor } =
      useNotebookStore.getState();
    updateNodeSize(notebookId, sectionId, pageId, node.id, width, height);
    if (updateNodeBackgroundColor) {
      updateNodeBackgroundColor(
        notebookId,
        sectionId,
        pageId,
        node.id,
        backgroundColor,
      );
    }
    setDialogOpen(false);
  };

  return (
    <>
      {/* ==========================================
          PRIMARY CONTAINER SHELL: TRANSLATED MATRIX CARD
          ========================================== */}
      <div
        ref={nodeRef}
        onPointerDown={handlers.handlePointerDown}
        onPointerMove={handlers.handlePointerMove}
        onPointerUp={handlers.handlePointerUp}
        style={{
          position: "absolute",
          // translate3d forces GPU hardware acceleration to ensure fluid motion
          transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
          width: `${node.width}px`,
          height:
            node.type === "text"
              ? "auto"
              : node.height
                ? `${node.height}px`
                : "auto",
          minHeight: "max-content",
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
        {/* UPPER BORDER DRAG HANDLE PILOT */}
        <CanvasNodeDragHandle
          isDragging={isDragging}
          isSelected={isSelected}
          darkMode={darkMode}
          innerRef={dragHandleRef}
        />

        {/* FLOATING CONTEXT IDENTIFICATION BADGE METADATA BLOCK */}
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

        {/* INTERIOR ACTIVE WORKSPACE CONTENT FACTORY ELEMENT */}
        <div
          className={`w-full h-full select-text relative z-20 mt-2 ${isDragging || isResizing ? "pointer-events-none" : "pointer-events-auto"}`}
        >
          {children}
        </div>

        {/* ==========================================
            BOTTOM RIGHT RESIZE CORNER TRACK GRIDS
            ========================================== */}
        <div
          ref={resizeHandleRef}
          onPointerDown={handlers.handleResizeDown}
          className={`absolute bottom-1 right-1 w-3.5 h-3.5 flex items-end justify-end p-0.5 rounded-br-md z-30 transition-opacity duration-150 ${
            node.type === "text" ? "cursor-ew-resize" : "cursor-se-resize"
          } ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
        >
          {/* Text blocks use a vertical line bar tracker; general widgets map diagonal vectors */}
          {node.type === "text" ? (
            <div
              className={`w-1 h-3 rounded-full ${darkMode ? "bg-zinc-600" : "bg-zinc-400"}`}
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
      {/* FLOATING COMPONENT LAYOUT PROPERTY SETTING SHEET OVERLAY */}
      <CanvasNodeSettingsDialog
        isOpen={dialogOpen}
        darkMode={darkMode}
        nodeType={node.type}
        initialColor={node.backgroundColor || "transparent"}
        initialWidth={node.width}
        initialHeight={node.height || 150}
        anchorRect={dialogRect}
        presetColors={presetColors}
        onClose={() => setDialogOpen(false)}
        onApply={handleApplyChanges}
      />
    </>
  );
};

export default CanvasNodeWrapper;
