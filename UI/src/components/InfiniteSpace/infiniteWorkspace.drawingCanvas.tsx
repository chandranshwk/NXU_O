import React from "react";

interface DrawingCanvasLayerProps {
  drawingCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  activeCanvasTool: string; // From your tool selector context ("Sketch", "Erase", "None", etc.)
  zoom: number;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const DrawingCanvasLayer: React.FC<DrawingCanvasLayerProps> = ({
  drawingCanvasRef,
  activeCanvasTool,

  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}) => {
  const isToolActive =
    activeCanvasTool === "Sketch" || activeCanvasTool === "Erase";

  return (
    <canvas
      ref={drawingCanvasRef}
      id="drawing-canvas-layer"
      // Match this massive footprint with your #infinite-grid-layer matrix dimension bounds
      width={5000}
      height={5000}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      className={`absolute top-0 left-0 transition-opacity duration-200 ${
        isToolActive
          ? "pointer-events-auto z-40 opacity-100"
          : "pointer-events-none z-10 opacity-80"
      }`}
      style={{
        // Bypasses OS issues by falling back cleanly to crosshair/grab states natively
        cursor:
          activeCanvasTool === "Sketch"
            ? "crosshair"
            : activeCanvasTool === "Erase"
              ? "cell"
              : "inherit",
      }}
    />
  );
};
