/**
 * @file NewDocument.tsx
 * @component NewDocument
 * @description Notebook document editor. Handles the left page rail,
 * adding/renaming pages, zen mode, and mounting the workspace.
 *
 * @architecture
 * - Manages document sync using `useWorkspaceStore`.
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
import { useWorkspaceStore } from "../Store/store";
import { RightSideDocument } from "../components/RightSideDocument";
import { useSettings } from "../contexts/settingsContext";
import { PageRail } from "./PageRail";
import { useTourAutoStart } from "../Hooks/useTourAutoStart";
import { NOTEBOOK_STEPS } from "../tours/pageTours";

// ── Shortcut helpers ─────────────────────────────────────────────
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
  const activeNotebook = useWorkspaceStore((s) => s.activeNotebook);
  const setActiveNotebookById = useWorkspaceStore(
    (s) => s.setActiveNotebookById,
  );
  const initializeData = useWorkspaceStore((s) => s.initializeData);

  // ── HOOK MOVED HERE (must be before any early return, and after
  //    `activeNotebook` is in scope so `enabled` can reference it) ──
  useTourAutoStart({
    storageKey: "nxuo-tour-notebook-v1",
    steps: NOTEBOOK_STEPS,
    enabled: !!activeNotebook,
  });

  // ==========================================
  // LIFECYCLE 1: NOTEBOOK LOADER CORE
  // ==========================================
  useEffect(() => {
    initializeData();

    const store = useWorkspaceStore.getState();
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

  // ==========================================
  // LIFECYCLE 3: ZEN MODE SHORTCUT
  // ==========================================
  useEffect(() => {
    const parsed = parseShortcut(settings.zenModeShortcut);
    if (!parsed) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;

      const modKey = e.ctrlKey || e.metaKey;
      const modOk = parsed.needsMod ? modKey : true;

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

  const handleNavigation = (pageId: string) => {
    navigate(`/document/${activeNotebook.id}?page=${pageId}`);
  };

  const handleAddPage = () => {
    const { addPageToNotebook } = useWorkspaceStore.getState();
    addPageToNotebook(activeNotebook.id, "Untitled Page");

    const refreshed = useWorkspaceStore.getState().activeNotebook;
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
        {/* data-tour wrapper around the left page rail */}
        <div data-tour="notebook-pagerail" className="h-full shrink-0 flex">
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
        </div>

        {/* data-tour wrapper around the canvas + right rail area.
            RightSideDocument's internal flex-1 keeps its layout intact. */}
        <div className="flex-1 min-w-0 h-full flex">
          <RightSideDocument
            darkMode={darkMode}
            activeNotebook={activeNotebook}
            currentPage={currentPage}
          />
        </div>
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
