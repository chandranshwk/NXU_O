import { useEffect, useState, useRef } from "react";
import { useWorkspace } from "../contexts/workspaceContext";

interface CreatePointerProps {
  children: React.ReactNode;
  className?: string;
}

const CreaterPointer: React.FC<CreatePointerProps> = ({
  children,
  className,
}) => {
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 });
  const [tracking, setTracking] = useState(false);
  const lastClickTime = useRef<number>(0);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });
  const { setItems } = useWorkspace();

  // Derived values for the live box outline calculations
  const width = tracking ? Math.abs(pointerPosition.x - anchorPosition.x) : 0;
  const height = tracking ? Math.abs(pointerPosition.y - anchorPosition.y) : 0;
  const currentX = Math.min(anchorPosition.x, pointerPosition.x);
  const currentY = Math.min(anchorPosition.y, pointerPosition.y);

  useEffect(() => {
    if (!tracking) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPointerPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setItems((prevItems) => {
        if (width < 5 || height < 5) return prevItems;
        return [
          ...prevItems,
          {
            id: Date.now() + Math.floor(Math.random() * 10000),
            type: "sticky note",
            content: "",
            height: height,
            width: width,
            x: currentX - 5,
            y: currentY - 5,
          },
        ];
      });
      setTracking(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [tracking, width, height, currentX, currentY, setItems]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const target = e.target as HTMLElement;
    // Prevent creating overlapping drawing layers if clicking onto active notes or tools
    if (
      target.closest("[data-sticky-note]") ||
      target.closest(".ProseMirror")
    ) {
      return;
    }

    const currentTime = Date.now();
    const timeDifference = currentTime - lastClickTime.current;

    if (timeDifference < 300) {
      setAnchorPosition({ x: e.clientX, y: e.clientY });
      setPointerPosition({ x: e.clientX, y: e.clientY });
      setTracking(true);
    }

    lastClickTime.current = currentTime;
  };

  return (
    <div
      className={`${className ?? ""} relative select-none w-full h-screen overflow-hidden`}
      onMouseDown={handleMouseDown}
    >
      {children}

      {/* Dashed blue box preview drawn while actively dragging */}
      {tracking && (
        <>
          <div
            className="fixed border border-dashed border-blue-500 bg-blue-500/10 pointer-events-none z-40 transition-shadow duration-75 rounded-sm"
            style={{
              left: `${currentX}px`,
              top: `${currentY}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
          />

          <div
            className="fixed text-white bg-slate-900/90 shadow-lg px-2 py-1 rounded-md text-[11px] font-mono font-medium pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full border border-slate-700/50 backdrop-blur-sm"
            style={{
              left: pointerPosition.x,
              top: pointerPosition.y - 12,
            }}
          >
            <span className="text-slate-400">w:</span> {width}px{" "}
            <span className="text-slate-400 ml-1">h:</span> {height}px
          </div>
        </>
      )}
    </div>
  );
};

export default CreaterPointer;
