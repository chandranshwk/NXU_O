import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  type SetStateAction,
} from "react";
import { FONTS, ORDEREDLISTRESPRESENTER } from "../assets/assets";
import { invoke } from "@tauri-apps/api/core";

export interface settingsContextType {
  defaultFontSize: string;
  setDefaultFontSize: React.Dispatch<SetStateAction<string>>;
  defaultStrikeThroughShortcut: string;
  setDefaultStrikeThroughShortcut: React.Dispatch<SetStateAction<string>>;
  defaultSavingFolder: string;
  setDefaultSavingFolder: React.Dispatch<SetStateAction<string>>;
  defaultFont: string;
  setDefaultFont: React.Dispatch<SetStateAction<string>>;
  lineHeight: number;
  setLineHeight: React.Dispatch<SetStateAction<number>>;
  saveTimer: number;
  setSaveTimer: React.Dispatch<SetStateAction<number>>;
  openShortcut: string;
  setOpenShortcut: React.Dispatch<SetStateAction<string>>;
  defaultOLRepresenter: string;
  setDefaultOLRepresenter: React.Dispatch<SetStateAction<string>>;
  defaultColor: string;
  setDefaultColor: React.Dispatch<SetStateAction<string>>;
  darkMode: boolean;
  setDarkMode: React.Dispatch<SetStateAction<boolean>>;
  notesViewShortcut: string;
  setNotesViewShortcut: React.Dispatch<SetStateAction<string>>;
  folderExplorerShortcut: string;
  setFolderExplorerShortcut: React.Dispatch<SetStateAction<string>>;
  scratchpadOpenShortcut: string;
  setScratchpadOpenShortcut: React.Dispatch<SetStateAction<string>>;
  openCommandBarKeys: string;
  setOpenCommandBarKeys: React.Dispatch<SetStateAction<string>>;
  systemView: string;
  setSystemView: React.Dispatch<SetStateAction<string>>;
}
/* eslint-disable react-refresh/only-export-components */
export const SettingsContext = createContext<settingsContextType | null>(null);

