/**
 * @file CommandBar.tsx (Snippet 1)
 * @component CommandBar
 * @description A spotlight-style search overlay palette [31/08/2026]. It processes
 * string search filters, coordinates keyboard index selection maps, and runs application
 * macro routines like theme changes or page route navigation.
 *
 * @architecture
 * - Leverages `useMemo` hooks to cache application macro items, preventing extra array builds.
 * - Outsources action row selection styles to native DOM selectors via `scrollIntoView`.
 * - Uses a custom spring animation container (`motion.div`) to handle modal popup entries.
 */

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiFilePlus } from "react-icons/fi";
import { BiMoon, BiSun, BiSearch, BiSolidHome } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { FaRegFolderOpen } from "react-icons/fa";
import { useSettings } from "../contexts/settingsContext";
import { LuNotepadText, LuSettings2 } from "react-icons/lu";
import { VscColorMode } from "react-icons/vsc";
import { FormatHotkey } from "../assets/FormatHotKeys";

interface CommandBarProps {
  /** Visibility toggle flag controlling the overlay canvas pane layout */
  isOpen: boolean;
  /** Dismissal callback hook closing modal display layers */
  onClose: () => void;
  /** Shared dark mode setting flag used to switch visual palette ranges */
  darkMode: boolean;
  /** Upstream state dispatcher modifying global style theme profiles */
  setDarkMode: (value: boolean) => void;
}

interface CommandItemProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
  module?: string;
  category?: string;
  hideByDefault?: boolean;
  style?: React.CSSProperties;
  darkMode?: boolean;
  isSelected?: boolean;
}

