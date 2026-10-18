/**
 * @file PageRail.tsx
 * @component PageRail
 * @description Left page rail. Collapsed: thin tick strip with per-tick
 * hover tooltips (rendered via portal so they escape the rail's clip).
 * Expanded: full panel with tick + name rows.
 */

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus, FiSidebar } from "react-icons/fi";
import { useSettings } from "../contexts/settingsContext";

export interface PageRailPage {
  id: string;
  title: string;
}

interface PageRailProps {
  pages: PageRailPage[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  darkMode: boolean;
}

const TICK_SPACING = 18;
const WIDTH_COLLAPSED = 40;
const WIDTH_EXPANDED = 256;
const HEADER_H = 40;
const FOOTER_H = 44;

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface TooltipState {
  pageId: string;
  title: string;
  top: number;
  left: number;
}

export const PageRail: React.FC<PageRailProps> = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  darkMode,
}) => {
  const { zenMode } = useSettings();

  // ── Tooltip state — tracks position in viewport coordinates ──
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hoverTimerRef = useRef<number | null>(null);

  const [localExpanded, setLocalExpanded] = useState(true);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleTickEnter = (page: PageRailPage, el: HTMLElement | null) => {
    if (localExpanded || !el) return;
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    // Compute the tooltip's viewport position from the tick's bounding rect.
    const rect = el.getBoundingClientRect();
    setTooltip({
      pageId: page.id,
      title: page.title || "Untitled Page",
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
  };

  const handleTickLeave = () => {
    if (localExpanded) return;
    hoverTimerRef.current = window.setTimeout(() => {
      setTooltip(null);
      hoverTimerRef.current = null;
    }, 100);
  };

  // Clear tooltip when pinning (tooltip is a collapsed-mode affordance).
  useEffect(() => {
    if (!zenMode)
      setTimeout(() => {
        setTooltip(null);
      }, 0);
    setTimeout(() => {
      setLocalExpanded(!zenMode);
    }, 0);
  }, [zenMode]);

  return (
    <>
      <motion.aside
        className={`relative h-full shrink-0 border-r overflow-hidden ${
          darkMode
            ? "bg-zinc-950 border-zinc-800"
            : "bg-zinc-50 border-zinc-200"
        }`}
        initial={false}
        animate={{ width: localExpanded ? WIDTH_EXPANDED : WIDTH_COLLAPSED }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {/* ==========================================================
            HEADER — absolute, zenMode to the top
            ========================================================== */}
        <header
          style={{ height: HEADER_H }}
          className={`absolute top-0 left-0 right-0 flex items-center border-b z-10 ${
            darkMode ? "border-zinc-800" : "border-zinc-200/80"
          } ${localExpanded ? "justify-between pl-3 pr-2" : "justify-center"}`}
        >
          <AnimatePresence initial={false}>
            {localExpanded && (
              <motion.span
                key="header-label"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.16, ease: EASE }}
                className={`text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                  darkMode ? "text-zinc-500" : "text-zinc-400"
                }`}
              >
                Pages
              </motion.span>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setLocalExpanded((p) => !p)}
            aria-label={
              localExpanded ? "Collapse page panel" : "Expand page panel"
            }
            title={localExpanded ? "Collapse page panel" : "Expand page panel"}
            className={`shrink-0 flex items-center justify-center w-6 h-6 rounded outline-none transition-colors ${
              darkMode
                ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            } focus-visible:ring-2 focus-visible:ring-blue-500/40`}
          >
            <motion.span
              animate={{ rotate: !localExpanded ? 0 : 180 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex items-center justify-center"
            >
              <FiSidebar size={13} />
            </motion.span>
          </button>
        </header>

        {/* ==========================================================
            BODY — absolute between header and footer
            ========================================================== */}
        <div
          className="absolute left-0 right-0 overflow-hidden"
          style={{ top: HEADER_H, bottom: FOOTER_H }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {localExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute inset-0 overflow-y-auto p-1.5 space-y-0.5"
              >
                {pages.length === 0 && (
                  <div
                    className={`px-3 py-6 text-center text-xs whitespace-nowrap ${
                      darkMode ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    No pages yet
                  </div>
                )}

                {pages.map((page) => {
                  const isActive = page.id === activePageId;
                  return (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => onSelectPage(page.id)}
                      className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left outline-none transition-colors ${
                        !isActive
                          ? darkMode
                            ? "bg-zinc-950 hover:bg-zinc-800/60  hover:text-zinc-200 text-zinc-100"
                            : " hover:bg-zinc-100 hover:text-zinc-900 text-zinc-900"
                          : darkMode
                            ? "text-zinc-400 hover:bg-zinc-800/60  hover:text-zinc-200"
                            : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      } focus-visible:ring-2 focus-visible:ring-blue-500/40`}
                    >
                      <span
                        className={`shrink-0 block rounded-full transition-all ${
                          isActive
                            ? "w-3.5 h-0.75 bg-blue-500"
                            : darkMode
                              ? "w-2.5 h-0.5 bg-zinc-700"
                              : "w-2.5 h-0.5 bg-zinc-400"
                        }`}
                      />
                      <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                        {page.title || "Untitled Page"}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14, ease: "easeOut" }}
                className="absolute inset-0 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
              >
                <div className="w-full flex flex-col py-2 my-auto">
                  {pages.map((page) => {
                    const isActive = page.id === activePageId;
                    const isHovered = tooltip?.pageId === page.id;

                    return (
                      <div
                        key={page.id}
                        style={{ height: TICK_SPACING }}
                        className="relative w-full flex items-center justify-center"
                      >
                        <button
                          type="button"
                          ref={(el) => {
                            // Store the element so hover knows where to anchor.
                            if (!el) return;
                            el.dataset.pageId = page.id;
                          }}
                          onMouseEnter={(e) =>
                            handleTickEnter(
                              page,
                              e.currentTarget as HTMLElement | null,
                            )
                          }
                          onMouseLeave={handleTickLeave}
                          onClick={() => onSelectPage(page.id)}
                          aria-label={page.title || "Untitled Page"}
                          className="flex items-center justify-center w-full h-full outline-none"
                        >
                          <span
                            className={`block rounded-full transition-all duration-150 ${
                              isActive
                                ? "w-3.5 h-0.75 bg-blue-500"
                                : isHovered
                                  ? darkMode
                                    ? "w-3 h-0.5 bg-zinc-500"
                                    : "w-3 h-0.5 bg-zinc-400"
                                  : darkMode
                                    ? "w-2 h-0.5 bg-zinc-700"
                                    : "w-2 h-0.5 bg-zinc-400"
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==========================================================
            FOOTER — absolute, zenMode to the bottom
            ========================================================== */}
        <div
          style={{ height: FOOTER_H }}
          className={`absolute bottom-9 left-0 right-0 border-t z-10 ${
            darkMode
              ? "border-zinc-800 bg-zinc-950"
              : "border-zinc-200/80 bg-zinc-50"
          }`}
        >
          <button
            type="button"
            onClick={onAddPage}
            aria-label="Add page"
            title="Add page"
            className={`w-full h-full flex items-center outline-none transition-colors ${
              localExpanded ? "gap-2 px-3 justify-start" : "justify-center"
            } ${
              darkMode
                ? "text-zinc-200 hover:text-white hover:bg-zinc-800"
                : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            } focus-visible:ring-2 focus-visible:ring-blue-500/40`}
          >
            <FiPlus size={18} strokeWidth={2.5} className="shrink-0" />
            <AnimatePresence initial={false}>
              {localExpanded && (
                <motion.span
                  key="add-label"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.16, ease: EASE }}
                  className="text-[12.5px] font-medium whitespace-nowrap"
                >
                  Add Page
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ==========================================================
          TOOLTIP PORTAL — rendered on document.body so it escapes
          the rail's overflow-hidden and any stacking context.
          ========================================================== */}
      {createPortal(
        <AnimatePresence>
          {tooltip && !localExpanded && (
            <motion.div
              key={tooltip.pageId}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: tooltip.top - 15,
                left: tooltip.left - 15,
                transform: "translateY(-50%)",
                pointerEvents: "none",
                zIndex: 9999,
              }}
              className="relative whitespace-nowrap"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPage(tooltip.pageId);
              }}
            >
              {/* Tail — rotated square peeking out of the left edge */}
              <span
                aria-hidden
                className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 bg-zinc-800"
              />

              {/* Bubble */}
              <span
                className={`relative block px-3 py-1.5 rounded-xl text-[12px] font-medium shadow-lg bg-zinc-800 ${
                  darkMode ? "text-zinc-100" : "text-zinc-50"
                }`}
              >
                {tooltip.title}
              </span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default PageRail;
