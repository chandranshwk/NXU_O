import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type SetStateAction,
} from "react";
import { invoke } from "@tauri-apps/api/core";

export interface scratchContextType {
  name: string;
  setName: React.Dispatch<SetStateAction<string>>;
  info: string;
  setInfo: React.Dispatch<SetStateAction<string>>;
  activeSlot: number;
  setActiveSlot: React.Dispatch<SetStateAction<number>>;
  loading: boolean;
  setLoading: React.Dispatch<SetStateAction<boolean>>;
  saveStatus: string; // 1. Added save status string field
  setSaveStatus: React.Dispatch<SetStateAction<string>>;
  allPads: string[];
  setAllPads: React.Dispatch<SetStateAction<string[]>>;
  activeSlots: string[];
  setActiveSlots: React.Dispatch<SetStateAction<string[]>>;
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
  const [saveStatus, setSaveStatus] = useState<string>(""); // 2. Track current saving state message

  const [allPads, setAllPads] = useState<string[]>([
    "Scratch 1",
    "Scratch 2",
    "Scratch 3",
    "Scratch 4",
    "Scratch 5",
    "Scratch 6",
  ]);

  const [activeSlots, setActiveSlots] = useState<string[]>([
    "Scratch 1",
    "Scratch 2",
    "Scratch 3",
  ]);

  const scratchContextValue: scratchContextType = {
    name,
    info,
    setName,
    setInfo,
    activeSlot,
    setActiveSlot,
    loading,
    setLoading,
    saveStatus, // 3. Expose save status fields to your downstream consumers
    setSaveStatus,
    allPads,
    setAllPads,
    activeSlots,
    setActiveSlots,
  };

  useEffect(() => {
    async function getInfo() {
      const currentTabName = activeSlots[activeSlot];
      if (!currentTabName) return;

      setLoading(true);
      setSaveStatus(""); // Reset save text when shifting tabs
      try {
        const data = await invoke<string>("load_info", {
          filename: `${currentTabName}.md`,
        });

        setInfo(data);
        setName(currentTabName);
      } catch (error) {
        console.log("ERROR ENCOUNTERED ", error);
      } finally {
        setLoading(false);
      }
    }

    getInfo();
  }, [activeSlot, activeSlots]);

  // Handle Ctrl+S actions with a visual state response
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();

        const currentTabName = activeSlots[activeSlot];
        if (!currentTabName) return;

        try {
          // 4. Set status to "Saving..." instantly upon keypress
          setSaveStatus("Saving...");

          await invoke("save_info", {
            filename: `${currentTabName}.md`,
            contents: info,
          });

          // 5. Switch to "Saved!" once the disk write succeeds
          setSaveStatus("Saved!");

          // 6. Automatically clear the indicator after 2 seconds
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
