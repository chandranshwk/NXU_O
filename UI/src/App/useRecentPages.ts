import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export interface RecentPage {
  url: string;
  visitedAt: number;
}

const STORAGE_KEY = "nxuo_recent_pages";
const MAX_ENTRIES = 10;

const load = (): RecentPage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (p): p is RecentPage =>
          typeof p === "object" &&
          p !== null &&
          typeof (p as RecentPage).url === "string" &&
          typeof (p as RecentPage).visitedAt === "number",
      )
      .slice(0, MAX_ENTRIES);
  } catch {
    return [];
  }
};

const persist = (pages: RecentPage[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pages));
  } catch {
    /* localStorage unavailable — silently skip */
  }
};

export const useRecentPages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [pages, setPages] = useState<RecentPage[]>(load);

  const currentUrl = location.pathname + location.search;

  // Log every visit. Dedupe by URL — revisit moves to front.
  useEffect(() => {
    setTimeout(() => {
      setPages((prev) => {
        const filtered = prev.filter((p) => p.url !== currentUrl);
        const next: RecentPage[] = [
          { url: currentUrl, visitedAt: Date.now() },
          ...filtered,
        ].slice(0, MAX_ENTRIES);
        persist(next);
        return next;
      });
    }, 10);
  }, [currentUrl]);

  // Hide the current page — clicking it would be a no-op
  const recent = pages.filter((p) => p.url !== currentUrl);

  const clear = useCallback(() => {
    setPages([]);
    persist([]);
  }, []);

  return {
    recent,
    hasRecent: recent.length > 0,
    navigateTo: (url: string) => navigate(url),
    clear,
  };
};
