/**
 * @file CanvasNodeSettingsDialog.tsx
 * @component CanvasNodeSettingsDialog
 * @description A configuration menu dialog overlay for canvas blocks.
 * Renders via a React portal, enabling dragging interactions, dimension inputs,
 * and theme-adaptive color swatches.
 *
 * @architecture
 * - Injected directly into the document root via `createPortal`.
 * - Employs HTML5 Pointer Capture flags to enable dragging controls.
 * - Restricts raw canvas height overrides dynamically if the active node type is text.
 */

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

export interface AdaptableColor {
  /** Label identifier naming the specific shade family */
  name: string;
  /** Background hex string parsed when the light visual layout is active */
  light: string;
  /** Background hex string parsed when the dark visual layout is active */
  dark: string;
}

interface CanvasNodeSettingsDialogProps {
  /** Operational visibility flag defining when to draw this layout view */
  isOpen: boolean;
  /** Shared dark mode setting flag used to switch palette ranges */
  darkMode: boolean;
  /** Core key string identifying whether the parent element is text or widget components */
  nodeType: string;
  /** Fallback background hex style parsed from database records on load */
  initialColor: string;
  /** Boundary width dimension read directly from parent state records */
  initialWidth: number;
  /** Boundary height dimension read directly from parent state records */
  initialHeight: number;
  /** Geographic pixel bounds tracking where the wrapper mounts on screens */
  anchorRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  /** Static template matrix storing dynamic light vs dark theme color hexes */
  presetColors: AdaptableColor[];
  /** Dismissal callback hook closing visibility states upon request */
  onClose: () => void;
  /** Validation dispatch hook pushing shape configurations up to storage states */
  onApply: (width: number, height: number, backgroundColor: string) => void;
}

export const CanvasNodeSettingsDialog: React.FC<
  CanvasNodeSettingsDialogProps
