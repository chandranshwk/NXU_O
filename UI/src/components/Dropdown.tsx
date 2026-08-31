/**
 * @file Dropdown.tsx
 * @component Dropdown
 * @description A generic, reusable dropdown shell component using React forwardRef.
 * It features dynamic screen boundary layout checking to orient its menu list upward,
 * downward, or horizontally relative to window edges.
 *
 * @architecture
 * - Uses `forwardRef` to pass DOM handles up to parent nodes like context menus.
 * - Supports dual-mode architecture: acts self-managed or switches to parent-managed control maps via `externalOpen`.
 * - Employs a viewport `IntersectionObserver` style fallback loop via scroll listeners to recompute safety margins.
 */

import React, {
  useState,
  useEffect,
  useRef,
  type ReactNode,
  forwardRef,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface MenuItem {
  /** The display text string label on the item button card row */
  label: string;
  /** Optional icon graphic snippet preceding the textual string block label */
  icon?: ReactNode;
  /** Individual execution action command fired when clicking the option row button */
  onClick: () => void;
  /** Stylized visual theme variants to modify default typography parameters */
  variant?: "default" | "destructive" | "primary";
  /** Appends a separator divider line directly above this array item element */
  separator?: boolean;
}

interface DropdownProps {
  /** Target indicator anchor component that triggers visibility on click */
  trigger: ReactNode;
  /** Flat map tracking data arrays to construct child list items */
  items: MenuItem[];
  /** Shared dark mode setting flag used to switch visual palette states */
  darkMode: boolean;
  /** Explicit horizontal boundary constraint parameter width label token */
  width?: string;
  /** Parental override state variable driving menu visibility maps directly */
  externalOpen?: boolean;
  /** Optional callback handler notifying parent contexts of visibility close triggers */
  onClose?: () => void;
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    { trigger, items, darkMode, width = "w-48", externalOpen, onClose },
    ref,
  ) => {
    /** State visibility tracker used when operating under standard self-managed logic */
    const [internalOpen, setInternalOpen] = useState(false);

    // Effectively chooses between self-managed state or parent-managed state
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;

    /** Geometric calculation state flipping menu streams upward when hitting lower screen edges */
    const [isUpward, setIsUpward] = useState(false);
    /** Alignment tracking metric shifting panel layouts inside viewports ('left' | 'right' | 'center') */
    const [horizontalAlign, setHorizontalAlign] = useState<
      "left" | "right" | "center"
    >("left");

    /** Boundary element tracker capturing target container rendering dimensions */
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ==========================================
    // GEOMETRY: SCREEN VIEWPORT LOOK-AHEAD
    // ==========================================
    /**
     * Interrogates physical screen pixel coordinates dynamically. Measures layout clearances
     * to automatically tuck menus upwards or shift horizontal margins inside screen boundaries.
     */
    const checkPosition = useCallback(() => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const vh = window.innerHeight;
        const vw = window.innerWidth;

        // Estimate vertical clearance height margins
        const estimatedHeight = items.length * 44 + 20;
        const spaceBelow = vh - rect.bottom;
        setIsUpward(spaceBelow < estimatedHeight);

        // Estimate horizontal clearance width margins
        const estimatedWidth = parseInt(width.replace("w-", ""), 10) * 4 || 192;
        const spaceRight = vw - rect.left;
        const spaceLeft = rect.right;

        if (spaceRight < estimatedWidth) {
          setHorizontalAlign("right");
        } else if (spaceLeft < estimatedWidth) {
          setHorizontalAlign("left");
        } else {
          setHorizontalAlign("center");
        }
      }
    }, [items.length, width]);

    // ==========================================
    // LIFECYCLE 1: MONITOR MOVEMENT FRAMES
    // ==========================================
    /** Registers scroll and resize checks to recalculate offsets when opened */
    useEffect(() => {
      if (isOpen) {
        checkPosition();
        window.addEventListener("scroll", checkPosition, true);
        window.addEventListener("resize", checkPosition);
      }
      return () => {
        window.removeEventListener("scroll", checkPosition, true);
        window.removeEventListener("resize", checkPosition);
      };
    }, [isOpen, checkPosition]);

    // ==========================================
    // LIFECYCLE 2: OUTSIDE CLICK DISMISSAL
    // ==========================================
    /** Closes visibility vectors whenever users tap background areas or hit Escape */
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          if (onClose) onClose();
          setInternalOpen(false);
        }
      };
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (onClose) onClose();
          setInternalOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleEsc);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("keydown", handleEsc);
      };
    }, [onClose]);

    /** Helper resolving Tailwinds position classes based on horizontal boundary checks */
    const getHorizontalClass = () => {
      if (horizontalAlign === "right") return "right-0 origin-top-right";
      if (horizontalAlign === "left") return "left-0 origin-top-left";
      return "-left-20 origin-top";
    };

    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* ==========================================
            TRIGGER ELEMENT RAILS CONTAINER LAYER
            ========================================== */}
        <div
          ref={ref}
          onClick={(e) => {
            e.stopPropagation();
            // Modify local states only if parental tracking hooks are absent
            if (externalOpen === undefined) {
              setInternalOpen(!internalOpen);
            }
          }}
          className="cursor-pointer bg-transparent relative z-0"
        >
          {trigger}
        </div>

        {/* ==========================================
            PORTAL ANIMATION PANEL MENU GRID LAYER
            ========================================== */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: isUpward ? 8 : -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: isUpward ? 8 : -8 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              style={{ originY: isUpward ? 1 : 0 }}
              className={`
                absolute ${width} z-999
                rounded-2xl border backdrop-blur-xl shadow-2xl overflow-hidden
                ${getHorizontalClass()}
                ${isUpward ? "bottom-full mb-2" : "top-full mt-2"}
                ${
                  darkMode
                    ? "bg-[#1c1c1e]/90 border-white/10 shadow-black/40"
                    : "bg-white/90 border-black/5 shadow-xl shadow-black/10"
                }
              `}
            >
              <div className="p-1.5 scrollbar-hide max-h-[70vh] overflow-y-auto">
                {items.map((item, idx) => (
                  <React.Fragment key={idx}>
                    {/* Visual partitioning horizontal item boundary lines */}
                    {item.separator && (
                      <div
                        className={`my-1 h-px w-full text-left ${darkMode ? "bg-white/5" : "bg-black/5"}`}
                      />
                    )}

                    {/* ROW BUTTON SELECTION INTERACTION TRIGGER */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                        if (onClose) onClose();
                        setInternalOpen(false);
                      }}
                      className={`group w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-medium
                    ${
                      darkMode
                        ? item.variant === "destructive"
                          ? "hover:bg-rose-500/20 text-rose-400"
                          : "hover:bg-white/10 text-neutral-300 hover:text-white"
                        : item.variant === "destructive"
                          ? "hover:bg-rose-50 text-rose-600"
                          : "hover:bg-black/5 text-neutral-600 hover:text-black"
                    }`}
                    >
                      {/* Left icon wrapper accentuation row */}
                      {item.icon && (
                        <span className="text-lg opacity-80 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                      )}
                      {item.label}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
