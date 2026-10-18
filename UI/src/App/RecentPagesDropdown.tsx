import { useEffect, useRef } from "react";

export interface RecentItem {
  url: string;
  label: string;
  detail?: string;
  visitedAt: number;
}

interface RecentPagesDropdownProps {
  items: RecentItem[];
  darkMode: boolean;
  onSelect: (url: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const formatAge = (visitedAt: number): string => {
  const mins = Math.floor((Date.now() - visitedAt) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const RecentPagesDropdown: React.FC<RecentPagesDropdownProps> = ({
  items,
  darkMode,
  onSelect,
  onClear,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const id = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 0);
    document.addEventListener("keydown", handleEsc);
    return () => {
      clearTimeout(id);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`absolute top-9 left-0 z-[1000] w-72 rounded-md shadow-lg border py-1 text-xs pointer-events-auto ${
        darkMode
          ? "bg-zinc-900 border-zinc-700 text-zinc-300"
          : "bg-white border-zinc-200 text-zinc-700"
      }`}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {items.length === 0 && (
        <div className="px-3 py-2 opacity-50">No recent pages yet</div>
      )}

      {items.map((item) => (
        <button
          key={item.url}
          type="button"
          onClick={() => onSelect(item.url)}
          className={`w-full text-left px-3 py-1.5 flex flex-col gap-0.5 transition-colors ${
            darkMode
              ? "hover:bg-zinc-800 hover:text-zinc-100"
              : "hover:bg-zinc-100 hover:text-zinc-900"
          }`}
        >
          <span className="font-medium truncate">{item.label}</span>
          <span className="text-[10px] opacity-60 truncate">
            {item.detail ? `${item.detail} · ` : ""}
            {formatAge(item.visitedAt)}
          </span>
        </button>
      ))}

      {items.length > 0 && (
        <>
          <div
            className={`my-1 border-t ${
              darkMode ? "border-zinc-800" : "border-zinc-200"
            }`}
          />
          <button
            type="button"
            onClick={() => {
              onClear();
              onClose();
            }}
            className={`w-full text-left px-3 py-1.5 text-[11px] opacity-70 transition-colors ${
              darkMode
                ? "hover:bg-zinc-800 hover:text-zinc-100 hover:opacity-100"
                : "hover:bg-zinc-100 hover:text-zinc-900 hover:opacity-100"
            }`}
          >
            Clear recent pages
          </button>
        </>
      )}
    </div>
  );
};
