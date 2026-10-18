import { MdDragIndicator } from "react-icons/md";
import { FiBook, FiFolder } from "react-icons/fi";
import { FaFileCode } from "react-icons/fa";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CodeFile } from "./CodeIDE.SAMPLE";
import type { MockNotebook, Folder } from "../assets/SAMPLE";

interface SortableRowProps {
  //  Added Folder to the union
  item: CodeFile | MockNotebook | Folder;
  isNotebook: boolean;
  isFolder?: boolean; //  New prop
  darkMode: boolean;
  onNavigate: () => void;
  isOverlay?: boolean;
}

export const SortableRow = ({
  item,
  isNotebook,
  isFolder = false,
  darkMode,
  onNavigate,
  isOverlay,
}: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0 : 1,
    position: "relative" as const,
    width: "100%",
  };

  const innerContent = (
    <div
      className={`group flex items-center justify-between py-2 px-2 -mx-2 rounded-md transition-colors ${
        isOverlay
          ? "bg-[#2a2a2a] shadow-2xl ring-1 ring-white/10 cursor-grabbing"
          : darkMode
            ? "hover:bg-zinc-800/50"
            : "hover:bg-zinc-100"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div
          {...(!isOverlay ? { ...attributes, ...listeners } : {})}
          className={`p-1 -ml-1 transition-opacity ${
            isOverlay
              ? "cursor-grabbing"
              : "cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100"
          } ${
            darkMode
              ? "text-zinc-600 hover:text-zinc-400"
              : "text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <MdDragIndicator size={18} />
        </div>

        <button
          type="button"
          onClick={onNavigate}
          className="flex flex-1 items-center justify-between text-left min-w-0"
        >
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {/*  Icon Logic: Folder > Notebook > CodeFile */}
            {isFolder ? (
              <FiFolder size={18} className="text-amber-500" />
            ) : isNotebook ? (
              <FiBook
                size={18}
                className={darkMode ? "text-zinc-400" : "text-zinc-500"}
              />
            ) : (
              <FaFileCode
                size={16}
                className={darkMode ? "text-zinc-400" : "text-zinc-500"}
              />
            )}
            <h3 className="text-[15px] font-medium truncate">{item.title}</h3>
          </div>

          <div
            className={`flex items-center gap-3 text-[13px] transition-opacity shrink-0 ${
              isOverlay ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            } ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
          >
            {/*  Metadata Logic */}
            {isFolder && "content" in item ? (
              <p>
                {item.content.length}{" "}
                {item.content.length === 1 ? "item" : "items"}
              </p>
            ) : isNotebook && "pages" in item ? (
              <p>
                {item.pages.length} {item.pages.length === 1 ? "page" : "pages"}
              </p>
            ) : "difficulty" in item ? (
              <>
                <span
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium ${
                    item.difficulty === "Easy"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : item.difficulty === "Medium"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {item.difficulty}
                </span>
                <span className="truncate w-24 text-right">
                  {item.category}
                </span>
              </>
            ) : null}
          </div>
        </button>
      </div>
    </div>
  );

  if (isOverlay) return innerContent;

  return (
    <div ref={setNodeRef} style={style}>
      {innerContent}
    </div>
  );
};
