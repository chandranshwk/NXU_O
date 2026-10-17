/**
 * @file CanvasNodeSettingsDialog.tsx
 * @component CanvasNodeSettingsDialog
 * @description Configuration menu overlay for canvas blocks. Renders via a
 * React portal with draggable header, dimension inputs, color swatches, and
 * a delete action.
 *
 * @architecture
 * - Injected into document root via `createPortal`.
 * - Uses Pointer Capture for smooth header dragging.
 * - Disables the height input for text nodes (height is content-driven).
 */

import React, { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

export interface AdaptableColor {
  /** Label identifier naming the shade family. */
  name: string;
  /** Background hex string for the light theme. */
  light: string;
  /** Background hex string for the dark theme. */
  dark: string;
}

interface CanvasNodeSettingsDialogProps {
  /** Whether the dialog is currently visible. */
  isOpen: boolean;
  darkMode: boolean;
  /** Node type — drives the height-input disable for `text`. */
  nodeType: string;
  initialColor: string;
  initialWidth: number;
  initialHeight: number;
  /** Bounding rect of the owning node when the dialog opened. */
  anchorRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  presetColors: AdaptableColor[];
  /** Dismiss the dialog without applying changes. */
  onClose: () => void;
  /** Deletes the owning node. Parent is responsible for closing the dialog. */
  onDelete: () => void;
  /** Commits new dimensions and background to the store. */
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
  onDelete,
  onApply,
}) => {
  const [dialogColor, setDialogColor] = useState(initialColor || "transparent");
  const [dialogWidth, setDialogWidth] = useState(initialWidth);
  const [dialogHeight, setDialogHeight] = useState(initialHeight || 150);

  const [dialogOffset, setDialogOffset] = useState({ x: 0, y: 0 });
  const [isDraggingDialog, setIsDraggingDialog] = useState(false);

  const dialogHeaderRef = useRef<HTMLDivElement>(null);
  const dialogDragStartRef = useRef({ x: 0, y: 0 });
  const dialogOffsetStartRef = useRef({ x: 0, y: 0 });

  // =========================================================================
  // LIFECYCLE: RESET LOCAL STATE WHEN RE-OPENED OR EXTERNAL VALUES CHANGE
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    // Reset on the next tick so React batches the updates after mount.
    const id = window.setTimeout(() => {
      setDialogColor(initialColor || "transparent");
      setDialogWidth(initialWidth);
      setDialogHeight(initialHeight || 150);
      setDialogOffset({ x: 0, y: 0 });
    }, 0);

    return () => window.clearTimeout(id);
  }, [isOpen, initialWidth, initialHeight, initialColor]);

  // =========================================================================
  // LIFECYCLE: ESCAPE KEY DISMISSAL
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !anchorRect) return null;

  // ==========================================
  // INTERACTION: HEADER DRAG
  // ==========================================
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDraggingDialog(true);
    dialogDragStartRef.current = { x: e.clientX, y: e.clientY };
    dialogOffsetStartRef.current = { x: dialogOffset.x, y: dialogOffset.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDialog) return;
    const deltaX = e.clientX - dialogDragStartRef.current.x;
    const deltaY = e.clientY - dialogDragStartRef.current.y;
    setDialogOffset({
      x: dialogOffsetStartRef.current.x + deltaX,
      y: dialogOffsetStartRef.current.y + deltaY,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingDialog) return;
    setIsDraggingDialog(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  // ==========================================
  // ACTION: VALIDATE + APPLY
  // ==========================================
  const handleValidationAndApply = () => {
    if (dialogWidth < 150 || dialogHeight < 80) {
      alert("Width must be at least 150px and height at least 80px.");
      return;
    }
    onApply(dialogWidth, dialogHeight, dialogColor);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label="Node settings"
        className="rounded-lg shadow-2xl p-5 w-72 max-w-[90vw]"
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
            HEADER: DRAG HANDLE
            ========================================== */}
        <div
          ref={dialogHeaderRef}
          className="flex justify-between items-center mb-3 cursor-grab active:cursor-grabbing select-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
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
            COLOR SWATCHES
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
            DIMENSION INPUTS
            ========================================== */}
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
              min={150}
              step={10}
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
              disabled={nodeType === "text"}
              value={nodeType === "text" ? "Auto" : dialogHeight}
              min={80}
              step={10}
              className={`w-full rounded-lg border px-3 py-1.5 text-sm ${
                nodeType === "text" ? "opacity-60 cursor-not-allowed" : ""
              }`}
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
            FOOTER: DELETE · CANCEL · APPLY
            ========================================== */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onDelete}
            className="px-3 py-1.5 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: darkMode ? "rgba(127, 29, 29, 0.25)" : "#fef2f2",
              color: darkMode ? "#fca5a5" : "#b91c1c",
              border: `1px solid ${darkMode ? "#7f1d1d" : "#fecaca"}`,
            }}
          >
            Delete
          </button>

          <div className="flex gap-2">
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
            <button
              type="button"
              onClick={handleValidationAndApply}
              className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
