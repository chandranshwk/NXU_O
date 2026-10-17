/**
 * @file useCanvasNodeHandlers.ts
 * @hook useCanvasNodeHandlers
 * @description Pointer-event handlers for dragging and resizing canvas nodes.
 *
 * @architecture
 * - Coordinates state dispatch with `useNotebookStore`.
 * - Uses Pointer Capture so gestures continue outside the node's bounds.
 * - Text nodes resize horizontally only; map nodes resize on both axes.
 */

import React, { useEffect, useRef } from "react";
import { useNotebookStore } from "../Store/store";
import type { MockPageNode } from "../assets/SAMPLE";

interface UseCanvasHandlersProps {
  node: MockPageNode;
  notebookId: string;
  pageId: string;
  onSelect: (id: string) => void;
  setIsDragging: (val: boolean) => void;
  setIsResizing: (val: boolean) => void;
  isDragging: boolean;
  isResizing: boolean;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  dragHandleRef: React.RefObject<HTMLDivElement | null>;
  resizeHandleRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
}

/** Minimum dimensions enforced during resize. */
const MIN_WIDTH = 150;
const MIN_HEIGHT = 80;

export const useCanvasNodeHandlers = ({
  node,
  notebookId,
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
  /** Pointer position at gesture start, in screen coordinates. */
  const dragStartRef = useRef({ x: 0, y: 0 });

  /** Node geometry at gesture start, snapshot so mid-drag store updates don't cascade. */
  const nodeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  /** Measured inner content height — floors resize so content isn't clipped. */
  const contentFloorRef = useRef<number>(0);

  // ==========================================
  // LIFECYCLE: UNMOUNT SAFETY
  // ==========================================
  /**
   * If the node unmounts mid-gesture (page switched, node deleted), reset
   * the interaction flags so the parent doesn't hang in a dragging state.
   */
  useEffect(() => {
    return () => {
      setIsDragging(false);
      setIsResizing(false);
    };
  }, [setIsDragging, setIsResizing]);

  // ==========================================
  // SHARED: SAFE POINTER-CAPTURE RELEASE
  // ==========================================
  /**
   * `releasePointerCapture` throws if the pointer id has no active capture
   * (e.g. after `pointercancel` auto-released it). Swallow that.
   */
  const releaseCaptureSafe = (el: Element | null, pointerId: number): void => {
    if (!el) return;
    try {
      el.releasePointerCapture(pointerId);
    } catch {
      /* pointer already released — nothing to do */
    }
  };

  // ==========================================
  // INTERACTION 1: DRAG POINTER DOWN
  // ==========================================
  /**
   * Only initiates drag when the pointer lands on the dedicated drag handle.
   * Captures the pointer on the outer node so subsequent moves keep flowing
   * here even when the cursor leaves the node's bounds.
   */
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
      height:
        nodeRef.current?.getBoundingClientRect().height ?? node.height ?? 150,
    };

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  // ==========================================
  // INTERACTION 2: POINTER MOVE
  // ==========================================
  /**
   * Branches on the active gesture. Both deltas are divided by `zoom` so
   * movement is 1:1 with the visual grid regardless of scale.
   */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();

      const deltaX = (e.clientX - dragStartRef.current.x) / zoom;
      const deltaY = (e.clientY - dragStartRef.current.y) / zoom;

      const targetX = Math.round(nodeStartRef.current.x + deltaX);
      const targetY = Math.round(nodeStartRef.current.y + deltaY);

      useNotebookStore
        .getState()
        .updateNodePosition(notebookId, pageId, node.id, targetX, targetY);
      return;
    }

    if (isResizing) {
      e.stopPropagation();

      const deltaX = (e.clientX - dragStartRef.current.x) / zoom;
      const deltaY = (e.clientY - dragStartRef.current.y) / zoom;

      const targetWidth = Math.max(
        MIN_WIDTH,
        Math.round(nodeStartRef.current.width + deltaX),
      );

      // Text nodes drive their own height from markup — the resize gesture
      // only affects width. Map nodes resize on both axes.
      const targetHeight =
        node.type === "text"
          ? nodeStartRef.current.height
          : Math.max(
              MIN_HEIGHT,
              contentFloorRef.current,
              Math.round(nodeStartRef.current.height + deltaY),
            );

      useNotebookStore
        .getState()
        .updateNodeSize(notebookId, pageId, node.id, targetWidth, targetHeight);
    }
  };

  // ==========================================
  // INTERACTION 3: POINTER UP / CANCEL
  // ==========================================
  /** Ends any active gesture and releases pointer capture. */
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging && !isResizing) return;

    setIsDragging(false);
    setIsResizing(false);
    releaseCaptureSafe(e.currentTarget, e.pointerId);
  };

  /** Pointer cancel fires when the browser interrupts — same cleanup, no throw. */
  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    setIsResizing(false);
    releaseCaptureSafe(e.currentTarget, e.pointerId);
  };

  // ==========================================
  // INTERACTION 4: CORNER RESIZE POINTER DOWN
  // ==========================================
  /**
   * Snapshots the current rendered size and measures the inner content block
   * so later drags can't shrink below the content floor.
   */
  const handleResizeDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    onSelect(node.id);
    setIsResizing(true);

    dragStartRef.current = { x: e.clientX, y: e.clientY };

    const innerContentEl = nodeRef.current?.querySelector(
      ".select-text",
    ) as HTMLElement | null;
    contentFloorRef.current = innerContentEl
      ? innerContentEl.getBoundingClientRect().height + 48
      : MIN_HEIGHT;

    const currentDOMHeight = nodeRef.current
      ? nodeRef.current.getBoundingClientRect().height
      : (node.height ?? 150);

    nodeStartRef.current = {
      x: node.x,
      y: node.y,
      width: node.width,
      height: Math.max(node.height ?? 150, currentDOMHeight),
    };

    // Capture on the outer node (parent) so its pointermove/up handlers
    // receive events, not the small resize handle.
    const captureEl = e.currentTarget.parentElement;
    if (captureEl) {
      captureEl.setPointerCapture(e.pointerId);
    }
  };

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    handleResizeDown,
  };
};
