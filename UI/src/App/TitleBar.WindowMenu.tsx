import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiSearch, FiX, FiPlus, FiExternalLink, FiCheck } from "react-icons/fi";
import { LuNotepadText } from "react-icons/lu";

export interface MenuTab {
  id: string;
  title: string;
  icon?: React.ReactNode;
  shortcut?: string;
}

export interface AddAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
}

interface WindowMenuProps {
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  darkMode: boolean;
  tabs: MenuTab[];
  maxTabs: number;
  createActions: AddAction[];
  pageLinks: AddAction[];
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onAddCustomTab?: (label: string, destination: string) => void;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const MenuRow: React.FC<{
  darkMode: boolean;
  onClick?: () => void;
  disabled?: boolean;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}> = ({ darkMode, onClick, disabled, trailing, children }) => (
  <div
    className={`w-full flex items-center gap-2.5 pl-3 pr-1.5 py-1.5 text-left text-[12.5px]
      transition-colors
      ${
        disabled
          ? darkMode
            ? "text-zinc-600"
            : "text-zinc-400"
          : darkMode
            ? "text-zinc-300 hover:bg-zinc-800/70 hover:text-zinc-100"
            : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
  >
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-w-0 flex-1 flex items-center gap-2.5 text-left outline-none disabled:cursor-not-allowed"
    >
      {children}
    </button>
    {trailing}
  </div>
);

export const WindowMenu: React.FC<WindowMenuProps> = ({
  open,
  onClose,
  anchorEl,
  darkMode,
  tabs,
  maxTabs,
  createActions,
  pageLinks,
  onSelectTab,
  onCloseTab,
  onAddCustomTab,
}) => {
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [customDraft, setCustomDraft] = useState<{
    label: string;
    dest: string;
  } | null>(null);
  const [pos, setPos] = useState<{ top: number; right: number }>({
    top: 0,
    right: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Reset internal state when the menu opens ────────────────
  // Adjusting state during render (not in an effect) is React's
  // recommended pattern for "reset when a prop changes":
  // https://react.dev/reference/react/useState#storing-information-from-previous-renders
  // An effect that calls setState would trigger a cascading render
  // and is flagged by react-hooks/set-state-in-effect.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setShowAdd(false);
      setCustomDraft(null);
    }
  }

  // Focus the search input on open (DOM side-effect — belongs in an effect).
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  // Reposition on open / anchor change.
  useEffect(() => {
    if (!open || !anchorEl) return;
    const measure = () => {
      const rect = anchorEl.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, anchorEl]);

  // Escape / outside-click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Read via ref-free closure; customDraft check is cosmetic,
        // so we use the latest value passed in through deps.
        if (customDraft) setCustomDraft(null);
        else onClose();
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (anchorEl?.contains(t)) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose, anchorEl, customDraft]);

  const submitCustom = () => {
    if (!customDraft) return;
    const label = customDraft.label.trim();
    const dest = customDraft.dest.trim();
    if (!label || !dest) return;
    onAddCustomTab?.(label, dest);
    setCustomDraft(null);
  };

  const q = query.trim().toLowerCase();
  const filteredTabs = q
    ? tabs.filter((t) => t.title.toLowerCase().includes(q))
    : tabs;
  const filteredCreate = q
    ? createActions.filter((a) => a.label.toLowerCase().includes(q))
    : createActions;
  const filteredPages = q
    ? pageLinks.filter((a) => a.label.toLowerCase().includes(q))
    : pageLinks;

  const atLimit = tabs.length >= maxTabs;

  const sectionLabel = darkMode ? "text-zinc-500" : "text-zinc-400";
  const subLabel = darkMode ? "text-zinc-500" : "text-zinc-400";
  const iconTone = darkMode ? "text-zinc-400" : "text-zinc-500";
  const iconToneMuted = darkMode ? "text-zinc-500" : "text-zinc-400";
  const emptyTone = darkMode ? "text-zinc-600" : "text-zinc-400";

  const inputClass = `w-full rounded border px-2 py-1 text-[12px] outline-none
    placeholder:text-zinc-500 focus:border-blue-500/60 transition-colors
    ${
      darkMode
        ? "bg-zinc-950/50 border-zinc-700 text-zinc-100"
        : "bg-zinc-50 border-zinc-200 text-zinc-900"
    }`;

  const noResults =
    q &&
    filteredTabs.length === 0 &&
    filteredCreate.length === 0 &&
    filteredPages.length === 0;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.12, ease: EASE }}
          style={{
            position: "fixed",
            top: pos.top,
            right: pos.right,
            zIndex: 9999,
          }}
          className={`w-85 rounded-xl overflow-hidden shadow-2xl origin-top-right
            ${
              darkMode
                ? "bg-zinc-900 border border-zinc-800 text-zinc-200 shadow-black/50"
                : "bg-white border border-zinc-200 text-zinc-800 shadow-black/15"
            }`}
        >
          {/* Search */}
          <div
            className={`flex items-center gap-2 px-3 py-2 border-b ${
              darkMode ? "border-zinc-800" : "border-zinc-100"
            }`}
          >
            <FiSearch size={13} className={iconToneMuted} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tabs"
              className={`flex-1 bg-transparent outline-none text-[12.5px] placeholder:text-zinc-500 ${
                darkMode ? "text-zinc-100" : "text-zinc-900"
              }`}
            />
            <span
              className={`text-[10px] font-mono ${
                darkMode ? "text-zinc-600" : "text-zinc-400"
              }`}
            >
              {tabs.length}/{maxTabs}
            </span>
          </div>

          {/* Tabs */}
          <div className="py-1.5">
            <div
              className={`px-3 py-1 text-[11px] font-medium ${sectionLabel}`}
            >
              Tabs
            </div>

            {filteredTabs.map((tab) => (
              <MenuRow
                key={tab.id}
                darkMode={darkMode}
                onClick={() => onSelectTab?.(tab.id)}
                trailing={
                  <button
                    type="button"
                    aria-label={`Close ${tab.title}`}
                    onClick={() => onCloseTab?.(tab.id)}
                    className={`shrink-0 flex items-center justify-center w-5 h-5 rounded
                      ${
                        darkMode
                          ? "text-zinc-500 hover:text-zinc-100 hover:bg-white/10"
                          : "text-zinc-400 hover:text-zinc-800 hover:bg-black/5"
                      }`}
                  >
                    <FiX size={13} />
                  </button>
                }
              >
                <span
                  className={`shrink-0 flex items-center justify-center ${iconTone}`}
                >
                  {tab.icon ?? <LuNotepadText size={15} />}
                </span>
                <span className="min-w-0 flex-1 truncate">{tab.title}</span>
              </MenuRow>
            ))}

            {filteredTabs.length === 0 && !q && (
              <div className={`px-3 py-1.5 text-[12px] ${emptyTone}`}>
                No open tabs
              </div>
            )}

            {/* ── Add tab ─────────────────────────────────── */}
            <button
              type="button"
              onClick={() => setShowAdd((s) => !s)}
              aria-expanded={showAdd}
              className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-[12.5px] outline-none
                transition-colors
                ${
                  darkMode
                    ? "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
            >
              <FiPlus
                size={14}
                className={`transition-transform duration-150 ${
                  showAdd ? "rotate-45" : ""
                }`}
              />
              <span className="min-w-0 flex-1 truncate">Add tab</span>
              {atLimit && !showAdd && (
                <span
                  className={`text-[10px] ${
                    darkMode ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  Full
                </span>
              )}
            </button>

            {/* Inline expand */}
            <AnimatePresence initial={false}>
              {showAdd && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.16, ease: EASE }}
                  className={`overflow-hidden ml-3 border-l ${
                    darkMode ? "border-zinc-800" : "border-zinc-100"
                  }`}
                >
                  {/* Create */}
                  {filteredCreate.length > 0 && (
                    <>
                      <div
                        className={`px-3 pt-1 pb-0.5 text-[10.5px] font-medium uppercase tracking-wide ${subLabel}`}
                      >
                        Create
                      </div>
                      {filteredCreate.map((action) => (
                        <MenuRow
                          key={action.id}
                          darkMode={darkMode}
                          onClick={action.onClick}
                          disabled={action.disabled}
                        >
                          <span
                            className={`shrink-0 flex items-center justify-center ${iconTone}`}
                          >
                            {action.icon ?? <FiPlus size={15} />}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {action.label}
                          </span>
                          {action.hint && (
                            <span
                              className={`text-[10px] ${
                                darkMode ? "text-zinc-600" : "text-zinc-400"
                              }`}
                            >
                              {action.hint}
                            </span>
                          )}
                        </MenuRow>
                      ))}
                    </>
                  )}

