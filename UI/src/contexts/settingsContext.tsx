/**
 * @file settingsContext.tsx (Snippet 1)
 * @description Central shared configuration state manager that controls app-wide preferences.
 * It manages hardware-level dark mode synchronization, debounced Rust backend persistence saves,
 * and hydrates system values on startup.
 *
 * @architecture
 * - Coordinates settings serialization parameters into atomic structured objects.
 * - Communicates directly with Tauri backend storage systems via `invoke("save_portable_settings")`.
 * - Uses matching media query event captures to track OS system color schemes in real time.
 */

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
  /** Baseline fallback typography font sizing metric layout rule */
  defaultFontSize: string;
  setDefaultFontSize: React.Dispatch<SetStateAction<string>>;
  /** Active keyboard hotkey token sequence used to strike line strings */
  defaultStrikeThroughShortcut: string;
  setDefaultStrikeThroughShortcut: React.Dispatch<SetStateAction<string>>;
  /** Root operating system directory path for saving project documents */
  defaultSavingFolder: string;
  setDefaultSavingFolder: React.Dispatch<SetStateAction<string>>;
  /** Active typeface family name string loaded on canvas load sequences */
  defaultFont: string;
  setDefaultFont: React.Dispatch<SetStateAction<string>>;
  /** Vertical line height leading multiplier across rich text blocks */
  lineHeight: number;
  setLineHeight: React.Dispatch<SetStateAction<number>>;
  /** Debounce timer setting seconds counts before background disk commits fire */
  saveTimer: number;
  setSaveTimer: React.Dispatch<SetStateAction<number>>;
  /** Global hotkey combination used to trigger the application window shell open */
  openShortcut: string;
  setOpenShortcut: React.Dispatch<SetStateAction<string>>;
  /** Prefix sequence symbol format loaded on numbered item blocks */
  defaultOLRepresenter: string;
  setDefaultOLRepresenter: React.Dispatch<SetStateAction<string>>;
  /** Base text color Hex parameter matching typography strings */
  defaultColor: string;
  setDefaultColor: React.Dispatch<SetStateAction<string>>;
  /** Shared dark mode setting flag used to switch app stylesheet variants */
  darkMode: boolean;
  setDarkMode: React.Dispatch<SetStateAction<boolean>>;
  /** Hotkey combination used to focus document notes navigation views */
  notesViewShortcut: string;
  setNotesViewShortcut: React.Dispatch<SetStateAction<string>>;
  /** Hotkey combination used to focus workspace directory panels */
  folderExplorerShortcut: string;
  setFolderExplorerShortcut: React.Dispatch<SetStateAction<string>>;
  /** Hotkey combination used to spawn scratchpad tab overlays */
  scratchpadOpenShortcut: string;
  setScratchpadOpenShortcut: React.Dispatch<SetStateAction<string>>;
  /** Hotkey combination used to focus desktop spotlight search overlays */
  openCommandBarKeys: string;
  setOpenCommandBarKeys: React.Dispatch<SetStateAction<string>>;
  /** String layout theme identifier rule ('Dark Mode' | 'Light Mode' | 'System-Settings') */
  systemView: string;
  setSystemView: React.Dispatch<SetStateAction<string>>;
  /** Hotkey combination used to shift nodes to text mode views */
  textModeShortcut: string;
  setTextModeShortcut: React.Dispatch<SetStateAction<string>>;
  /** Hotkey combination used to shift nodes to whiteboard canvas views */
  canvasModeShortcut: string;
  setCanvasModeShortcut: React.Dispatch<SetStateAction<string>>;
  /** Hotkey combination used to toggle zen distraction shielding layers */
  zenModeShortcut: string;
  setZenModeShortcut: React.Dispatch<SetStateAction<string>>;
  /** Activity flag tracking if zen layer mode remains focused */
  zenMode: boolean;
  setZenMode: React.Dispatch<SetStateAction<boolean>>;
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
  textModeShortcut: string;
  canvasModeShortcut: string;
  zenModeShortcut: string;
  zenMode: string;
}

/**
 * @component SettingsProvider
 * @description State layer parsing system preference arrays, syncing OS theme adjustments,
 * and implementing a debounced file persistence layer to prevent heavy write operations on disk.
 */
