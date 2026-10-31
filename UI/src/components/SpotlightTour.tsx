/**
 * @file SpotlightTour.tsx
 * @component SpotlightTour
 */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiArrowRight, FiX } from "react-icons/fi";

export interface TourStep {
  target: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right";
  padding?: number;
  preAction?: string;
  postAction?: string;
}

const DEFAULT_STEPS: TourStep[] = [
  {
    target: '[data-tour="sidebar"]',
    title: "Your workspace lives here",
    body: "Pages, notebooks, code problems, and settings. Hover to expand the sidebar.",
    placement: "right",
  },
];

let _startFn: ((steps: TourStep[], storageKey: string) => void) | null = null;

/* eslint-disable react-refresh/only-export-components */
export const startSpotlightTour = (
  steps: TourStep[] = DEFAULT_STEPS,
  storageKey: string = "nxuo-spotlight-v1",
): void => {
  _startFn?.(steps, storageKey);
};

interface SpotlightTourProps {
  darkMode: boolean;
  defaultSteps?: TourStep[];
  defaultStorageKey?: string;
}

export const SpotlightTour: React.FC<SpotlightTourProps> = ({
  darkMode,
  defaultSteps = DEFAULT_STEPS,
  defaultStorageKey = "nxuo-spotlight-v1",
}) => {
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tourSteps, setTourSteps] = useState<TourStep[]>(defaultSteps);
  const activeStorageKeyRef = useRef<string>(defaultStorageKey);

  useEffect(() => {
    _startFn = (requestedSteps, requestedKey) => {
      const available = requestedSteps.filter((s) =>
        document.querySelector(s.target),
      );
      if (available.length === 0) return;
      setTourSteps(available);
      activeStorageKeyRef.current = requestedKey;
      setTargetRect(null);
      setStepIndex(0);
      setIsActive(true);
    };
    return () => {
      _startFn = null;
    };
  }, []);

  const currentStep: TourStep | undefined = tourSteps[stepIndex];
  const totalSteps = tourSteps.length;

  useLayoutEffect(() => {
    if (!isActive || !currentStep) return;

    let actionTimer: ReturnType<typeof setTimeout>;
    if (currentStep.preAction) {
      actionTimer = setTimeout(() => {
        window.dispatchEvent(new CustomEvent(currentStep.preAction!));
      }, 100);
    }

    let attempt = 0;
    let measureTimer: ReturnType<typeof setTimeout>;
    let hasScrolled = false;

    const measure = () => {
      const el = document.querySelector(currentStep.target);

      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Check if the element is outside the viewport
          const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

          if (!isVisible && !hasScrolled) {
            hasScrolled = true;
            // Scroll it to the center of the screen
            el.scrollIntoView({ behavior: "smooth", block: "center" });

            // Wait for the smooth scroll to finish (approx 400ms) before measuring again
            measureTimer = setTimeout(measure, 400);
            return;
          }

          // Once visible (or if it was already visible), set the rect
          setTargetRect(rect);
          return;
        }
      }

      if (attempt < 20) {
        attempt++;
        measureTimer = setTimeout(measure, 50);
      }
    };

    // Start measuring slightly after mount
    measureTimer = setTimeout(measure, 50);

    // Keep the highlight locked to the element if the user scrolls manually or resizes
    const handleScrollOrResize = () => {
      const el = document.querySelector(currentStep.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0) {
          setTargetRect(rect);
        }
      }
    };

    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, {
      capture: true,
      passive: true,
    });

    return () => {
      clearTimeout(actionTimer);
      clearTimeout(measureTimer);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, {
        capture: true,
      });
    };
  }, [isActive, stepIndex, currentStep]);

  const finish = () => {
    if (currentStep?.postAction) {
      window.dispatchEvent(new CustomEvent(currentStep.postAction));
    }
    setTargetRect(null);
    setIsActive(false);
    try {
      localStorage.setItem(activeStorageKeyRef.current, "1");
      sessionStorage.setItem("nxuo-last-tour-dismiss", String(Date.now()));
    } catch {
      console.log("error");
    }
  };

  const next = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentStep?.postAction) {
      window.dispatchEvent(new CustomEvent(currentStep.postAction));
    }
    if (stepIndex < totalSteps - 1) setStepIndex(stepIndex + 1);
    else finish();
  };

  const prev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentStep?.postAction) {
      window.dispatchEvent(new CustomEvent(currentStep.postAction));
    }
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finish();
      } else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, stepIndex]);

  const tooltipPos = computeTooltipPosition(
    targetRect,
    currentStep?.placement ?? "bottom",
  );

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-999999"
          style={{ pointerEvents: "none" }}
        >
          {targetRect && currentStep && (
            <motion.div
              key={currentStep.target}
              initial={false}
              animate={{
                top: targetRect.top - (currentStep.padding ?? 8),
                left: targetRect.left - (currentStep.padding ?? 8),
                width: targetRect.width + (currentStep.padding ?? 8) * 2,
                height: targetRect.height + (currentStep.padding ?? 8) * 2,
              }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="absolute rounded-lg"
              style={{
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.72)",
                pointerEvents: "none",
                border: "2px solid rgba(59,130,246,0.7)",
              }}
            />
          )}

          {targetRect && currentStep && (
            <motion.div
              key={`tooltip-${stepIndex}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                top: tooltipPos.top,
                left: tooltipPos.left,
                transform: tooltipPos.transform,
                pointerEvents: "auto",
              }}
              className={`w-72 rounded-xl border shadow-2xl p-4 ${
                darkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100"
                  : "bg-white border-zinc-200 text-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="text-sm font-bold leading-tight">
                  {currentStep.title}
                </h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    finish();
                  }}
                  className={`shrink-0 p-1 -mr-1 -mt-1 rounded transition-colors ${
                    darkMode
                      ? "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                      : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <FiX size={14} />
                </button>
              </div>
              <p
                className={`text-xs leading-relaxed mb-4 ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
              >
                {currentStep.body}
              </p>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-mono ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}
                >
                  {stepIndex + 1} / {totalSteps}
                </span>
                <div className="flex items-center gap-1.5">
                  {stepIndex > 0 && (
                    <button
                      onClick={(e) => prev(e)}
                      className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                        darkMode
                          ? "text-zinc-400 hover:text-white hover:bg-zinc-800"
                          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
                      }`}
                    >
                      <FiArrowLeft size={11} />
                      Back
                    </button>
                  )}
                  <button
                    onClick={(e) => next(e)}
                    className={`flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                      darkMode
                        ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                        : "bg-zinc-900 text-white hover:bg-black"
                    }`}
                  >
                    {stepIndex < totalSteps - 1 ? (
                      <>
                        Next
                        <FiArrowRight size={11} />
                      </>
                    ) : (
                      "Done"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function computeTooltipPosition(
  rect: DOMRect | null,
  preferred: "top" | "bottom" | "left" | "right",
): { top: number; left: number; transform: string } {
  if (!rect) return { top: 0, left: 0, transform: "" };

  const offset = 16;
  const tooltipW = 288;
  const tooltipH = 190;
  const margin = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let placement = preferred;
  if (placement === "bottom" && rect.bottom + offset + tooltipH > vh - margin)
    placement = "top";
  if (placement === "top" && rect.top - offset - tooltipH < margin)
    placement = "bottom";
  if (placement === "right" && rect.right + offset + tooltipW > vw - margin)
    placement = "left";
  if (placement === "left" && rect.left - offset - tooltipW < margin)
    placement = "right";

  let top: number;
  let left: number;
  let transform = "";

  if (placement === "right") {
    top = rect.top + rect.height / 2;
    left = rect.right + offset;
    transform = "translateY(-50%)";
  } else if (placement === "left") {
    top = rect.top + rect.height / 2;
    left = rect.left - offset - tooltipW;
    transform = "translateY(-50%)";
  } else if (placement === "top") {
    top = rect.top - offset - tooltipH;
    left = rect.left + rect.width / 2 - tooltipW / 2;
  } else {
    top = rect.bottom + offset;
    left = rect.left + rect.width / 2 - tooltipW / 2;
  }

  left = Math.max(margin, Math.min(left, vw - tooltipW - margin));
  top = Math.max(margin, Math.min(top, vh - tooltipH - margin));

  return { top, left, transform };
}

export default SpotlightTour;
