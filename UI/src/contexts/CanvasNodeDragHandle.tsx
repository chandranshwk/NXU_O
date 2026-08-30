import React from "react";

interface CanvasNodeDragHandleProps {
  isDragging: boolean;
  isSelected: boolean;
  darkMode: boolean;
  innerRef: React.RefObject<HTMLDivElement | null>;
}

export const CanvasNodeDragHandle: React.FC<CanvasNodeDragHandleProps> = ({
  isDragging,
  isSelected,
  darkMode,
  innerRef,
}) => {
  return (
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
      <div className="flex gap-1.5 pointer-events-none">
        <span className="size-1 rounded-full bg-current" />
        <span className="size-1 rounded-full bg-current" />
        <span className="size-1 rounded-full bg-current" />
      </div>
    </div>
  );
};
