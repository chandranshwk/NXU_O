import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useSettings } from "../contexts/settingsContext";
import { useLocation } from "react-router-dom";

export interface SearchItems {
  name: string;
  icon: React.ReactNode;
  exec(): void;
  description: string;
  id?: string;
}

interface SearchDropProps {
  searchItems: SearchItems[];
  activeIndex?: number;
  setActiveIndex?: (index: number) => void;
}

const SearchDrop: React.FC<SearchDropProps> = ({
  searchItems,
  activeIndex = 0,
  setActiveIndex,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Enhanced spring-based motion profile for a smooth, fluid desktop app feel
  const animationVariants = {
    initial: {
      opacity: 0,
      y: -12,
      scale: 0.96,
      x: "-50%",
    },
    animate: {
      opacity: 1,
      y: 4,
      scale: 1,
      x: "-50%",
    },
    exit: {
      opacity: 0,
      y: -4,
      scale: 0.97,
      x: "-50%",
    },
  };

  const { darkMode } = useSettings();
  const location = useLocation();
  const { setSearchQuery } = useSettings();

  // Reset references array size when matching search results update
  useEffect(() => {
    itemsRef.current = itemsRef.current.slice(0, searchItems.length);
  }, [searchItems]);

  // Keep list scrolling behavior fully aligned with active keyboard index selection bounds
  useEffect(() => {
    const activeElement = itemsRef.current[activeIndex];
    const container = containerRef.current;

    if (activeElement && container) {
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      const elemTop = activeElement.offsetTop;
      const elemBottom = elemTop + activeElement.clientHeight;

      if (elemTop < containerTop) {
        container.scrollTo({ top: elemTop - 6, behavior: "smooth" });
      } else if (elemBottom > containerBottom) {
        container.scrollTo({
          top: elemBottom - container.clientHeight + 6,
          behavior: "smooth",
        });
      }
    }
  }, [activeIndex]);

  if (searchItems.length === 0) {
    return (
      <motion.div
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className={`absolute top-full left-[calc(50%-2rem)] mt-1 w-200 py-6 text-center text-xs rounded-xl shadow-2xl border z-50
          ${darkMode ? "bg-zinc-900 border-zinc-800 text-zinc-500" : "bg-white border-zinc-200 text-zinc-400"}`}
      >
        {location.pathname.startsWith("/document")
          ? "No matching sub-pages found"
          : location.pathname.startsWith("/")
            ? "No matching notes found"
            : "No matching settings found"}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      variants={animationVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={`absolute top-full left-[calc(50%-2rem)] mt-1 w-200 max-h-72 overflow-y-auto scrollbar-none rounded-xl shadow-2xl border p-1.5 flex flex-col gap-0.5 z-50
        ${darkMode ? "bg-zinc-900/95 border-zinc-800 backdrop-blur-md text-zinc-200" : "bg-white/95 border-zinc-200 backdrop-blur-md text-zinc-800"}`}
    >
      {/* Scope Header Label */}
      <div
        className={`px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase opacity-40 border-b pb-1 mb-1
          ${darkMode ? "border-zinc-800 text-zinc-400" : "border-zinc-100 text-zinc-500"}`}
      >
        Notebook Sections & Pages
      </div>

      {searchItems.map((item, index) => {
        const isHighlighted = index === activeIndex;

        return (
          <div
            key={item.id || index}
            ref={(el) => {
              itemsRef.current[index] = el;
            }}
            onMouseEnter={() => {
              setActiveIndex?.(index);
            }}
            onClick={(e) => {
              e.stopPropagation();

              setSearchQuery(item.name);
              item.exec();
            }}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                setSearchQuery(item.name);
                item.exec();
              }
            }}
            className={`w-full flex flex-col gap-0.5 px-3 py-1.5 rounded-lg text-left cursor-pointer transition-colors duration-100 select-none
              ${
                isHighlighted
                  ? darkMode
                    ? "bg-zinc-800 text-zinc-100"
                    : "bg-zinc-100 text-zinc-900"
                  : darkMode
                    ? "text-zinc-400/80 hover:bg-zinc-800/40"
                    : "text-zinc-500 hover:bg-zinc-100/80"
              }`}
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <span
                className={`shrink-0 relative top-2 flex items-center justify-center text-xs ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.name}</span>
            </div>

            <div
              className={`pl-5 text-[10px] truncate font-normal ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
            >
              {item.description}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

export default SearchDrop;