> = ({
  isOpen,
  darkMode,
  nodeType,
  initialColor,
  initialWidth,
  initialHeight,
  anchorRect,
  presetColors,
  onClose,
  onApply,
}) => {
  const [dialogColor, setDialogColor] = useState(initialColor || "transparent");
  const [dialogWidth, setDialogWidth] = useState(initialWidth);
  const [dialogHeight, setDialogHeight] = useState(initialHeight || 150);

  /** Vector offset tracking translation increments from screen center origins */
  const [dialogOffset, setDialogOffset] = useState({ x: 0, y: 0 });
  /** Activity flag logging if dragging motions engage on headers */
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);

  const dialogHeaderRef = useRef<HTMLDivElement>(null);
  /** Remembers mouse click footprints when pointer down triggers fire */
  const dialogDragStartRef = useRef({ x: 0, y: 0 });
  /** Remembers past position coordinates right before translations reload values */
  const dialogOffsetStartRef = useRef({ x: 0, y: 0 });

  // =========================================================================
  // LIFECYCLE: DIMENSION INPUT SYNCHRONIZER
  // =========================================================================
  /**
   * Forces local menu fields to re-align metrics if external layout parameters
   * mutate while the modal remains active on screen.
   */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setDialogColor(initialColor || "transparent");
        setDialogWidth(initialWidth);
        setDialogHeight(initialHeight || 150);
      }, 0);
    }
    // Structural Render Guard: Prevent draw sequences if coordinates map null
  }, [isOpen, initialWidth, initialHeight, initialColor]);

  if (!isOpen || !anchorRect) return null;

  // ==========================================
  // INTERACTION: WINDOW DRAG EVENTS
  // ==========================================
  /** Initiates dragging frames, latching pointer streams to handle headers */
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingDialog(true);
    dialogDragStartRef.current = { x: e.clientX, y: e.clientY };
    dialogOffsetStartRef.current = { x: dialogOffset.x, y: dialogOffset.y };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  /** Updates delta offsets on mouse moves to translate window structures */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDialog) return;
    const deltaX = e.clientX - dialogDragStartRef.current.x;
    const deltaY = e.clientY - dialogDragStartRef.current.y;
    setDialogOffset({
      x: dialogOffsetStartRef.current.x + deltaX,
      y: dialogOffsetStartRef.current.y + deltaY,
    });
  };

  /** Releases hardware tracking streams when mouse clicks clear bounds */
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingDialog) {
      setIsDraggingDialog(false);
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  // ==========================================
  // ACTION VALIDATION & PERSISTENCE
  // ==========================================
  /** Blocks saving invalid card geometry configurations before updating state */
  const handleValidationAndApply = () => {
    if (dialogWidth < 150 || dialogHeight < 80) {
      alert("Width must be at least 150px and height at least 80px.");
      return;
    }
    onApply(dialogWidth, dialogHeight, dialogColor);
  };
  return createPortal(
    /* OVERLAY SHIELD BACKGROUND CANVAS LAYER */
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="rounded-md shadow-2xl p-5 w-72 max-w-[90vw]"
        style={{
          position: "fixed",
          top: anchorRect.top + anchorRect.height / 2 + dialogOffset.y,
          left: anchorRect.left + anchorRect.width / 2 + dialogOffset.x,
          transform: "translate(-50%, -50%)",
          backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
          border: darkMode ? "1px solid #3d3d3d" : "1px solid #e5e5e5",
          userSelect: isDraggingDialog ? "none" : "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ==========================================
            DIALOG HEAD: INTERACTIVE DRAG HANDLE RAIL
            ========================================== */}
        <div
          ref={dialogHeaderRef}
          className="flex justify-between items-center mb-3 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5 text-zinc-400">
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="w-1 h-1 rounded-full bg-current" />
            </div>
            <h4
              className="text-sm font-medium"
              style={{ color: darkMode ? "#e0e0e0" : "#1a1a1a" }}
            >
              Node Settings
            </h4>
          </div>
        </div>

        {/* ==========================================
            COLOR SELECTOR SELECTION MATRIX
            ========================================== */}
        <div className="mb-3">
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: darkMode ? "#aaa" : "#666" }}
          >
            Background Color
          </label>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((colorObj) => {
              // Swap hex targets depending on active system themes
              const computedHex = darkMode ? colorObj.dark : colorObj.light;
              const isSelected =
                dialogColor.toLowerCase() === computedHex.toLowerCase();

              return (
                <button
                  key={colorObj.name}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 active:scale-95 focus:outline-none ${
                    isSelected ? "scale-105 shadow-sm" : ""
                  }`}
                  style={{
                    backgroundColor: computedHex,
                    borderColor: isSelected
                      ? "#3b82f6"
                      : darkMode
                        ? "#4b5563"
                        : "#e5e7eb",
                  }}
                  onClick={() => setDialogColor(computedHex)}
                  title={colorObj.name}
                />
              );
            })}

            {/* Clear Button: Reverts container styles back to transparent layout scales */}
            <button
              type="button"
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all hover:scale-110"
              style={{
                borderColor:
                  dialogColor === "transparent"
                    ? "#3b82f6"
                    : darkMode
                      ? "#444"
                      : "#ddd",
                color: darkMode ? "#aaa" : "#666",
                backgroundColor: "transparent",
              }}
              onClick={() => setDialogColor("transparent")}
              title="Reset to transparent"
            >
              ✕
            </button>
          </div>
        </div>
        {/* ==========================================
            DIMENSION METRIC BOUNDARY INPUT FIELDS
            ========================================== */}

        {/* Horizontal Width Sizing Block */}
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
              className={`w-full rounded-lg border px-3 py-1.5 text-sm ${nodeType === "text" ? "opacity-90" : ""}`}
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

          {/* Vertical Height Sizing Block (Handled by the trailing segment) */}
          <div className="flex-1">
            <label
              className="block text-xs font-medium mb-1"
              style={{ color: darkMode ? "#aaa" : "#666" }}
            >
              Height (px)
            </label>
            <input
              type="number"
              disabled={nodeType === "text"}
              value={nodeType === "text" ? ("Auto" as string) : dialogHeight}
              min="80"
              step="10"
              /* TEXT NODE SPECIFIC HEIGHT SAFETY SHIELD:
                  If nodeType is text, apply opacity-60, strip out mouse hover states, 
                  and trigger native browser not-allowed cursor warnings. */
              className={`w-full rounded-lg border px-3 py-1.5 text-sm ${nodeType === "text" ? "opacity-60 select-none pointer-events-none cursor-not-allowed" : ""}`}
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

        {/* ==========================================
            ACTION TRIGGERS FOOTER (CANCEL & APPLY)
            ========================================== */}
        <div className="flex justify-end gap-2">
          {/* Dismiss button sequence */}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: darkMode ? "#3d3d3d" : "#f3f4f6",
              color: darkMode ? "#ccc" : "#333",
            }}
          >
            Cancel
          </button>
          {/* Save trigger validation sequence */}
          <button
            type="button"
            onClick={handleValidationAndApply}
            className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
