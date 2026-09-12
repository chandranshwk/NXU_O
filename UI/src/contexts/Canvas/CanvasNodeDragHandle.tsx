/**
 * @file CanvasNodeDragHandle.tsx
 * @component CanvasNodeDragHandle
 * @description A visual handle component for absolute-positioned canvas nodes.
 * Provides a tactile mouse-grabbing surface placed on top of content frames
 * to handle spatial drag translations.
 *
 * @architecture
 * - Leverages template string evaluations to switch between standard grabbing vs grabbing states.
 * - Integrates hover visibility layers that link directly into parent group design selectors.
 * - Disables inner item point events (`pointer-events-none`) to preserve handle drag regions.
 */

import React from "react";

interface CanvasNodeDragHandleProps {
  /** Activity flag reporting if the parent card container is moving */
  isDragging: boolean;
  /** Evaluation flag confirming if this card instance holds focus */
  isSelected: boolean;
  /** Shared dark mode setting flag used to switch palette styles */
  darkMode: boolean;
  /** Direct link reference anchoring mouse interaction vectors onto handles */
  innerRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasNodeDragHandle: React.FC<CanvasNodeDragHandleProps> = ({
  isDragging,
  isSelected,
  darkMode,
  innerRef,
}) => {
  return (
    /* MAIN HANDLE CHASSIS: Centered on top of absolute canvas element blocks */
    <div
      ref={innerRef}
      className={`absolute w-[calc(100%-7rem)] left-1/2 -translate-x-1/2 -top-2 -z-10 flex items-center justify-center px-3 py-1 rounded-full select-none transition-all duration-200 ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${
        darkMode
          ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-300 border border-zinc-600"
          : "bg-zinc-200 hover:bg-zinc-300 text-zinc-700 border border-zinc-300"
      } ${isSelected ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
    >
      {/* Notion-style triple dot grip design pattern */}
      <div className="flex gap-1.5 pointer-events-none">
        <span className="size-1 rounded-full bg-current" />
        <span className="size-1 rounded-full bg-current" />
        <span className="size-1 rounded-full bg-current" />
      </div>
    </div>
  );
};
