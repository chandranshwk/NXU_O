import React from "react";

interface EraserPropertiesPanelProps {
  darkMode: boolean;
  eraserSize: number;
  setEraserSize: (size: number) => void;
}

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
      {/* SECTION 1: UNCONSTRAINED LIVE PREVIEW (Allows growth up to 64px) */}
      <div className="flex items-center justify-center w-16 h-16 pr-4 border-r border-zinc-200 dark:border-zinc-800">
        {/* The ring now sits unconstrained so it can scale to full width/height naturally */}
        <div
          className="rounded-full border border-zinc-400 dark:border-zinc-500 bg-zinc-400/10 dark:bg-zinc-500/10 transition-all duration-75 ease-out"
          style={{
            width: `${eraserSize}px`,
            height: `${eraserSize}px`,
          }}
        />
      </div>

      {/* SECTION 2: FLAT ACCENT SLIDER CONTROLS */}
      <div className="flex items-center gap-3 w-40">
        <div className="flex flex-col gap-0.5 min-w-[54px]">
          <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
            Eraser
          </span>
          <span className="text-xs font-mono font-bold leading-none">
            {eraserSize}px
          </span>
        </div>
        <input
          type="range"
          min="8"
          max="64"
          step="2"
          value={eraserSize}
          onChange={(e) => setEraserSize(parseInt(e.target.value))}
          className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-600 dark:accent-zinc-400"
        />
      </div>
    </div>
  );
};
