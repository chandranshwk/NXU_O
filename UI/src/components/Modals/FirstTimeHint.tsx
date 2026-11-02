/**
 * @file FirstTimeHint.tsx
 * @component FirstTimeHint
 * @description A small, dismissible tooltip that teaches one feature exactly
 * once. Renders absolutely relative to its parent; parent must be `relative`.
 *
 * @architecture
 * - Backed by `useFirstRun(key)`. Each hint gets a unique key.
 * - Does not block interaction (pointer-events only on the tooltip itself).
 * - Bump the key suffix to re-show to existing users after a UX change.
 */

import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { useFirstRun } from "../../Hooks/useFirstRun";

interface FirstTimeHintProps {
  /** Storage key — must be unique per hint and version-suffixed (e.g. "-v1"). */
  storageKey: string;
  /** Where to anchor relative to the parent. */
  placement?: "top" | "bottom" | "left" | "right";
  /** Headline. Keep it under ~40 chars. */
  title: string;
  /** Body. Keep it under ~120 chars. */
  body: React.ReactNode;
  darkMode: boolean;
  /** Optional arrow shown on the side facing the parent. */
  withArrow?: boolean;
  /** Optional width class override. */
  className?: string;
}

const PLACEMENT_CLASSES: Record<
  NonNullable<FirstTimeHintProps["placement"]>,
  string
> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export const FirstTimeHint: React.FC<FirstTimeHintProps> = ({
  storageKey,
  placement = "bottom",
  title,
  body,
  darkMode,
  withArrow = false,
  className = "",
}) => {
  const [isFirstRun, dismiss] = useFirstRun(storageKey);

  return (
    <AnimatePresence>
      {isFirstRun && (
        <motion.div
          initial={{ opacity: 0, y: placement === "top" ? 4 : -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: placement === "top" ? 4 : -4 }}
          transition={{ duration: 0.18 }}
          className={`absolute z-50 w-56 ${PLACEMENT_CLASSES[placement]} ${className}`}
          // Stop clicks from closing the parent dropdown/menu.
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {withArrow && (
            <span
              aria-hidden
              className={`absolute w-2 h-2 rotate-45 ${
                darkMode ? "bg-zinc-800" : "bg-zinc-900"
              } ${
                placement === "bottom"
                  ? "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  : placement === "top"
                    ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                    : placement === "right"
                      ? "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
                      : "right-0 top-1/2 -translate-y-1/2 translate-x-1/2"
              }`}
            />
          )}

          <div
            className={`relative rounded-lg shadow-xl p-3 text-xs ${
              darkMode
                ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                : "bg-zinc-900 text-zinc-100"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-[11.5px] leading-tight">
                {title}
              </p>
              <button
                onClick={dismiss}
                aria-label="Dismiss"
                className="shrink-0 -mr-1 -mt-1 p-1 rounded hover:bg-white/10 transition-colors"
              >
                <FiX size={12} />
              </button>
            </div>
            <div className="mt-1 text-[11px] leading-relaxed opacity-80">
              {body}
            </div>
            <button
              onClick={dismiss}
              className={`mt-2 w-full text-[10.5px] font-semibold py-1 rounded transition-colors ${
                darkMode
                  ? "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                  : "bg-zinc-100/20 hover:bg-zinc-100/30 text-white"
              }`}
            >
              Got it
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FirstTimeHint;
