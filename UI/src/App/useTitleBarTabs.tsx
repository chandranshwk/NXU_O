/**
 * @file useTitleBarTabs.tsx
 * @description Encapsulates the title bar's tab list, tab navigation, tab
 * creation actions, and quick page links.
 */

import { useCallback, useMemo, useState } from "react";
import type { NavigateFunction } from "react-router-dom";
import { FiFileText, FiExternalLink } from "react-icons/fi";
import { LuNotepadText, LuCode } from "react-icons/lu";
import { useWorkspaceStore } from "../Store/store";
import type { MenuTab, AddAction } from "./TitleBar.WindowMenu";
import { MAX_TABS, PAGES, type NotebookStoreView } from "./titleBarUtils";

interface UseTitleBarTabsOptions {
  navigate: NavigateFunction;
  pathname: string;
  currentNotebookId: string | null;
}

interface UseTitleBarTabsResult {
  tabs: MenuTab[];
  addTab: (tab: MenuTab) => void;
  navigateToTab: (id: string) => void;
  closeTab: (id: string) => void;
  addCustomTab: (label: string, destination: string) => void;
  createActions: AddAction[];
  pageLinks: AddAction[];
}

export const useTitleBarTabs = ({
  navigate,
  pathname,
  currentNotebookId,
}: UseTitleBarTabsOptions): UseTitleBarTabsResult => {
  const [tabs, setTabs] = useState<MenuTab[]>([
    { id: "/", title: "Home", icon: PAGES[0].icon },
  ]);

  const addTab = useCallback((tab: MenuTab) => {
    setTabs((prev) =>
      prev.some((t) => t.id === tab.id) || prev.length >= MAX_TABS
        ? prev
        : [...prev, tab],
    );
  }, []);

  const addCustomTab = useCallback(
    (label: string, destination: string) => {
      addTab({
        id: `custom:${destination}`,
        title: label,
        icon: <FiExternalLink size={15} />,
      });
    },
    [addTab],
  );

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => prev.filter((t) => t.id !== id));
      if (id.startsWith("doc:")) {
        if (currentNotebookId === id.slice(4)) navigate("/");
      } else if (id === pathname) {
        navigate("/");
      }
    },
    [currentNotebookId, pathname, navigate],
  );

  const navigateToTab = useCallback(
    (id: string) => {
      if (id.startsWith("doc:")) {
        navigate(`/document/${id.slice(4)}`);
        return;
      }
      if (id.startsWith("custom:")) {
        const dest = id.slice(7);
        if (/^https?:\/\//i.test(dest)) {
          window.open(dest, "_blank", "noopener,noreferrer");
          return;
        }
        navigate(dest);
        return;
      }
      navigate(id);
    },
    [navigate],
  );

  const atLimit = tabs.length >= MAX_TABS;
  const limitHint = atLimit ? "Full" : undefined;

  const createActions = useMemo<AddAction[]>(
    () => [
      {
        id: "new-document",
        label: "New Document",
        icon: <FiFileText size={15} />,
        hint: limitHint,
        disabled: atLimit,
        onClick: () => {
          const store = useWorkspaceStore.getState() as NotebookStoreView;
          const created = store.addNotebook?.("Untitled Notebook");
          const id = created?.id ?? store.activeNotebook?.id;
          if (id) {
            addTab({
              id: `doc:${id}`,
              title: "Untitled Notebook",
              icon: <FiFileText size={15} />,
            });
          }
        },
      },
      {
        id: "new-note",
        label: "New Note",
        icon: <LuNotepadText size={15} />,
        hint: limitHint,
        disabled: atLimit,
        onClick: () => {
          addTab({
            id: "/scratchpad",
            title: "New Note",
            icon: <LuNotepadText size={15} />,
          });
        },
      },
      {
        id: "new-code",
        label: "New Code File",
        icon: <LuCode size={15} />,
        hint: limitHint,
        disabled: atLimit,
        onClick: () => {
          addTab({
            id: "/ide",
            title: "New Code File",
            icon: <LuCode size={15} />,
          });
        },
      },
    ],
    [atLimit, limitHint, addTab],
  );

  const pageLinks = useMemo<AddAction[]>(
    () =>
      PAGES.map((p) => ({
        id: p.key,
        label: p.label,
        icon: p.icon,
        disabled: atLimit && !tabs.some((t) => t.id === p.key),
        hint: atLimit && !tabs.some((t) => t.id === p.key) ? "Full" : undefined,
        onClick: () => {
          addTab({ id: p.key, title: p.label, icon: p.icon });
        },
      })),
    [atLimit, tabs, addTab],
  );

  return {
    tabs,
    addTab,
    navigateToTab,
    closeTab,
    addCustomTab,
    createActions,
    pageLinks,
  };
};
