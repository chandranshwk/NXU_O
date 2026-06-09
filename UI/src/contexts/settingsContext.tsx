import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type SetStateAction,
} from "react";
import { FONTS, ORDEREDLISTRESPRESENTER } from "../assets/assets";

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

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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
