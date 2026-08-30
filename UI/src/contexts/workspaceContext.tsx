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
  id: number;
  type: "sticky note" | "canvas";
  content: string | React.ReactNode;
  height: number;
  width: number;
  x: number;
  y: number;
}

export type HeaderStateItem = Omit<
  HeaderProps,
  "updateAttributes" | "selected"
>;

interface WorkspaceContextType {
  items: ItemsProps[];
  setItems: React.Dispatch<SetStateAction<ItemsProps[]>>;
  deleteItem: (id: number) => void;
  headers: HeaderStateItem[];
  setHeaders: React.Dispatch<SetStateAction<HeaderStateItem[]>>;
  count: number;
  activeHeaderIdx: number | null;
  scrollToHeader: (idx: number) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

/* eslint-disable react-refresh/only-export-components */

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<ItemsProps[]>([]);
  const [headers, setHeaders] = useState<HeaderStateItem[]>([]);
  const [activeHeaderIdx, setActiveHeaderIdx] = useState<number | null>(null);

  const count = headers.length - 1;

  const deleteItem = (id: number) => {
    setItems((prevItems) => {
      // 1. Force strict numerical evaluation to eliminate type mismatch bugs
      const filtered = prevItems.filter(
        (item) => Number(item.id) !== Number(id),
      );

      return filtered;
    });
  };

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
        setTimeout(() => {
          innerInput.focus();
        }, 300);
        setActiveHeaderIdx(idx);
      }
    } else {
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

  useEffect(() => {
    if (headers.length === 0) {
      const resetTimer = setTimeout(() => {
        setActiveHeaderIdx(null);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const scrollContainer = document.querySelector(
      '[data-id="main-scroll-viewport"]',
    );

    const observerOptions = {
      root: scrollContainer,
      rootMargin: "-15% 0px -60% 0px",
      threshold: 0,
    };

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

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error(
      "useWorkspace must be used inside a WorkspaceProvider block",
    );
  }
  return context;
};
