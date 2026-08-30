import React, { useRef } from "react";
import { useNotebookStore } from "../contexts/notebook";
import type { MockPageNode } from "../assets/SAMPLE";

interface UseCanvasHandlersProps {
  node: MockPageNode;
  notebookId: string;
  sectionId: string;
  pageId: string;
  onSelect: (id: string) => void;
  setIsDragging: (val: boolean) => void;
  setIsResizing: (val: boolean) => void;
  isDragging: boolean;
  isResizing: boolean;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  dragHandleRef: React.RefObject<HTMLDivElement | null>;
  resizeHandleRef: React.RefObject<HTMLDivElement | null>;
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
}: UseCanvasHandlersProps) => {
  const dragStartRef = useRef({ x: 0, y: 0 });
  const nodeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Kept for text content calculations only
  const contentFloorRef = useRef<number>(0);

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
        nodeRef.current?.getBoundingClientRect().height || node.height || 150,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.stopPropagation();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const maxDragX = window.innerWidth - node.width - 24;
      const maxDragY =
        window.innerHeight -
        (nodeRef.current?.getBoundingClientRect().height || 150) -
        24;

      const targetX = Math.max(
        0,
        Math.min(maxDragX, Math.round(nodeStartRef.current.x + deltaX)),
      );
      const targetY = Math.max(
        0,
        Math.min(maxDragY, Math.round(nodeStartRef.current.y + deltaY)),
      );

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
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const maxResizeWidth = window.innerWidth - node.x - 24;
      const calculatedWidth = Math.round(nodeStartRef.current.width + deltaX);
      const targetWidth = Math.max(
        150,
        Math.min(maxResizeWidth, calculatedWidth),
      );

      const rawDraggedHeight = Math.round(nodeStartRef.current.height + deltaY);

      // FIXED: Separated calculation routes cleanly
      // Text nodes stick to their internal state height (ignoring mouse vertical deltas).
      // All other widgets (calendar, map, etc.) unlock completely and scale freely.
      const targetHeight =
        node.type === "text"
          ? node.height || 150
          : Math.max(80, rawDraggedHeight);

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
    if (isDragging || isResizing) {
      setIsDragging(false);
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