const CommandBar: React.FC<CommandBarProps> = ({
  isOpen,
  onClose,
  darkMode,
}) => {
  /** Focus link target used to capture spotlight search strings on launch */
  const inputRef = useRef<HTMLInputElement>(null);
  /** Scroll layout element containing active command row button slots */
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  /** Micro ref map caching physical item positions to adjust scroll alignments */
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  /** Local text input state tracking active typing filters inside spotlight inputs */
  const [search, setSearch] = useState<string>("");
  /** Numerical index pointer tracking which search item currently holds arrow selection */
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  /** Caches previous search input strings to reset item selection pointers on mutations */
  const [prevSearch, setPrevSearch] = useState<string>("");

  const navigate = useNavigate();
  /** References active search text variables inside hotkey event capture listeners */
  const searchRef = useRef(search);
  const settings = useSettings();

  // Keep query references cleanly synchronized during typing transitions
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  // ==========================================
  // 📊 DATA BLUEPRINT: ALL APP MACRO COMMANDS
  // ==========================================
  /**
   * Central command blueprint. Compiles icons, display text headings, shortcuts,
   * and router actions into an immutable, cached data configuration.
   */
  const allActions = useMemo(
    () => [
      {
        id: "dark",
        icon: <BiMoon />,
        title: "Switch to Dark Mode",
        shortcut: "/dark",
        module: "System",
        hideByDefault: false,
        category: "System Setting",
        action: () => settings.setSystemView("Dark Mode"),
      },
      {
        id: "light",
        icon: <BiSun />,
        title: "Switch to Light Mode",
        shortcut: "/light",
        module: "System",
        hideByDefault: false,
        category: "System Setting",
        action: () => settings.setSystemView("Light Mode"),
      },
      {
        id: "system",
        icon: <VscColorMode />,
        title: "Switch to System settings",
        shortcut: "/system",
        module: "System",
        hideByDefault: false,
        category: "System Setting",
        action: () => settings.setSystemView("System-Settings"),
      },
      {
        id: "new-doc",
        icon: <FiFilePlus />,
        title: "New Document",
        shortcut: "/n-docs",
        module: "Editor",
        hideByDefault: false,
        category: "Quick Actions",
        action: () => navigate("/TEXT_O/docs"),
      },
      {
        id: "open dox",
        icon: <FaRegFolderOpen />,
        title: "Open Document",
        shortcut: "/o",
        module: "Editor",
        category: "Quick Actions",
        action: () => navigate("/profile"),
        hideByDefault: true,
      },
      {
        id: "profile",
        icon: <BiSolidHome />,
        title: "Profile",
        shortcut: "/profile",
        module: "NXU_O",
        hideByDefault: false,
        category: "Core",
        action: () => navigate("/"),
      },
      {
        id: "scratchpad",
        icon: <LuNotepadText />,
        title: "Scratch-Pad",
        shortcut: "/scratch",
        module: "NXU_O",
        hideByDefault: false,
        category: "Core",
        action: () => navigate("/scratchpad"),
      },
      {
        id: "settings",
        icon: <LuSettings2 />,
        title: "Settings",
        shortcut: "/settings",
        module: "NXU_O",
        hideByDefault: false,
        category: "Core",
        action: () => navigate("/settings"),
      },
    ],
    [navigate, settings],
  );

  // ==========================================
  // 🔍 FILTER ENGINE: QUERY MATCH EVALUATOR
  // ==========================================
  /** Scans titles and shortcut tokens to compile filtered arrays in real time */
  const filteredActions = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (query === "") return allActions.filter((item) => !item.hideByDefault);
    return allActions.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.shortcut?.toLowerCase().includes(query),
    );
  }, [search, allActions]);

  // Reset indices if the active query string changes
  if (search !== prevSearch) {
    setPrevSearch(search);
    setSelectedIndex(-1);
  }

  useEffect(() => {
    itemRefs.current.clear();
  }, [search]);

  // ==========================================
  // 📐 SCROLL POSITIONING RE-ALIGNMENT MOTOR
  // ==========================================
  /** Auto-scrolls hidden container spaces if keyboard arrow selections slip off viewable lists */
  useEffect(() => {
    if (selectedIndex === -1) return;
    const targetNode = itemRefs.current.get(selectedIndex);
    if (targetNode) {
      targetNode.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  // ==========================================
  // 💾 MACRO EXECUTION DISPATCH TRACK ROUTER
  // ==========================================
  /** Triggers the selected list macro, fallback exact matches, or query string links */
  const handleExecute = (commandText: string) => {
    const query = commandText.toLowerCase().trim();

    if (selectedIndex >= 0 && filteredActions[selectedIndex]) {
      filteredActions[selectedIndex].action();
    } else {
      const exactMatch = allActions.find((a) => a.shortcut === query);
      if (exactMatch) {
        exactMatch.action();
      } else if (query.startsWith("/n")) {
        if (query.includes("-docs")) navigate("/TEXT_O/docs");
        else if (query.includes("-sheets")) navigate("/TEXT_O/sheets");
        else if (query.includes("-AXIS_O")) navigate("/AXIS_O");
        else navigate("/profile");
      }
    }
    cleanup();
  };

  /** Flushes local input streams, resets pointer indices, and shuts down overlays */
  const cleanup = () => {
    setSearch("");
    setSelectedIndex(-1);
    onClose();
  };

  // ==========================================
  // ⌨️ KEYDOWN CAPTURE LISTENER REGISTER
  // ==========================================
  /** Intercepts window arrows, Esc keys, and Enter keys to handle item selection maps */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredActions.length > 0 ? (prev + 1) % filteredActions.length : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredActions.length > 0
            ? (prev - 1 + filteredActions.length) % filteredActions.length
            : filteredActions.length - 1,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleExecute(searchRef.current);
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, filteredActions, selectedIndex]);

  // Auto-focus input fields immediately upon open transitions
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /** Unified stylesheet theme classes mapping light vs dark surface modes */
  const theme = {
    overlay:
      "fixed inset-0 z-999 flex items-start justify-center pt-[12vh] px-4",
    backdrop: "fixed inset-0",
    panel: `relative w-full border-1 border-zinc-500/80 max-w-xl overflow-hidden border border-zinc-400/20 rounded-xl shadow-2xl transition-all duration-300 ${
      darkMode
        ? "bg-[#121211] border-white/10 text-white shadow-black/50"
        : "bg-white/90 border-black/5 text-zinc-900 shadow-black/10"
    } backdrop-blur-2xl`,
    input:
      "w-full p-4 bg-transparent outline-none text-sm placeholder:text-zinc-500",
    kbd: `px-1.5 py-0.5 rounded text-[10px] border font-bold ${darkMode ? "bg-zinc-800 border-white/10 text-zinc-500" : "bg-zinc-100 border-black/10 text-zinc-400"}`,
  };

  {
    /* BACKDROP SHIELD DISPOSER */
  }
  return (
    <AnimatePresence mode="popLayout">
      <div className={theme.overlay}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className={theme.backdrop}
        />
        {/* OSCILLATING PANEL VIEW CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={theme.panel}
        >
          <div
            className={`flex items-center px-5 border-b ${darkMode ? "border-white/10" : "border-black/5"}`}
          >
            <kbd
              className={`inline-flex border mr-2 items-center px-2 justify-center gap-0.5 h-5 rounded-sm font-bold font-sans tracking-wide ${darkMode ? "bg-zinc-800/50 border-white/10 text-zinc-200" : "bg-zinc-100 border-black/10 text-zinc-400"} select-none`}
            >
              <FormatHotkey hotkeyStr={settings.openCommandBarKeys} />
            </kbd>
            <BiSearch
              className={darkMode ? "text-zinc-400" : "text-zinc-500"}
              size={18}
            />
            <div className="flex items-center flex-1">
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type /n-docs or search modules..."
                className={theme.input}
              />

              {/* Dynamic routing hint notification badge alert */}
              <AnimatePresence>
                {search.toLowerCase().startsWith("/n") && (
                  <motion.span
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="text-[10px] font-medium text-blue-500 animate-pulse pr-4 whitespace-nowrap"
                  >
                    Try -docs, -sheets, or -AXIS_O
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* ==========================================
              SCROLLING AREA: FILTERED RESULTS DATA LIST
              ========================================== */}
          <div
            ref={scrollContainerRef}
            className="max-h-[50vh] overflow-y-auto py-3 relative layoutScroll"
          >
            <AnimatePresence mode="popLayout">
              {filteredActions.length > 0 ? (
                filteredActions.map((item, index) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Binds physical DOM element nodes back to map indexes for coordinate scroll tracking */}
                    <div
                      ref={(el) => {
                        if (el) itemRefs.current.set(index, el);
                        else itemRefs.current.delete(index);
                      }}
                    >
                      {/* Categorical Header Sub-label (Appends only upon switching group sections) */}
                      {(index === 0 ||
                        item.category !==
                          filteredActions[index - 1].category) && (
                        <p className="px-4 py-2 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest pointer-events-none select-none">
                          {item.category}
                        </p>
                      )}

                      {/* Individual executable row element */}
                      <CommandItem
                        {...item}
                        darkMode={darkMode}
                        isSelected={index === selectedIndex}
                        action={() => {
                          item.action();
                          cleanup();
                        }}
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                /* Empty query result fallback card view */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-8 text-center text-zinc-500 text-xs italic"
                >
                  No commands matching "{search}"
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ==========================================
              PALETTE SUB-FOOTER: INSTRUCTION SHORTCUT BADGES
              ========================================== */}
          <div
            className={`p-3 flex justify-between text-[10px] font-medium border-t opacity-60 ${darkMode ? "border-white/5" : "border-black/5"}`}
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="font-bold border border-current px-1 rounded">
                  Enter
                </kbd>{" "}
                to execute
              </span>
              <span className="flex items-center gap-1">
                ESC or{" "}
                <kbd
                  className={`inline-flex items-center px-2 justify-center gap-0.5 h-5 rounded-sm font-bold font-sans tracking-wide ${darkMode ? "bg-zinc-800/50 border-white/10 text-zinc-200" : "bg-zinc-100 border-black/10 text-zinc-400"} select-none`}
                >
                  <FormatHotkey hotkeyStr={settings.openCommandBarKeys} />
                </kbd>
                to close
              </span>
            </div>
            <span>NXU_O OS V 1.0.4</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// =========================================================================
// 🎛️ SUB-COMPONENT: ATOMIZED COMMAND LIST SELECTION ROW CARD
// =========================================================================
/**
 * Renders an individual action choice item inside the command menu container.
 * Updates background highlight templates dynamically based on active selected states.
 */
const CommandItem: React.FC<CommandItemProps> = ({
  icon,
  title,
  shortcut,
  module,
  darkMode,
  action,
  isSelected,
  style,
}) => (
  <div
    className={`mx-2 flex items-center ${style ? "my-2" : ""} ${
      darkMode ? "" : style ? "border border-black" : ""
    } justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
      isSelected
        ? darkMode
          ? "bg-white/10 text-white"
          : "bg-black/5 text-zinc-900"
        : "text-zinc-400"
    }`}
    onClick={action}
    style={style || {}}
  >
    <div className="flex items-center gap-4">
      {/* Action Core Leading Icon Swatch Box */}
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-md text-lg transition-colors ${
          isSelected
            ? darkMode
              ? "bg-indigo-900 text-white"
              : "bg-blue-900 text-white"
            : darkMode
              ? "bg-[#202020] text-zinc-400"
              : style
                ? "bg-zinc-800"
                : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {icon}
      </div>

      {/* Title Header and Module Metadata Block Descriptions */}
      <div>
        <div
          className={`text-[13px] font-medium ${style ? "text-slate-950" : isSelected ? (darkMode ? "text-white" : "text-zinc-900") : darkMode ? "text-zinc-200" : "text-zinc-800"}`}
        >
          {title}
        </div>
        <div
          className={`text-[11px] font-medium ${style ? "text-black opacity-10" : "opacity-40"}`}
        >
          {module || shortcut}
        </div>
      </div>
    </div>

    {/* Right-aligned shortcut helper path badge */}
    {shortcut && (
      <span
        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
          style
            ? "text-zinc-900 bg-zinc-100"
            : darkMode
              ? "border-white/10 text-zinc-500"
              : "border-black/10 text-zinc-400"
        }`}
      >
        {shortcut}
      </span>
    )}
  </div>
);

export default CommandBar;
