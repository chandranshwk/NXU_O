import { MdDragIndicator } from "react-icons/md";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableGroupProps {
  id: string;
  title: string;
  children: React.ReactNode;
  darkMode: boolean;
  isOverlay?: boolean;
}

export const SortableGroup = ({
  id,
  title,
  children,
  darkMode,
  isOverlay,
}: SortableGroupProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0 : 1, // Hide original
    position: "relative" as const,
    width: "100%",
  };

  const innerContent = (
    <section
      className={`${isOverlay ? "bg-[#222222] p-4 rounded-xl shadow-2xl ring-1 ring-white/10" : "mb-10"}`}
    >
      <div
        className={`flex items-center gap-2 mb-2 group/header ${isOverlay ? "cursor-grabbing" : ""}`}
      >
        <div
          {...(!isOverlay ? { ...attributes, ...listeners } : {})}
          className={`p-1 -ml-2 transition-opacity ${
            isOverlay
              ? "cursor-grabbing"
              : "cursor-grab active:cursor-grabbing opacity-0 group-hover/header:opacity-100"
          } ${darkMode ? "text-zinc-600 hover:text-zinc-400" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          <MdDragIndicator size={18} />
        </div>
        <h2
          className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-500"}`}
        >
          {title}
        </h2>
      </div>
      <div style={{ pointerEvents: isDragging ? "none" : "auto" }}>
        {children}
      </div>
    </section>
  );

  if (isOverlay) return innerContent;

  return (
    <div ref={setNodeRef} style={style}>
      {innerContent}
    </div>
  );
};
