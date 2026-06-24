import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import { invoke } from "@tauri-apps/api/core";

// 1. Structural item interface definition
export interface FileItem {
  name: string;
  isSaved: boolean;
}

export interface scratchContextType {
  name: string;
  setName: React.Dispatch<SetStateAction<string>>;
  info: string;
  setInfo: React.Dispatch<SetStateAction<string>>;
  activeSlot: number;
  setActiveSlot: React.Dispatch<SetStateAction<number>>;
  loading: boolean;
  setLoading: React.Dispatch<SetStateAction<boolean>>;
  saveStatus: string;
  setSaveStatus: React.Dispatch<SetStateAction<string>>;
  allPads: FileItem[];
  setAllPads: React.Dispatch<SetStateAction<FileItem[]>>;
  activeSlots: FileItem[];
  setActiveSlots: React.Dispatch<SetStateAction<FileItem[]>>;
  handleRenamePage: (oldName: string, newName: string) => Promise<void>;
  refreshFiles: () => Promise<void>;
}

/* eslint-disable react-refresh/only-export-components */
export const ScratchContext = createContext<scratchContextType | null>(null);

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

  // Track initial content load to prevent flagging fresh tabs as modified immediately
  const LOCAL_STORAGE_PREFIX = "noxuo_draft_";
  const [initialContent, setInitialContent] = useState<string>("");
  const isChangingTabRef = useRef<boolean>(false);

  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        // 1. Fetch all existing pages file strings from the Rust backend disk
        const files = await invoke<string[]>("get_pages_files");

        // 2. Scan localStorage to compile a list of tabs that have unsaved drafts
        const unsavedSlots: FileItem[] = [];

        files.forEach((fileName) => {
          const storageKey = `${LOCAL_STORAGE_PREFIX}${fileName}`;
          const cachedDraft = localStorage.getItem(storageKey);

          // If a draft exists in browser memory, it is unsaved!
          if (cachedDraft !== null) {
            unsavedSlots.push({ name: fileName, isSaved: false });
          }
        });

        // 3. Populate your tab layout using ONLY the unsaved files discovered
        setActiveSlots(unsavedSlots);

        // 4. Update your global tracking array cache smoothly
        setAllPads(
          files.map((fileName) => {
            const hasDraft = unsavedSlots.some((s) => s.name === fileName);
            return {
              name: fileName,
              isSaved: !hasDraft, // It is clean if it doesn't have an active draft key
            };
          }),
        );
      } catch (error) {
        console.error("Failed to initialize workspace files:", error);
      }
    };

    initializeWorkspace();
  }, []);

  const refreshFiles = async () => {
    try {
      const files = await invoke<string[]>("get_pages_files");

      // Keep track of existing unsaved changes when refreshing files from disk
      setAllPads((prevPads) => {
        return files.map((fileName) => {
          const existing = prevPads.find((p) => p.name === fileName);
          return {
            name: fileName,
            isSaved: existing ? existing.isSaved : true, // Retain unsaved state if present
          };
        });
      });
    } catch (error) {
      console.error("Failed to fetch pages files from Rust:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshFiles();
  }, []);

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

  // Fetch disk data on active slot transitions
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
        setTimeout(() => {
          isChangingTabRef.current = false;
        }, 50);
      }
    }

    getInfo();
  }, [activeSlot, activeSlots]);

  useEffect(() => {
    const currentSlotObj = activeSlots[activeSlot];
    if (!currentSlotObj || isChangingTabRef.current || loading) return;

    const currentTabName = activeSlots[activeSlot].name;

    // If the text matches what's on the disk, it remains clean (Saved)
    const isTextModified = info !== initialContent;
    setAllPads((prevPads) =>
      prevPads.map((pad) =>
        pad.name === currentTabName
          ? { ...pad, isSaved: !isTextModified } // Flips state based on change verification
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

  // Handle Ctrl+S disk write executions
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

export const useScratchContext = () => {
  const context = useContext(ScratchContext);
  if (!context) {
    throw new Error(
      "useScratchContext must be executed inside a valid <ScratchProvider>",
    );
  }
  return context;
};
