/**
 * @file WorkspaceContext.tsx
 * @description Centralised state provider for handling multi-canvas workspace nodes
 * and active header tracking layouts.
 *
 * @architecture
 * - Supplies positioning metrics (x, y coordinates, height, width) for standalone sticky notes/canvases.
 * - Synchronizes table-of-contents structural anchors via an auto-observing header array.
 * - Implements a scroll-to-focus utility alongside an automated viewport IntersectionObserver.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { HeaderProps } from "../Helper/Header";

export interface ItemsProps {
  /** Uniquely computed tracking identifier key assigned to separate workspace cards */
  id: number;
  /** Defines whether an item operates as a flexible sticky memo note or a layout canvas block */
  type: "sticky note" | "canvas";
  /** Holds child react elements or custom text layout string bodies */
  content: string | React.ReactNode;
  /** Vertical boundary height constraint assigned to absolute canvas cards */
  height: number;
  /** Horizontal boundary width constraint assigned to absolute canvas cards */
  width: number;
  /** Physical offset location tracking left margin placements on infinite grids */
  x: number;
  /** Physical offset location tracking top margin placements on infinite grids */
  y: number;
}

export type HeaderStateItem = Omit<
  HeaderProps,
  "updateAttributes" | "selected"
>;

interface WorkspaceContextType {
  /** Reactive state array tracking active absolute objects present on canvas panels */
  items: ItemsProps[];
  /** Dispatch setter targeting direct absolute element additions or transformations */
  setItems: React.Dispatch<SetStateAction<ItemsProps[]>>;
  /** Deletes an absolute coordinate canvas card explicitly out of state registers */
  deleteItem: (id: number) => void;
  /** Flat map tracking heading positions to construct localized page indexes */
  headers: HeaderStateItem[];
  /** Dispatch modifier array adding or filtering active documentation header records */
  setHeaders: React.Dispatch<SetStateAction<HeaderStateItem[]>>;
  /** Math index offset marker reporting cumulative sub-header node layers */
  count: number;
  /** Current list selection position identifying which header sits visible in viewport bounds */
  activeHeaderIdx: number | null;
  /** Pushes viewport camera focus vectors gracefully straight down to target text blocks */
  scrollToHeader: (idx: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

/* eslint-disable react-refresh/only-export-components */

/**
 * @component WorkspaceProvider
 * @description Context wrapper managing item canvas collections, title trees,
 * layout item deletes, and intersection observer hooks.
 */
export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ItemsProps[]>([]);
  const [headers, setHeaders] = useState<HeaderStateItem[]>([]);
  const [activeHeaderIdx, setActiveHeaderIdx] = useState<number | null>(null);

  /** Computes standard offset references measuring full sidebar index strands */
  const count = headers.length - 1;

  // ==========================================
  // ACTIONS: DELETE BLOCK ELEMENT
  // ==========================================
  /** Removes custom canvas blocks safely, ensuring matching variable types pass metrics */
  const deleteItem = (id: number) => {
    setItems((prevItems) => {
      // Cast targets cleanly through strict number evaluation blocks to block string-to-int data drift
      const filtered = prevItems.filter(
        (item) => Number(item.id) !== Number(id),
      );

      return filtered;
    });
  };

  // ==========================================
  // INTERACTION: CAMERA FOCUS NAVIGATOR
  // ==========================================
  /**
   * Tracks structural headers down standard DOM nodes and smoothly shifts scroll fields.
   * Defers focusing inline inputs to prevent layout micro-stutter frames.
   */
  const scrollToHeader = (idx: number) => {
    const targetElement = document.querySelector(
      `div[data-id="custom-header-${idx}"], [data-idx="${idx}"]`,
    );

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const innerInput = targetElement.querySelector("input");
      if (innerInput) {
        // Delay input focus commands to keep animation velocity values completely fluid
        setTimeout(() => {
          innerInput.focus();
        }, 300);
        setActiveHeaderIdx(idx);
      }
    } else {
      // Fallback Strategy: Target lists by exact element arrays if specific selectors miss bounds
      const allHeadersOnCanvas = document.querySelectorAll(
        '[data-id^="custom-header-"]',
      );
      const fallbackTarget = allHeadersOnCanvas[idx] as HTMLElement;

      if (fallbackTarget) {
        fallbackTarget.scrollIntoView({ behavior: "smooth", block: "center" });
        const innerInput = fallbackTarget.querySelector("input");
        if (innerInput) setTimeout(() => innerInput.focus(), 300);
      } else {
        console.warn(`⚠️ Target header index block could not be located.`);
      }
    }
  };

  // ==========================================
  // LIFECYCLE: VIEWPORT VIEW MONITOR ENGINE
  // ==========================================
  /**
   * Automatically initializes viewport intersection hooks. Watches title text strands,
   * tracking when headings cross viewport margins to instantly light up active sidebar entries.
   */
  useEffect(() => {
    // Instantly dump monitoring data maps if global lists update down to zero
    if (headers.length === 0) {
      const resetTimer = setTimeout(() => {
        setActiveHeaderIdx(null);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const scrollContainer = document.querySelector(
      '[data-id="main-scroll-viewport"]',
    );

    // Binds structural top and bottom limits framing target reading zones
    const observerOptions = {
      root: scrollContainer,
      rootMargin: "-15% 0px -60% 0px",
      threshold: 0,
    };

    /** Interrogates intersect triggers, parsing data indices back to tracking hooks */
    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const targetIdString = entry.target.getAttribute("data-idx");
        if (targetIdString === null) return;

        const currentIdx = parseInt(targetIdString, 10);

        if (entry.isIntersecting) {
          setActiveHeaderIdx(currentIdx);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    // Wait until document transitions settle before binding DOM trackers
    const timer = setTimeout(() => {
      headers.forEach((header) => {
        const element = document.querySelector(
          `[data-id="custom-header-${header.idx}"]`,
        );
        if (element) {
          observer.observe(element);
        }
      });
    }, 120);

    // Clean up observer connections cleanly upon layout mutations or context drops
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [headers]);

  return (
    <WorkspaceContext.Provider
      value={{
        items,
        setItems,
        deleteItem,
        headers,
        setHeaders,
        count,
        activeHeaderIdx,
        scrollToHeader,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

/**
 * @hook useWorkspace
 * @description Direct hook used to hook up component layouts with item states,
 * element collections, and smooth anchor routing methods.
 */
export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspace must be used inside a WorkspaceProvider block",
    );
  }
  return context;
};
