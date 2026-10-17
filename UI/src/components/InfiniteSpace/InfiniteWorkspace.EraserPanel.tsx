import React from "react";

interface EraserPropertiesPanelProps {
  darkMode: boolean;
  eraserSize: number;
  setEraserSize: (size: number) => void;
}

/** Range thumb styling shared by both browsers. WebKit + Firefox syntax. */
const thumbClasses =
  "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-grab";

export const EraserPropertiesPanel: React.FC<EraserPropertiesPanelProps> = ({
  darkMode,
  eraserSize,
  setEraserSize,
}) => {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-5 px-5 py-2.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 select-none ${
        darkMode
          ? "bg-zinc-900/90 border-zinc-800 text-zinc-100"
          : "bg-white/90 border-zinc-200 text-zinc-900"
      }`}
    >
      {/* ==========================================
          SECTION 1: LIVE PREVIEW
          ========================================== */}
      <div className="flex items-center shrink-0">
        <div className="flex items-center justify-center w-20 h-20">
          <div
            className={`rounded-full border transition-all duration-75 ease-out ${
              darkMode
                ? "border-zinc-500 bg-zinc-500/10"
                : "border-zinc-400 bg-zinc-400/10"
            }`}
            style={{
              width: `${eraserSize}px`,
              height: `${eraserSize}px`,
            }}
          />
        </div>
        <div
          className={`w-px h-12 ${darkMode ? "bg-zinc-800" : "bg-zinc-200"}`}
        />
      </div>

      {/* ==========================================
          SECTION 2: SLIDER + LABEL
          ========================================== */}
      <div className="flex items-center gap-3 w-48">
        <div className="flex flex-col gap-0.5 min-w-[54px]">
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              darkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            Eraser
          </span>
          <span className="text-xs font-mono font-bold leading-none">
            {eraserSize}px
          </span>
        </div>

        <input
          type="range"
          min={8}
          max={64}
          step={2}
          value={eraserSize}
          onChange={(e) => setEraserSize(parseInt(e.target.value, 10))}
          aria-label="Eraser size"
          className={`w-full h-1 rounded-lg appearance-none cursor-pointer ${thumbClasses} ${
            darkMode
              ? "bg-zinc-800 [&::-webkit-slider-thumb]:bg-zinc-300 [&::-moz-range-thumb]:bg-zinc-300"
              : "bg-zinc-200 [&::-webkit-slider-thumb]:bg-zinc-700 [&::-moz-range-thumb]:bg-zinc-700"
          }`}
        />
      </div>
    </div>
  );
};
