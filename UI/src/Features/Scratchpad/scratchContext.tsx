/**
 * @file scratchContext.tsx
 * @component ScratchProvider
 * @description Central context provider managing file synchronization for scratchpads.
 * Implements a hybrid caching architecture using Tauri commands for native disk saves and
 * localStorage for tracking local auto-save tab drafts.
 *
 * @architecture
 * - Coordinates active workspaces via a unified `FileItem` structural schema map.
 * - Tracks file modifications by comparing current input updates with an initial text content baseline.
 * - Captures window keyboard triggers (`Ctrl/Cmd + S`) to intercept browser default routines and write data to disk.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import { invoke } from "@tauri-apps/api/core";

export interface FileItem {
  /** Clean string title identifying the scratchpad filename on disk */
  name: string;
  /** Active status flag tracking whether modifications match disk references */
  isSaved: boolean;
}

export interface scratchContextType {
  /** Active filename tracking token string currently loaded in viewports */
  name: string;
  setName: React.Dispatch<SetStateAction<string>>;
  /** Live rich-text document markup string parsed within editor canvases */
  info: string;
  setInfo: React.Dispatch<SetStateAction<string>>;
  /** Positional index pointing to the active focused tab node */
  activeSlot: number;
  setActiveSlot: React.Dispatch<SetStateAction<number>>;
  /** Loading flag masking canvas interfaces during background file read execution paths */
  loading: boolean;
  setLoading: React.Dispatch<SetStateAction<boolean>>;
  /** Real-time display label string feeding state feedback text notifications to toolbars */
  saveStatus: string;
  setSaveStatus: React.Dispatch<SetStateAction<string>>;
  /** Comprehensive directory list array housing all existing scratchpad records */
  allPads: FileItem[];
  setAllPads: React.Dispatch<SetStateAction<FileItem[]>>;
  /** Collection mapping tab rows actively opened in tabs across the bar */
  activeSlots: FileItem[];
  setActiveSlots: React.Dispatch<SetStateAction<FileItem[]>>;
  /** Commands file renames across both the Tauri filesystem layer and localStorage keys */
  handleRenamePage: (oldName: string, newName: string) => Promise<void>;
  /** Refreshes cached data arrays with fresh file lookups received from disk */
  refreshFiles: () => Promise<void>;
}

/* eslint-disable react-refresh/only-export-components */
export const ScratchContext = createContext<scratchContextType | null>(null);

/**
 * @component ScratchProvider
 * @description State layer parsing scratchpad text properties, orchestrating
 * local storage crash recovery, and routing file save parameters down to the Rust backend.
 */
