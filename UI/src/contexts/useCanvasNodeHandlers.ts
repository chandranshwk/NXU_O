/**
 * @file useCanvasNodeHandlers.ts
 * @hook useCanvasNodeHandlers
 * @description A custom pointer events hook that manages drag-and-drop movement
 * and edge-resizing mechanics for absolute-positioned canvas content cards.
 *
 * @architecture
 * - Coordinates state dispatch modifications with the central `useNotebookStore`.
 * - Employs HTML5 Pointer Capture APIs (`setPointerCapture`) to ensure continuous
 *   mouse movement metrics remain uninterrupted outside layout boundaries.
 * - Enforces screen boundary locks to keep cards from slipping off viewable edges.
 */

import React, { useRef } from "react";
import { useNotebookStore } from "../contexts/notebook";
import type { MockPageNode } from "../assets/SAMPLE";

interface UseCanvasHandlersProps {
  /** Raw metadata blueprint tracking coordinates, dimension shapes, and block type identifiers */
  node: MockPageNode;
  /** Directory id linking back to the root notebook model layer */
  notebookId: string;
  /** Section identification token matching parent navigation branches */
  sectionId: string;
  /** Active page layout parameter hosting this specific block element */
  pageId: string;
  /** Focus selection callback highlighting this card frame out of sibling strands */
  onSelect: (id: string) => void;
  /** Status toggle dispatcher capturing when drag actions engage */
  setIsDragging: (val: boolean) => void;
  /** Status toggle dispatcher capturing when dimension adjustments engage */
  setIsResizing: (val: boolean) => void;
  /** Operational flag reporting if card dragging stays active */
  isDragging: boolean;
  /** Operational flag reporting if size adjustments stay active */
  isResizing: boolean;
  /** Outer boundary element reference capturing target rendering shapes */
  nodeRef: React.RefObject<HTMLDivElement | null>;
  /** Handle reference node capturing mouse triggers initiating card drags */
  dragHandleRef: React.RefObject<HTMLDivElement | null>;
  /** Handle reference node capturing mouse triggers initiating card sizing */
  resizeHandleRef: React.RefObject<HTMLDivElement | null>;
  /** Zoom */
  zoom: number;
}

export const useCanvasNodeHandlers = ({
  node,
  notebookId,
  sectionId,
  pageId,
  onSelect,
  setIsDragging,
  setIsResizing,
  isDragging,
  isResizing,
  nodeRef,
  dragHandleRef,
  resizeHandleRef,
  zoom,
}: UseCanvasHandlersProps) => {
  /** Remembers window coordinate start footprints upon primary mouse down events */
  const dragStartRef = useRef({ x: 0, y: 0 });
  /** Captures bounding snapshot shapes exactly before translation offsets load values */
  const nodeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  /** Measures text content height margins to block sizing breaks */
  const contentFloorRef = useRef<number>(0);

  // ==========================================
  // INTERACTION 1: CARD DRAG POINTER DOWN
  // ==========================================
  /**
   * Captures screen metrics when clicking drag handles. Locks pointer tracking
   * onto the target container element to maintain tracking focus over external panes.
   */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Intercept and bypass actions if cursor coordinates land on resize nodes
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
      height:
        nodeRef.current?.getBoundingClientRect().height || node.height || 150,
    };

    // Bind cursor trajectory capturing straight onto this layout track handle
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // ==========================================
  // INTERACTION 2: POINTER MOVE TRANSLATION
  // ==========================================
  /**
   * Tracks moving trajectories. Computes positioning offsets during drag frames,
   * or scales width and height variables while respecting specific block design constraints.
   */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();

      // 1. Calculate the raw mouse movement delta in canvas space
      const deltaX = (e.clientX - dragStartRef.current.x) / zoom;
      const deltaY = (e.clientY - dragStartRef.current.y) / zoom;

      // 2. UNRESTRICTED CORE: Direct linear target coordinates without any window barriers
      const targetX = Math.round(nodeStartRef.current.x + deltaX);
      const targetY = Math.round(nodeStartRef.current.y + deltaY);

      const { updateNodePosition } = useNotebookStore.getState();
      updateNodePosition(
        notebookId,
        sectionId,
        pageId,
        node.id,
        targetX,
        targetY,
      );
    } else if (isResizing) {
      e.stopPropagation();

      // Calculate resizing updates accurately adjusted by the zoom scale factor
      const deltaX = (e.clientX - dragStartRef.current.x) / zoom;
      const deltaY = (e.clientY - dragStartRef.current.y) / zoom;

      // 3. CLEAN RESIZING: Only restrict by structural element minimum thresholds (e.g., 150px)
      const calculatedWidth = Math.round(nodeStartRef.current.width + deltaX);
      const targetWidth = Math.max(150, calculatedWidth);

      const rawDraggedHeight = Math.round(nodeStartRef.current.height + deltaY);

      // Text nodes manage their vertical heights fluidly via native markup paragraph constraints
      const targetHeight =
        node.type === "text"
          ? node.height || 150
          : Math.max(80, rawDraggedHeight);

      const { updateNodeSize } = useNotebookStore.getState();
      if (updateNodeSize && node.type !== "calendar") {
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

  // ==========================================
  // INTERACTION 3: RELEASE MOUSE POINTER UP
  // ==========================================
  /** Unlocks active pointer bindings and resets interaction tracking states safely */
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging || isResizing) {
      setIsDragging(false);
      setIsResizing(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // ==========================================
  // INTERACTION 4: CORNER RESIZE POINTER DOWN
  // ==========================================
  /** Captures element shapes and content boundaries immediately when sizing drags engage */
  const handleResizeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect(node.id);
    setIsResizing(true);

    dragStartRef.current = { x: e.clientX, y: e.clientY };

    // Scrapes interior text block baselines to block dimension clips
    const innerContentEl = nodeRef.current?.querySelector(
      ".select-text",
    ) as HTMLElement;
    contentFloorRef.current = innerContentEl
      ? innerContentEl.getBoundingClientRect().height + 48
      : 120;

    const currentDOMHeight = nodeRef.current
      ? nodeRef.current.getBoundingClientRect().height
      : node.height || 150;

    const currentRenderedHeight = Math.max(
      node.height || 150,
      currentDOMHeight,
    );

    nodeStartRef.current = {
      x: node.x,
      y: node.y,
      width: node.width,
      height: currentRenderedHeight,
    };

    e.currentTarget.parentElement?.setPointerCapture(e.pointerId);
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleResizeDown,
  };
};
