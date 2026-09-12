import React from "react";
import type { BrushType } from "./useDrawingTextures";

interface BrushPropertiesPanelProps {
  darkMode: boolean;
  brushType: BrushType;
  setBrushType: (type: BrushType) => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

interface BrushItem {
  id: BrushType;
  label: string;
  tipStyles: string;
  bodyStyles: string;
}

export const BrushPropertiesPanel: React.FC<BrushPropertiesPanelProps> = ({
  darkMode,
  brushType,
  setBrushType,
  brushColor,
  setBrushColor,
  strokeWidth,
  setStrokeWidth,
}) => {
  const colorPalette = [
    "#10b981",
    "#3b82f6",
    "#ef4444",
    "#eab308",
    "#a855f7",
    "#f97316",
    "#ffffff",
    "#18181b",
  ];

  const brushList: BrushItem[] = [
    {
      id: "pencil",
      label: "Pencil",
      tipStyles:
        "w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-amber-400/60",
      bodyStyles:
        "w-6 h-20 rounded-b-sm bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600",
    },
    {
      id: "pen",
      label: "Pen",
      tipStyles:
        "w-3 h-5 rounded-t-full bg-gradient-to-b from-zinc-400 to-zinc-600",
      bodyStyles:
        "w-5 h-22 rounded-b-md bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-800",
    },
    {
      id: "marker",
      label: "Marker",
      tipStyles:
        "w-7 h-6 rounded-t-xl bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 border-b border-zinc-500/30",
      bodyStyles:
        "w-7 h-24 rounded-b-lg bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-950",
    },
    {
      id: "brush",
      label: "Brush",
      tipStyles:
        "w-4 h-8 rounded-t-full bg-gradient-to-b from-stone-700 via-stone-600 to-stone-900",
      bodyStyles:
        "w-4 h-26 rounded-b-md bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900",
    },
    {
      id: "sketch-pen",
      label: "Sketch",
      tipStyles: "w-2 h-4 rounded-t-sm bg-zinc-300",
      bodyStyles:
        "w-4 h-20 rounded-b-md bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-700",
    },
  ];

  return (
    <div
      className="fixed bottom-0 max-h-12 left-1/2 -translate-x-1/2 z-40 flex items-end gap-8 px-8 pb-3 pt-6 rounded-t-3xl select-none"
      style={{
        // Hardware Base Tray (Frosted blur backing)
        backgroundColor: darkMode ? "#1c1c1e" : "#f2f2f7",
        borderLeft: darkMode
          ? "1px solid rgba(255,255,255,0.05)"
          : "1px solid rgba(255,255,255,0.4)",
        borderRight: darkMode
          ? "1px solid rgba(0,0,0,0.3)"
          : "1px solid rgba(0,0,0,0.1)",
      }}
    >
      {/* SECTION 1: 3D EXTRUDED HARDWARE TOOLS */}
      <div className="flex items-end gap-4 h-32 pr-6 border-r border-zinc-500/10 dark:border-zinc-400/10 pb-1">
        {brushList.map((b) => {
          const isActive = brushType === b.id;
          const activeTipColor = b.id === "pencil" ? "transparent" : brushColor;

          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setBrushType(b.id)}
              className="flex scale-75 flex-col items-center justify-end transition-all duration-200 group relative origin-bottom"
              style={{
                boxShadow: isActive
                  ? "none"
                  : darkMode
                    ? "0 10px 15px -3px rgba(0,0,0,0.5), 0 4px 6px -2px rgba(0,0,0,0.3)"
                    : "0 10px 15px -3px rgba(0,0,0,0.15), 0 4px 6px -2px rgba(0,0,0,0.05)",
                transform: !isActive ? "translateY(24px)" : "translateY(0px)",
              }}
            >
              {/* Tool Tip Component Mesh */}
              <div
                className={`${b.tipStyles} transition-colors duration-150`}
                style={{
                  borderBottomColor:
                    b.id === "pencil" ? undefined : activeTipColor,
                  backgroundColor:
                    b.id !== "pencil" && b.id !== "brush"
                      ? activeTipColor
                      : undefined,
                }}
              />

              {/* Tool Shaft/Body Mesh */}
              <div
                className={`${b.bodyStyles} flex flex-col justify-end pb-3 relative border-t border-white/10`}
              >
                {isActive && (
                  <div className="absolute inset-x-0 bottom-1/2 h-1.5 bg-zinc-950/40 border-y border-white/10 shadow-inner" />
                )}
                <span
                  className="text-[9px] font-black uppercase tracking-widest text-white/50 whitespace-nowrap block edit-label self-center mix-blend-overlay"
                  style={{
                    writingMode: "vertical-lr",
                    textOrientation: "mixed",
                  }}
                >
                  {b.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* SECTION 2: FLAT INLINE PALETTE TRAY (Completely flat circle grid) */}
      <div className="flex items-center border-r pr-6 relative top-1 border-zinc-500/10 dark:border-zinc-400/10 pb-2">
        <div className="flex items-center gap-2">
          {colorPalette.map((color) => {
            const isSelected = brushColor === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => setBrushColor(color)}
                className={`w-5 h-5 rounded-full border transition-all duration-150 active:scale-90 ${
                  isSelected
                    ? "scale-110 border-zinc-500 dark:border-zinc-300 ring-2 ring-zinc-500/20 dark:ring-zinc-300/30"
                    : "border-zinc-300/40 dark:border-zinc-700/50 hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MINIMAL FLAT WEIGHT SLIDER */}
      <div className="flex flex-col gap-1 w-32 relative top-3 justify-center pb-4">
        <div className="flex justify-between items-center text-[9px] font-black tracking-wider text-zinc-400 dark:text-zinc-500 uppercase">
          <span>Size</span>
          <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
            {strokeWidth}px
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="12"
          step="1"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-600 dark:accent-zinc-400"
        />
      </div>
    </div>
  );
};