export const ScratchProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [name, setName] = useState<string>("");
  const [info, setInfo] = useState<string>("");
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveStatus, setSaveStatus] = useState<string>("");

  const [allPads, setAllPads] = useState<FileItem[]>([]);
  const [activeSlots, setActiveSlots] = useState<FileItem[]>([]);

  /** Local browser caching macro namespace used to tag temporary auto-save draft blocks */
  const LOCAL_STORAGE_PREFIX = "noxuo_draft_";
  /** Remembers baseline string markup snapshots on load to evaluate modification deltas */
  const [initialContent, setInitialContent] = useState<string>("");
  /** Lock flag tracking active layout transitions to shield context data during tab switches */
  const isChangingTabRef = useRef<boolean>(false);

  // ==========================================
  // LIFECYCLE 1: HYDRATION & RECOVERY INITIALIZER
  // ==========================================
  /**
   * Universal Workspace Boot Pipeline: Fetches active directories from disk and cross-examines
   * localStorage. If local browser draft caches are located, it reconstructs unsaved tab slots
   * to protect against data loss following sudden window closures or application crashes.
   */
  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        const files = await invoke<string[]>("get_pages_files");
        const unsavedSlots: FileItem[] = [];

        files.forEach((fileName) => {
          const storageKey = `${LOCAL_STORAGE_PREFIX}${fileName}`;
          const cachedDraft = localStorage.getItem(storageKey);

          if (cachedDraft !== null) {
            unsavedSlots.push({ name: fileName, isSaved: false });
          }
        });

        setActiveSlots(unsavedSlots);
        setAllPads(
          files.map((fileName) => {
            const hasDraft = unsavedSlots.some((s) => s.name === fileName);
            return {
              name: fileName,
              isSaved: !hasDraft,
            };
          }),
        );
      } catch (error) {
        console.error("Failed to initialize workspace files:", error);
      }
    };

    initializeWorkspace();
  }, []);

  // ==========================================
  // LIFECYCLE 2: SYNC REFRESH CONTROLLER
  // ==========================================
  /** Pulls fresh file lists from disk while preserving active unsaved layout modifications */
  const refreshFiles = async () => {
    try {
      const files = await invoke<string[]>("get_pages_files");

      setAllPads((prevPads) => {
        return files.map((fileName) => {
          const existing = prevPads.find((p) => p.name === fileName);
          return {
            name: fileName,
            isSaved: existing ? existing.isSaved : true,
          };
        });
      });
    } catch (error) {
      console.error("Failed to fetch pages files from Rust:", error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      refreshFiles();
    }, 0);
  }, []);

  // ==========================================
  // BACKEND DISPATCH: ATOMIC PAGE RENAME
  // ==========================================
  /** Commands page name mutations across Tauri filesystems and re-aligns localStorage cache keys */
  async function handleRenamePage(oldName: string, newName: string) {
    try {
      await invoke("rename_file", {
        oldFilename: oldName,
        newFilename: newName,
      });

      const oldStorageKey = `${LOCAL_STORAGE_PREFIX}${oldName}`;
      const newStorageKey = `${LOCAL_STORAGE_PREFIX}${newName}`;
      const unsavedContent = localStorage.getItem(oldStorageKey);

      if (unsavedContent !== null) {
        localStorage.setItem(newStorageKey, unsavedContent);
        localStorage.removeItem(oldStorageKey);
      }

      const updatedSlots = activeSlots.map((slot) =>
        slot.name === oldName ? { ...slot, name: newName } : slot,
      );
      setActiveSlots(updatedSlots);

      if (name === oldName) {
        setName(newName);
      }

      await refreshFiles();
      console.log("File renamed successfully!");
    } catch (error) {
      console.error("Failed to rename file:", error);
    }
  }

  // ==========================================
  // INTERACTION: TAB FOCUS CONTEXT LOADER
  // ==========================================
  /** Loads text parameters from disk or local draft caches upon changing active tabs */
  useEffect(() => {
    async function getInfo() {
      const currentSlotObj = activeSlots[activeSlot];
      if (!currentSlotObj) return;

      const currentTabName = activeSlots[activeSlot].name;

      setLoading(true);
      setSaveStatus("");
      isChangingTabRef.current = true;

      try {
        const data = await invoke<string>("load_info", {
          filename: `${currentTabName}.md`,
        });

        const cachedDraft = localStorage.getItem(
          `${LOCAL_STORAGE_PREFIX}${currentTabName}`,
        );
        if (cachedDraft !== null) {
          setInfo(cachedDraft);
        } else {
          setInfo(data);
        }
        setInitialContent(data);
        setName(currentTabName);
      } catch (error) {
        console.log("ERROR ENCOUNTERED ", error);
      } finally {
        setLoading(false);
        // Delay resetting the transition lock ref slightly to allow document states to fully settle
        setTimeout(() => {
          isChangingTabRef.current = false;
        }, 50);
      }
    }

    getInfo();
  }, [activeSlot, activeSlots]);

  // ==========================================
  // AUTOMATED AUTO-SAVE LOCALSTORAGE INTERCEPT
  // ==========================================
  /** Automatically shadows current unsaved inputs to local browser cache keys on text updates */
  useEffect(() => {
    const currentSlotObj = activeSlots[activeSlot];
    if (!currentSlotObj || isChangingTabRef.current || loading) return;

    const currentTabName = activeSlots[activeSlot].name;
    const isTextModified = info !== initialContent;

    setAllPads((prevPads) =>
      prevPads.map((pad) =>
        pad.name === currentTabName
          ? { ...pad, isSaved: !isTextModified }
          : pad,
      ),
    );

    const storageKey = `${LOCAL_STORAGE_PREFIX}${currentTabName}`;
    if (isTextModified) {
      localStorage.setItem(storageKey, info);
    } else {
      localStorage.removeItem(storageKey);
    }
  }, [info, activeSlot, activeSlots, initialContent, loading]);

  // ==========================================
  // KEYSTROKE INTERCEPT: MANUAL SAVE (Ctrl+S)
  // ==========================================
  /** Captures hardware keyboard inputs to bypass default browser operations and commit file records */
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();

        const currentSlotObj = activeSlots[activeSlot];
        if (!currentSlotObj) return;

        const currentTabName = activeSlots[activeSlot].name;

        try {
          setSaveStatus("Saving...");

          await invoke("save_info", {
            filename: `${currentTabName}.md`,
            contents: info,
          });

          setSaveStatus("Saved!");
          setInitialContent(info); // Reset original reference value baseline to current layout snapshot

          // Instantly switch this pad's target visual layout model item to true
          setAllPads((prev) =>
            prev.map((pad) =>
              pad.name === currentTabName ? { ...pad, isSaved: true } : pad,
            ),
          );

          localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${currentTabName}`);

          await refreshFiles();

          const timer = setTimeout(() => {
            setSaveStatus("");
          }, 2000);

          return () => clearTimeout(timer);
        } catch (error) {
          console.error("Failed to save note:", error);
          setSaveStatus("Save failed!");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [info, activeSlot, activeSlots]);

  /** Package local state parameters into a single unified context communications map object */
  const scratchContextValue: scratchContextType = {
    name,
    info,
    setName,
    setInfo,
    activeSlot,
    setActiveSlot,
    loading,
    setLoading,
    saveStatus,
    setSaveStatus,
    allPads,
    setAllPads,
    activeSlots,
    setActiveSlots,
    handleRenamePage,
    refreshFiles,
  };

  return (
    <ScratchContext.Provider value={scratchContextValue}>
      {children}
    </ScratchContext.Provider>
  );
};

/**
 * @hook useScratchContext
 * @description Direct hook used to pull active draft records, slot indicators,
 * tab mutation utilities, and save statuses down to sub-component rows.
 */
export const useScratchContext = () => {
  const context = useContext(ScratchContext);
  if (!context) {
    throw new Error(
      "useScratchContext must be executed inside a valid <ScratchProvider>",
    );
  }
  return context;
};
