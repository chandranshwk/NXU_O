import React, { useState, useRef, useEffect } from "react";
import StickyEditor from "./StickyEditor";

interface StickyNoteProps {
  content: string | React.ReactNode;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
}

const StickyNote: React.FC<StickyNoteProps> = ({
  content,
  initialX,
  initialY,
  initialWidth,
  initialHeight,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y,
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.mouseX;
        const deltaY = e.clientY - resizeStart.current.mouseY;
        setDimensions({
          width: Math.max(120, resizeStart.current.width + deltaX),
          height: Math.max(100, resizeStart.current.height + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".ProseMirror")) return;

    e.stopPropagation();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  return (
    <div
      data-sticky-note
      className={`absolute bg-yellow-200 resize text-slate-800 shadow-md border transition-all duration-100 rounded p-2 overflow-hidden flex flex-col ${
        isDragging
          ? "cursor-grabbing shadow-xl z-50 border-blue-400 border-5"
          : "cursor-grab z-30"
      }`}
      onDoubleClick={handleDragStart}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
      }}
    >
      <div className="w-full h-full overflow-y-auto cursor-text pr-1">
        <StickyEditor
          size="short"
          content={content ? content.toString() : ""}
        />
      </div>
    </div>
  );
};

export default StickyNote;