export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /** Hydration status indicator tracking when database loading finishes */
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /** Integrity lock preventing state updates from triggering premature empty saves on mount */
  const isHydrated = useRef<boolean>(false);

  const [systemView, setSystemView] = useState<string>("Dark Mode");

  /** Evaluation logic verifying if dark mode applies matching theme properties or system preferences */
  const isDarkMode =
    systemView === "Dark Mode" ||
    (systemView === "System-Settings" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const [darkMode, setDarkMode] = useState<boolean>(isDarkMode);

  // ==========================================
  // LIFECYCLE 1: INTERNAL THEME RESYNC
  // ==========================================
  /** Automatically updates theme flags whenever workspace style selectors adjust */
  useEffect(() => {
    setTimeout(() => {
      setDarkMode(isDarkMode);
    }, 0);
  }, [systemView, isDarkMode]);

  // ==========================================
  // LIFECYCLE 2: OS SYSTEM PREFERENCE LISTENER
  // ==========================================
  /** Binds native system hardware listener loops if System-Settings rule is selected */
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
  const [textModeShortcut, setTextModeShortcut] =
    useState<string>("Ctrl-Shift-Q");
  const [canvasModeShortcut, setCanvasModeShortcut] =
    useState<string>("Ctrl-Shift-C");

  const [zenModeShortcut, setZenModeShortcut] =
    useState<string>("Ctrl-Shift-Z");
  const [zenMode, setZenMode] = useState<boolean>(false);

  // ==========================================
  // LIFECYCLE 3: CONTRAST COLOR SELECTOR ALIGNER
  // ==========================================
  /** Adjusts global typography fallbacks to match dark or light surface elements */
  useEffect(() => {
    if (!darkMode)
      setTimeout(() => {
        setDefaultColor("#000000");
      }, 0);
    else
      setTimeout(() => {
        setDefaultColor("#ffffff");
      }, 0);
  }, [darkMode]);

  // ==========================================
  //BACKEND DISPATCH: DEBOUNCED CONFIG COMMIT
  // ==========================================
  /**
   * Automatically serializes config states on variable changes [31/08/2026].
   * Leverages a 500ms debounce loop buffer to group quick user inputs,
   * preventing multiple rapid write calls from locking the Rust file system.
   */
  useEffect(() => {
    if (!isHydrated.current) return;
    const dataToSave: settings = {
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
      textModeShortcut,
      canvasModeShortcut,
      zenModeShortcut,
      zenMode: zenMode ? "true" : "false",
    };

    const delayDebounceFn = setTimeout(() => {
      async function saveFile() {
        try {
          // Fire structural preference states down to Rust disk managers
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
    textModeShortcut,
    canvasModeShortcut,
    zenModeShortcut,
    zenMode,
  ]);

  // ==========================================
  // LIFECYCLE 4: STARTUP HYDRATION PIPELINE
  // ==========================================
  /** Invokes the native disk reader command immediately on mount to load properties */
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
          if (savedData.textModeShortcut !== undefined)
            setTextModeShortcut(savedData.textModeShortcut);
          if (savedData.canvasModeShortcut !== undefined)
            setCanvasModeShortcut(savedData.canvasModeShortcut);
          if (savedData.zenModeShortcut !== undefined)
            setZenModeShortcut(savedData.zenModeShortcut);
          if (savedData.zenMode !== undefined)
            setZenMode(savedData.zenMode === "true");
        }
      } catch (error) {
        console.error("Failed to fetch settings from Rust file:", error);
      } finally {
        // Lower the loading shield and release the UI view layers for rendering
        isHydrated.current = true;
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  // ==========================================
  // INTERCEPTOR: ZEN DISTRACTION SHIELD SHORTCUT
  // ==========================================
  /**
   * Universal Hotkey Capture Loop: Parses user shortcut tokens (e.g. "Ctrl-Shift-Z")
   * and matches raw hardware keystrokes to toggle the distraction shield state.
   */
  useEffect(() => {
    const handleCommands = (e: KeyboardEvent) => {
      // 1. Split the configurable shortcut sequence string into manageable array tokens
      const dynamicKeys = zenModeShortcut.toLowerCase().split("-");

      // 2. Map logical syntax flags against physical hardware events
      const requiresMod =
        dynamicKeys.includes("mod") || dynamicKeys.includes("ctrl");
      const requiresShift = dynamicKeys.includes("shift");
      const requiresAlt = dynamicKeys.includes("alt");

      // 3. Isolate the primary character action key out of modifier macros
      const primaryKeyToken = dynamicKeys.find(
        (token) =>
          !["mod", "ctrl", "shift", "alt", "win", "cmd"].includes(token),
      );

      // 4. Verify that physical hardware layouts completely match configurations
      const modMatch = requiresMod
        ? e.ctrlKey || e.metaKey
        : !(e.ctrlKey || e.metaKey);
      const shiftMatch = requiresShift ? e.shiftKey : !e.shiftKey;
      const altMatch = requiresAlt ? e.altKey : !e.altKey;

      const primaryKeyMatch = e.key.toLowerCase() === primaryKeyToken;

      // 5. Fire the toggle command only if every condition passes completely
      if (modMatch && shiftMatch && altMatch && primaryKeyMatch) {
        e.preventDefault();
        setZenMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleCommands);

    // Clean up event listener tracks on context mutations to clear event stacking leaks
    return () => window.removeEventListener("keydown", handleCommands);
  }, [zenModeShortcut]);

  // ==========================================
  // LOADING SURFACE MOUNT SHIELD GUARD
  // ==========================================
  if (isLoading) {
    // Keeps a clean background shield mounted to mask content layout adjustments during hydration loops
    return <div style={{ background: "#1a1a1a", height: "100vh" }} />;
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
    textModeShortcut,
    setTextModeShortcut,
    canvasModeShortcut,
    setCanvasModeShortcut,
    zenModeShortcut,
    setZenModeShortcut,
    zenMode,
    setZenMode,
  };

  return (
    <SettingsContext.Provider value={settingContextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * @hook useSettings
 * @description Global preference hook used to pull active key strings, font metrics,
 * save timers, and dark mode toggles down any sub-component layer.
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error(
      "useSettings must be executed inside a valid <SettingsProvider>",
    );
  }
  return context;
};
