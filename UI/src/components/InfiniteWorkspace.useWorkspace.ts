import React, { useState, useRef, useEffect } from "react";
import { useCanvas } from "../contexts/CanvasContext";
import type { MockNotebook, MockPage, MockSection } from "../assets/SAMPLE";
import { useNotebookStore } from "../contexts/notebook";
import { useEditorContext } from "../contexts/editorContext";
import { renderTexturedLine, type BrushType } from "./useDrawingTextures";

interface UseWorkspacePanZoomProps {
  currentPage: MockPage | undefined;
  activeNotebook: MockNotebook | null;
  currentSection: MockSection | undefined;
  darkMode: boolean;
}

export const useWorkspacePanZoom = ({
  currentPage,
  activeNotebook,
  currentSection,
}: UseWorkspacePanZoomProps) => {
  const [localTitle, setLocalTitle] = useState("");
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const { zoom, setZoom, setPanning } = useCanvas();
  const { activeCanvasTool } = useEditorContext();
  const [isDragging, setIsDragging] = useState(false);

  const dragStart = useRef({ x: 0, y: 0 });
  const viewportNodeRef = useRef<HTMLDivElement | null>(null);

  // --- BRUSH & ERASER CONFIGURATION STATES ---
  const [brushColor, setBrushColor] = useState("#10b981");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [brushType, setBrushType] = useState<BrushType>("pen");
  const [eraserSize, setEraserSize] = useState(24);

  const [mouseScreenPos, setMouseScreenPos] = useState({ x: 0, y: 0 });
  const [isPaintingState, setIsPaintingState] = useState(false);

  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPaintingRef = useRef(false);
  const lastDrawingPointRef = useRef({ x: 0, y: 0 });

  // --- BITMAP RASTER UNDO / REDO HISTORY STACKS ---
  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Sync title input updates when selected page changes
  useEffect(() => {
    if (currentPage?.title) {
      setTimeout(() => setLocalTitle(String(currentPage.title)), 0);
    } else {
      setTimeout(() => setLocalTitle(""), 0);
    }
  }, [currentPage?.id, currentPage?.title]);

  const commitTitleChange = () => {
    const trimmed = localTitle.trim();
    if (
      !activeNotebook ||
      !currentSection ||
      !currentPage ||
      trimmed === "" ||
      trimmed === currentPage.title
    )
      return;
    const { renamePage } = useNotebookStore.getState();
    if (renamePage) {
      renamePage(activeNotebook.id, currentSection.id, currentPage.id, trimmed);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeCanvasTool === "Sketch" || activeCanvasTool === "Erase") return;
    const target = e.target as HTMLElement;
    const isBackgroundClick =
      target === viewportNodeRef.current ||
      target.id === "infinite-canvas-viewport" ||
      target.id === "infinite-grid-layer";
    if (
      !isBackgroundClick ||
      target.closest("input") ||
      target.closest("button")
    )
      return;

    setIsDragging(true);
    setPanning(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleGlobalMouseMove = (e: MouseEvent) => {
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    };
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setPanning(false);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  // --- UNDO / REDO SNAPSHOT MATRIX MACHINE ---
  const triggerUndo = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || undoStack.length === 0) return;

    const nextUndoStack = [...undoStack];
    const previousSnapshot = nextUndoStack.pop()!;

    // Save current view state to redo track before applying rollback
    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoStack((prev) => [currentSnapshot, ...prev]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(previousSnapshot, 0, 0);
    setUndoStack(nextUndoStack);
  };

  const triggerRedo = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || redoStack.length === 0) return;

    const nextRedoStack = [...redoStack];
    const restoredSnapshot = nextRedoStack.shift()!;

    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev, currentSnapshot]);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(restoredSnapshot, 0, 0);
    setRedoStack(nextRedoStack);
  };

  // Keyboard shortcut bounds listener
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "=" || e.key === "+" || e.key === "-") {
          e.preventDefault();
          setZoom((prev) => {
            const step = e.key === "-" ? -0.2 : 0.2;
            return Math.min(Math.max(prev + step, 0.2), 3.0);
          });
        } else if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          if (e.shiftKey) {
            triggerRedo();
          } else {
            triggerUndo();
          }
        } else if (e.key.toLowerCase() === "y") {
          e.preventDefault();
          triggerRedo();
        }
      }
    };
    window.addEventListener("keydown", handleKeys, { capture: true });
    return () =>
      window.removeEventListener("keydown", handleKeys, { capture: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undoStack, redoStack]);

  const getBrushAlpha = (type: BrushType) => {
    switch (type) {
      case "marker":
        return 0.5;
      case "pencil":
        return 0.65;
      case "brush":
        return 0.55;
      default:
        return 1.0;
    }
  };

  // ==========================================================
  // SKETCHPAD LIFE INTERACTIONS HANDLERS
  // ==========================================================
  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeCanvasTool !== "Sketch" && activeCanvasTool !== "Erase") return;
    e.stopPropagation();

    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Save a pixel snapshot to history state before editing begins
    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev, currentSnapshot]);

    // Clear redo history when a new action starts
    if (redoStack.length > 0) setRedoStack([]);

    const rect = canvas.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left) / zoom;
    const canvasY = (e.clientY - rect.top) / zoom;

    isPaintingRef.current = true;
    setIsPaintingState(true);
    lastDrawingPointRef.current = { x: canvasX, y: canvasY };
    setMouseScreenPos({ x: e.clientX, y: e.clientY });
  };

  const handleDrawOrEraseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPaintingRef.current) return;
    e.stopPropagation();
    setMouseScreenPos({ x: e.clientX, y: e.clientY });

    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) / zoom;
    const currentY = (e.clientY - rect.top) / zoom;

    if (activeCanvasTool === "Sketch") {
      const currentAlpha = getBrushAlpha(brushType);
      renderTexturedLine(
        ctx,
        lastDrawingPointRef.current.x,
        lastDrawingPointRef.current.y,
        currentX,
        currentY,
        brushColor,
        strokeWidth,
        currentAlpha,
        brushType,
      );
    } else if (activeCanvasTool === "Erase") {
      // --- DYNAMIC DOCK PIXEL ERASURE MECHANICS ---
      ctx.save();
      ctx.beginPath();
      // Sets the composition blending pipe to clear out target canvas pixels dynamically
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = eraserSize * 2; // Full brush footprint thickness
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(lastDrawingPointRef.current.x, lastDrawingPointRef.current.y);
      ctx.lineTo(currentX, currentY);
      ctx.stroke();
      ctx.restore();
    }

    lastDrawingPointRef.current = { x: currentX, y: currentY };
  };

  const handleDrawEnd = () => {
    if (isPaintingRef.current) {
      isPaintingRef.current = false;
      setIsPaintingState(false);
    }
  };

  const clearCanvasCompletely = () => {
    const canvas = drawingCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setUndoStack((prev) => [...prev, currentSnapshot]);
    setRedoStack([]);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  return {
    localTitle,
    setLocalTitle,
    commitTitleChange,
    pan,
    zoom,
    isDragging,
    viewportNodeRef,
    handleMouseDown,
    resetView,
    drawingCanvasRef,
    activeCanvasTool,
    handleDrawStart,
    handleDrawOrEraseMove,
    handleDrawEnd,
    mouseScreenPos,
    isPaintingActive: isPaintingState,
    brushColor,
    setBrushColor,
    strokeWidth,
    setStrokeWidth,
    eraserSize,
    setEraserSize,
    brushType,
    setBrushType,
    triggerUndo,
    triggerRedo,
    clearCanvasCompletely,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
  };
};
