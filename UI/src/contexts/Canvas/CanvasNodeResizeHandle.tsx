// src/components/CanvasNodeResizeHandle.tsx
import React from "react";

interface ResizeHandleProps {
  nodeType: string;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

export const CanvasNodeResizeHandle: React.FC<ResizeHandleProps> = ({
  nodeType,
  isSelected,
  onPointerDown,
}) => {
  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute bottom-1 right-1 w-3.5 h-3.5 flex items-end justify-end p-0.5 rounded-br-md z-30 transition-opacity duration-150 ${
        nodeType === "text"
          ? "cursor-ew-resize"
          : nodeType === "calendar"
            ? "cursor-default"
            : "cursor-se-resize"
      } ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
    >
      {nodeType === "text" ? (
        <div className="w-1 h-3 rounded-full bg-zinc-400 dark:bg-zinc-600" />
      ) : nodeType !== "calendar" ? (
        <svg
          width="8"
          height="8"
          viewBox="0 0 10 10"
          className="text-zinc-400 dark:text-zinc-600"
        >
          <line
            x1="10"
            y1="2"
            x2="2"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="6"
            x2="6"
            y2="10"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
    </div>
  );
};