                  {/* Custom tab */}
                  <MenuRow
                    darkMode={darkMode}
                    onClick={() =>
                      setCustomDraft(
                        customDraft ? null : { label: "", dest: "" },
                      )
                    }
                    disabled={atLimit && !customDraft}
                  >
                    <span
                      className={`shrink-0 flex items-center justify-center ${iconTone}`}
                    >
                      <FiExternalLink size={15} />
                    </span>
                    <span className="min-w-0 flex-1 truncate">Custom tab</span>
                    {atLimit && !customDraft && (
                      <span
                        className={`text-[10px] ${
                          darkMode ? "text-zinc-600" : "text-zinc-400"
                        }`}
                      >
                        Full
                      </span>
                    )}
                  </MenuRow>

                  {/* Custom tab form */}
                  <AnimatePresence initial={false}>
                    {customDraft && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.16, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 py-2 space-y-1.5">
                          <input
                            autoFocus
                            value={customDraft.label}
                            onChange={(e) =>
                              setCustomDraft({
                                ...customDraft,
                                label: e.target.value,
                              })
                            }
                            placeholder="Tab name"
                            className={inputClass}
                          />
                          <input
                            value={customDraft.dest}
                            onChange={(e) =>
                              setCustomDraft({
                                ...customDraft,
                                dest: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                submitCustom();
                              }
                              if (e.key === "Escape") {
                                e.preventDefault();
                                setCustomDraft(null);
                              }
                            }}
                            placeholder="/route or https://…"
                            className={inputClass}
                          />
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={submitCustom}
                              disabled={
                                !customDraft.label.trim() ||
                                !customDraft.dest.trim()
                              }
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11.5px] font-medium
                                transition-colors disabled:opacity-40 disabled:cursor-not-allowed
                                ${
                                  darkMode
                                    ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                                    : "bg-zinc-900 text-zinc-100 hover:bg-zinc-800"
                                }`}
                            >
                              <FiCheck size={12} />
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setCustomDraft(null)}
                              className={`px-2.5 py-1 rounded text-[11.5px]
                                ${
                                  darkMode
                                    ? "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70"
                                    : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                                }`}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Go to */}
                  {filteredPages.length > 0 && (
                    <>
                      <div
                        className={`px-3 pt-1.5 pb-0.5 text-[10.5px] font-medium uppercase tracking-wide ${subLabel}`}
                      >
                        Go to
                      </div>
                      {filteredPages.map((action) => (
                        <MenuRow
                          key={action.id}
                          darkMode={darkMode}
                          onClick={action.onClick}
                          disabled={action.disabled}
                        >
                          <span
                            className={`shrink-0 flex items-center justify-center ${iconToneMuted}`}
                          >
                            {action.icon ?? <FiExternalLink size={15} />}
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {action.label}
                          </span>
                          {action.hint && (
                            <span
                              className={`text-[10px] ${
                                darkMode ? "text-zinc-600" : "text-zinc-400"
                              }`}
                            >
                              {action.hint}
                            </span>
                          )}
                        </MenuRow>
                      ))}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {noResults && (
            <div
              className={`px-3 py-6 text-center text-[12px] border-t ${
                darkMode
                  ? "border-zinc-800 text-zinc-500"
                  : "border-zinc-100 text-zinc-400"
              }`}
            >
              No matches
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default WindowMenu;