interface settings {
  systemView: string;
  defaultFontSize: string;
  defaultFont: string;
  lineHeight: number;
  saveTimer: number;
  notesViewShortcut: string;
  openCommandBarKeys: string;
  folderExplorerShortcut: string;
  scratchpadOpenShortcut: string;
  defaultOLRepresenter: string;
  defaultColor: string;
  defaultStrikeThroughShortcut: string;
  openShortcut: string;
  defaultSavingFolder: string;
}

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isHydrated = useRef<boolean>(false);

  const [systemView, setSystemView] = useState<string>("Dark Mode");

  const isDarkMode =
    systemView === "Dark Mode" ||
    (systemView === "System-Settings" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [darkMode, setDarkMode] = useState<boolean>(isDarkMode);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDarkMode(isDarkMode);
  }, [systemView, isDarkMode]);

  useEffect(() => {
    if (systemView !== "System-Settings") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches); // Syncs state immediately when OS theme changes
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [systemView]);

  const [defaultFontSize, setDefaultFontSize] = useState<string>("12px");
  const [defaultFont, setDefaultFont] = useState<string>(FONTS[0]);
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [saveTimer, setSaveTimer] = useState<number>(1);
  const [notesViewShortcut, setNotesViewShortcut] = useState<string>("Mod-N");
  const [openCommandBarKeys, setOpenCommandBarKeys] = useState<string>("Mod-K");

  const [folderExplorerShortcut, setFolderExplorerShortcut] =
    useState<string>("Mod-F");
  const [scratchpadOpenShortcut, setScratchpadOpenShortcut] =
    useState<string>("Mod-Shift-S");
  const [defaultOLRepresenter, setDefaultOLRepresenter] = useState(
    ORDEREDLISTRESPRESENTER[0],
  );
  const [defaultColor, setDefaultColor] = useState("");
  const [defaultStrikeThroughShortcut, setDefaultStrikeThroughShortcut] =
    useState<string>("Mod-Shift-x");

  const [openShortcut, setOpenShortcut] = useState<string>("Mod-Alt-C");
  const [defaultSavingFolder, setDefaultSavingFolder] =
    useState<string>("C:\\Desktop");

  useEffect(() => {
    async function loadSettings() {
      try {
        const savedData = await invoke<settings>("load_portable_settings", {
          filename: "settings.json",
        });

        if (savedData && savedData !== null) {
          if (savedData.systemView !== undefined)
            setSystemView(savedData.systemView);
          if (savedData.defaultFontSize !== undefined)
            setDefaultFontSize(savedData.defaultFontSize);

          if (savedData.defaultFont) {
            setDefaultFont(savedData.defaultFont);
          } else {
            setDefaultFont(FONTS[0]);
          }

          if (savedData.lineHeight !== undefined)
            setLineHeight(Number(savedData.lineHeight));
          if (savedData.saveTimer !== undefined)
            setSaveTimer(Number(savedData.saveTimer));
          if (savedData.notesViewShortcut !== undefined)
            setNotesViewShortcut(savedData.notesViewShortcut);
          if (savedData.openCommandBarKeys !== undefined)
            setOpenCommandBarKeys(savedData.openCommandBarKeys);
          if (savedData.folderExplorerShortcut !== undefined)
            setFolderExplorerShortcut(savedData.folderExplorerShortcut);
          if (savedData.scratchpadOpenShortcut !== undefined)
            setScratchpadOpenShortcut(savedData.scratchpadOpenShortcut);

          if (savedData.defaultOLRepresenter) {
            setDefaultOLRepresenter(savedData.defaultOLRepresenter);
          } else {
            setDefaultOLRepresenter(ORDEREDLISTRESPRESENTER[0]);
          }

          if (savedData.defaultColor !== undefined)
            setDefaultColor(savedData.defaultColor);
          if (savedData.defaultStrikeThroughShortcut !== undefined)
            setDefaultStrikeThroughShortcut(
              savedData.defaultStrikeThroughShortcut,
            );
          if (savedData.openShortcut !== undefined)
            setOpenShortcut(savedData.openShortcut);
          if (savedData.defaultSavingFolder !== undefined)
            setDefaultSavingFolder(savedData.defaultSavingFolder);
        }
      } catch (error) {
        console.error("Failed to fetch settings from Rust file:", error);
      } finally {
        // Lower shield and release the view
        isHydrated.current = true;
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isHydrated.current) return;
    const dataToSave = {
      systemView,
      defaultFontSize,
      defaultFont,
      lineHeight,
      saveTimer,
      notesViewShortcut,
      openCommandBarKeys,
      folderExplorerShortcut,
      scratchpadOpenShortcut,
      defaultOLRepresenter,
      defaultColor,
      defaultStrikeThroughShortcut,
      openShortcut,
      defaultSavingFolder,
    };

    const delayDebounceFn = setTimeout(() => {
      async function saveFile() {
        try {
          // Call the Rust command, passing only the file name and the JSON string
          await invoke("save_portable_settings", {
            filename: "settings.json",
            contents: JSON.stringify(dataToSave, null, 2),
          });
        } catch (error) {
          console.error("Portable save failed:", error);
        }
      }
      saveFile();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [
    systemView,
    defaultFontSize,
    defaultFont,
    lineHeight,
    saveTimer,
    notesViewShortcut,
    openCommandBarKeys,
    folderExplorerShortcut,
    scratchpadOpenShortcut,
    defaultOLRepresenter,
    defaultColor,
    defaultStrikeThroughShortcut,
    openShortcut,
    defaultSavingFolder,
  ]);

  if (isLoading) {
    return <div style={{ background: "#1a1a1a", height: "100vh" }} />; // Or a spinner matching your app theme
  }

  const settingContextValue: settingsContextType = {
    defaultFontSize,
    setDefaultFontSize,
    defaultStrikeThroughShortcut,
    setDefaultStrikeThroughShortcut,
    defaultSavingFolder,
    setDefaultSavingFolder,
    defaultColor,
    setDefaultColor,
    defaultFont,
    setDefaultFont,
    lineHeight,
    setLineHeight,
    saveTimer,
    setSaveTimer,
    openShortcut,
    setOpenShortcut,
    defaultOLRepresenter,
    setDefaultOLRepresenter,
    darkMode,
    setDarkMode,
    notesViewShortcut,
    setNotesViewShortcut,
    folderExplorerShortcut,
    setFolderExplorerShortcut,
    scratchpadOpenShortcut,
    setScratchpadOpenShortcut,
    openCommandBarKeys,
    setOpenCommandBarKeys,
    systemView,
    setSystemView,
  };

  return (
    <SettingsContext.Provider value={settingContextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettings must be executed inside a valid <SettingsProvider>",
    );
  }
  return context;
};
