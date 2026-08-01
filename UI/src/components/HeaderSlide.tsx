import * as Tooltip from "@radix-ui/react-tooltip";
import { motion, AnimatePresence, type Variants } from "framer-motion"; // Added Variants type import
import { useWorkspace } from "../contexts/workspaceContext";
import { useSettings } from "../contexts/settingsContext";

const HeaderSlide = () => {
  const { headers, activeHeaderIdx, scrollToHeader } = useWorkspace();
  const { darkMode } = useSettings();

  // Typed explicitly to satisfy Framer Motion constraints
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.25,
      },
    },
  };

  // Typed explicitly to bind string literals like "spring"
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  return (
    <Tooltip.Provider delayDuration={100}>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 64, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 18 }}
        className={`sticky top-0 h-[80.9%] z-50 p-3 flex flex-col justify-center rounded-l-xl select-none overflow-hidden transition-colors duration-200 ${
          darkMode
            ? "bg-zinc-950 border-l border-y border-zinc-900"
            : "bg-linear-to-l from-400/30 via-zinc-50/80 to-zinc-200/20 border-x border-y border-zinc-400/80 shadow-[2px_0_20px_rgba(0,0,0,0.01)]"
        }`}
      >
        {/* Central tracks background vertical grid line anchor strand */}
        <div
          className={`absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-px pointer-events-none transition-colors duration-200 ${
            darkMode ? "bg-zinc-900" : "bg-zinc-200/60"
          }`}
        />

        {/* Animated list container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6 w-10 items-center mx-auto z-10 py-4 max-h-full overflow-y-auto no-scrollbar"
          layout
        >
          {headers.map((header) => {
            const isActive = activeHeaderIdx === header.idx;

            return (
              <Tooltip.Root key={header.idx}>
                <Tooltip.Trigger asChild>
                  <motion.button
                    variants={itemVariants}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToHeader(header.idx)}
                    aria-label={`Jump to: ${header.name || "Untitled Section"}`}
                    className="py-2 px-1 cursor-pointer relative flex items-center justify-center w-full transition-all duration-200 group outline-none rounded-md"
                  >
                    {/* Timeline bar indicator element */}
                    <motion.div
                      layoutId={`bar-${header.idx}`}
                      className={`rounded-full transition-all duration-300 ease-out ${
                        isActive
                          ? darkMode
                            ? "w-8 h-0.75 bg-linear-to-r from-emerald-400 to-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.5)] scale-x-110"
                            : "w-8 h-0.75 bg-linear-to-r from-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(16,185,129,0.25)] scale-x-110"
                          : darkMode
                            ? "w-5 h-0.5 bg-zinc-700 group-hover:bg-zinc-400 group-hover:w-6"
                            : "w-5 h-0.5 bg-zinc-300 group-hover:bg-zinc-500 group-hover:w-6"
                      }`}
                    />

                    {/* Active glowing micro core status dot */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className={`absolute w-1.5 h-1.5 rounded-full top-1/2 -translate-y-1/2 left-2 pointer-events-none animate-pulse duration-700 ${
                            darkMode
                              ? "bg-emerald-400 shadow-[0_0_10px_#34d399,0_0_4px_#34d399]"
                              : "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                          }`}
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                </Tooltip.Trigger>

                {/* Tooltip Portal Layer */}
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
                    sideOffset={12}
                    className={`px-3 py-1.5 backdrop-blur-md text-[11px] font-medium font-sans rounded-lg z-9999 flex flex-col gap-0.5 items-start data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-[state=delayed-open]:slide-in-from-left-2 duration-150 ease-out transition-colors border ${
                      darkMode
                        ? "bg-zinc-900/95 border-zinc-800/80 text-zinc-100 shadow-[0_10px_25px_rgba(0,0,0,0.5)]"
                        : "bg-white/95 border-zinc-200 text-zinc-800 shadow-[0_10px_25px_rgba(0,0,0,0.04)]"
                    }`}
                  >
                    <span
                      className={`font-semibold tracking-wide ${
                        darkMode ? "text-zinc-200" : "text-zinc-900"
                      }`}
                    >
                      {header.name || "Untitled Section"}
                    </span>

                    <div className="flex items-center gap-1.5 text-[9px] font-normal text-zinc-400">
                      <span>{header.date.toLocaleString()}</span>
                      <span
                        className={darkMode ? "text-zinc-700" : "text-zinc-200"}
                      >
                        •
                      </span>
                      <span>{header.time.toLocaleString()}</span>
                    </div>

                    <Tooltip.Arrow
                      className={
                        darkMode
                          ? "fill-zinc-900/95 stroke-zinc-800/80"
                          : "fill-white/95 stroke-zinc-200"
                      }
                      width={8}
                      height={4}
                    />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </motion.div>
      </motion.div>
    </Tooltip.Provider>
  );
};

export default HeaderSlide;
