/**
 * @file NewDocument.tsx
 * @component NewDocument
 * @description Notebook document editor. Handles the left page rail,
 * adding/renaming pages, zen mode, and mounting the workspace.
 *
 * @architecture
 * - Manages document sync using `useNotebookStore`.
 * - Reads the active page from URL query (`?page=...`).
 * - Left rail is `<PageRail />`; workspace is `<RightSideDocument />`.
 */

import { useEffect } from "react";
import {
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { EditorProvider } from "../contexts/editorContext";
import { ScratchProvider } from "../contexts/scratchContext";
import Toolbar from "./Document/Toolbar";
import type { MockPage } from "../assets/SAMPLE";
import { useNotebookStore } from "../Store/store";
import { RightSideDocument } from "../components/RightSideDocument";
import { useSettings } from "../contexts/settingsContext";
import { PageRail } from "./PageRail";

// ── Shortcut helpers ─────────────────────────────────────────────
// Tokens in `zenModeShortcut` are dash-separated, e.g. "mod-shift-k".
// Recognized modifier aliases (case-insensitive):
//   mod / cmd / meta / win   → platform primary (⌘ on Mac, Ctrl elsewhere)
//   ctrl / control           → Ctrl
//   shift                    → Shift
//   alt / option             → Alt
// The first non-modifier token is treated as the primary key.
const MODIFIER_TOKENS = new Set([
  "mod",
  "cmd",
  "meta",
  "win",
  "ctrl",
  "control",
  "shift",
  "alt",
  "option",
]);

interface ParsedShortcut {
  primaryKey: string;
  needsMod: boolean;
  needsCtrl: boolean;
  needsShift: boolean;
  needsAlt: boolean;
  /** True when the shortcut explicitly wants cmd/win/meta distinct from ctrl. */
  modIsMetaOnly: boolean;
}

const parseShortcut = (
  raw: string | undefined | null,
): ParsedShortcut | null => {
  if (!raw) return null;

  const tokens = raw
    .toLowerCase()
    .split("-")
    .map((t) => t.trim())
    .filter(Boolean);

  if (tokens.length === 0) return null;

  const primaryKey = tokens.find((t) => !MODIFIER_TOKENS.has(t));
  if (!primaryKey) return null;

  return {
    primaryKey,
    needsMod: tokens.includes("mod"),
    needsCtrl: tokens.includes("ctrl") || tokens.includes("control"),
    needsShift: tokens.includes("shift"),
    needsAlt: tokens.includes("alt") || tokens.includes("option"),
    modIsMetaOnly:
      tokens.includes("cmd") ||
      tokens.includes("meta") ||
      tokens.includes("win"),
  };
};

const isEditableTarget = (el: EventTarget | null): boolean => {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
};

const NewDocumentContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const targetPageId = searchParams.get("page");

  const navigate = useNavigate();
  const settings = useSettings();

  // ── Store selectors ──────────────────────────────────────────
  const activeNotebook = useNotebookStore((s) => s.activeNotebook);
  const setActiveNotebookById = useNotebookStore(
    (s) => s.setActiveNotebookById,
  );
  const initializeData = useNotebookStore((s) => s.initializeData);

  // ==========================================
  // LIFECYCLE 1: NOTEBOOK LOADER CORE
  // ==========================================
  useEffect(() => {
    initializeData();

    const store = useNotebookStore.getState();
    if (store.notebooks.length === 0) return;

    const match = id ? store.notebooks.find((n) => n.id === id) : undefined;

    if (match) {
      if (store.activeNotebook?.id !== match.id) {
        setActiveNotebookById(match.id);
      }
      return;
    }

    // URL id stale or missing — fall back to the first notebook.
    const fallback = store.notebooks[0];
    if (store.activeNotebook?.id !== fallback.id) {
      setActiveNotebookById(fallback.id);
    }
    if (id !== fallback.id) {
      navigate(`/document/${fallback.id}`, { replace: true });
    }
  }, [id, initializeData, setActiveNotebookById, navigate]);

  // ==========================================
  // LIFECYCLE 2: ENSURE A VALID PAGE IS SELECTED
  // ==========================================
  /**
   * If the URL has no `?page=` (or the id doesn't exist in the notebook),
   * redirect to the first page. Keeps the URL and the store consistent.
   */
  useEffect(() => {
    if (!activeNotebook) return;

    const pages = activeNotebook.pages;
    if (pages.length === 0) return;

    const pageExists = targetPageId
      ? pages.some((p) => p.id === targetPageId)
      : false;

    if (!pageExists) {
      navigate(`/document/${activeNotebook.id}?page=${pages[0].id}`, {
        replace: true,
      });
    }
  }, [activeNotebook, targetPageId, navigate]);

  useEffect(() => {
    const parsed = parseShortcut(settings.zenModeShortcut);
    if (!parsed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't hijack keystrokes while the user is typing.
      if (isEditableTarget(e.target)) return;

      const modKey = e.ctrlKey || e.metaKey;

      // If the shortcut names ctrl/shift/alt explicitly, require them; if it
      // names none, require their absence. `mod` is checked on top.
      const modOk = parsed.needsMod ? modKey : true;

      // If `cmd`/`win`/`meta` was named specifically, require meta and NOT
      // ctrl; otherwise the `needsCtrl` flag governs.
      const ctrlOk = parsed.modIsMetaOnly
        ? e.metaKey && !e.ctrlKey
        : parsed.needsCtrl
          ? e.ctrlKey
          : true;

      const shiftOk = parsed.needsShift ? e.shiftKey : !e.shiftKey;
      const altOk = parsed.needsAlt ? e.altKey : !e.altKey;

      const keyOk =
        e.key.toLowerCase() === parsed.primaryKey ||
        e.code.toLowerCase() === `key${parsed.primaryKey}`;

      if (modOk && ctrlOk && shiftOk && altOk && keyOk) {
        e.preventDefault();
        settings.setZenMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings]);

  // ==========================================
  // RENDER GUARD
  // ==========================================
  if (!activeNotebook) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-zinc-500 bg-zinc-950">
        Locating active workspace node…
      </div>
    );
  }

  const pages = activeNotebook.pages;
  const currentPage: MockPage | undefined =
    pages.find((p) => p.id === targetPageId) ?? pages[0];

  /** Navigate to a specific page within the current notebook. */
  const handleNavigation = (pageId: string) => {
    navigate(`/document/${activeNotebook.id}?page=${pageId}`);
  };

  /** Appends a blank page to the notebook and navigates to it. */
  const handleAddPage = () => {
    const { addPageToNotebook } = useNotebookStore.getState();
    addPageToNotebook(activeNotebook.id, "Untitled Page");

    // Re-read fresh state to grab the newly appended page.
    const refreshed = useNotebookStore.getState().activeNotebook;
    const newPage = refreshed?.pages.at(-1);
    if (newPage) handleNavigation(newPage.id);
  };

  return (
    <div
      className={`h-screen w-full flex flex-col overflow-hidden relative ${
        !darkMode ? "bg-white text-zinc-900" : "bg-[#18181b] text-zinc-100"
      }`}
    >
      <Toolbar />

      <div className="h-full w-full flex flex-1 overflow-hidden">
        <PageRail
          pages={pages.map((p: MockPage) => ({
            id: p.id,
            title: String(p.title ?? ""),
          }))}
          activePageId={currentPage?.id ?? null}
          onSelectPage={handleNavigation}
          onAddPage={handleAddPage}
          darkMode={darkMode}
        />

        <RightSideDocument
          darkMode={darkMode}
          activeNotebook={activeNotebook}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

/**
 * @component NewDocument
 * @description Context initialization wrapper.
 */
const NewDocument = () => {
  return (
    <EditorProvider>
      <ScratchProvider>
        <NewDocumentContent />
      </ScratchProvider>
    </EditorProvider>
  );
};

export default NewDocument;
