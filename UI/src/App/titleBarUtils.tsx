/**
 * @file titleBarUtils.tsx
 * @description Pure helpers, constants, and type definitions consumed by TitleBar.
 * No React state, no effects — safe to import from anywhere.
 */

import { FiSettings } from "react-icons/fi";
import { RiHomeLine } from "react-icons/ri";
import { LuNotepadText, LuCode } from "react-icons/lu";
import { GrNodes } from "react-icons/gr";
import type { Folder, MockNotebook } from "../assets/SAMPLE";
import type { CodeFile } from "../Pages/CodeIDE.SAMPLE";
import type { SearchItems } from "./SearchDrop";

export const MAX_TABS = 8;

export const PAGES = [
  { key: "/", icon: <RiHomeLine size={16} />, label: "Home", link: "/" },
  {
    key: "/scratchpad",
    icon: <LuNotepadText size={16} />,
    label: "Scratch Pad",
    link: "/scratchpad",
  },
  { key: "/ide", icon: <LuCode size={16} />, label: "Code IDE", link: "/ide" },
  {
    key: "/graph",
    icon: <GrNodes size={16} />,
    label: "Graph View",
    link: "/graph",
  },
  {
    key: "/settings",
    icon: <FiSettings size={15} />,
    label: "Settings",
    link: "/settings",
  },
] as const;

/** Shape we expect from the store — `addNotebook` is optional until declared. */
export type NotebookStoreView = ReturnType<
  typeof import("../Store/store").useWorkspaceStore.getState
> & {
  addNotebook?: (title: string) => { id: string } | undefined;
};

/**
 * Resolve the display title for the title bar from the current pathname.
 */
export const getTitleText = (
  pathname: string,
  notebooks: MockNotebook[],
  folders: Folder[],
): string => {
  if (pathname === "/") return "Home Panel";
  const parts = pathname.split("/");
  const rawPath = parts[1] !== "document" ? parts[1] : parts[2];
  if (!rawPath) return "Home Panel";

  const formattedPath = rawPath.charAt(0).toUpperCase() + rawPath.slice(1);

  if (pathname.startsWith("/document/")) {
    const docId = parts[2];
    const docTitle = notebooks.find((n) => n.id === docId)?.title;
    return docTitle && docTitle !== "" ? docTitle : "Untitled Notebook";
  }

  if (pathname.startsWith("/folder/")) {
    const folderId = parts[2];
    const folderTitle = folders.find((f) => f.id === folderId)?.title;
    return folderTitle && folderTitle !== "" ? folderTitle : "Untitled Folder";
  }

  switch (formattedPath.toLowerCase()) {
    case "settings":
      return "Settings Panel";
    case "graph":
      return "Graph View";
    case "scratchpad":
      return "Scratchpad Editor";
    default:
      return formattedPath;
  }
};

/** Filter items by query — shared by every search scope. */
export const filterByQuery = (
  items: SearchItems[],
  query: string,
): SearchItems[] => {
  const q = query.toLowerCase().trim();
  if (q === "") return items;
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q),
  );
};

/** Pick the search scope from the current pathname. */
export const pickSearchScope = (
  pathname: string,
): "pages" | "settings" | "notes" | "folder" | "none" => {
  if (pathname.startsWith("/folder")) return "folder";
  if (pathname.startsWith("/document")) return "pages";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/")) return "notes";
  return "none";
};

/** Compute the remaining part of a predictive suggestion. */
export const computePredictiveResult = (
  items: SearchItems[],
  activeIndex: number,
  query: string,
): string => {
  if (items.length === 0 || !items[activeIndex]) return "";
  const name = items[activeIndex].name;
  const q = query.toLowerCase().trim();
  if (q && name.toLowerCase().includes(q)) {
    const matchIndex = name.toLowerCase().indexOf(q);
    return name.slice(matchIndex + q.length);
  }
  return "";
};

// ── Type guards ───────────────────────────────────────────────────
// Shared between search and the folder view.
export const isNotebook = (
  item: CodeFile | MockNotebook,
): item is MockNotebook => "pages" in item && "events" in item;

export const isCodeFile = (item: CodeFile | MockNotebook): item is CodeFile =>
  "titleSlug" in item && "examples" in item;
