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
 * - Wraps `setDarkMode` in the View Transitions API: dark → light *contracts* the dark
 *   bubble back into the centre-top anchor; light → dark *expands* it out again.
 * - Caches `systemView` in localStorage so the app boots straight into the saved theme
 *   with no spurious animation on refresh.
 * - `defaultColor` is aligned synchronously inside the same `flushSync` commit as the
 *   theme flip, so the "new" snapshot never captures a white-on-light / black-on-dark
 *   mismatch (which previously read as a post-bubble "refresh").
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useRef,
  type SetStateAction,
} from "react";
import { flushSync } from "react-dom";
import { FONTS, ORDEREDLISTRESPRESENTER } from "../assets/assets";
import { invoke } from "@tauri-apps/api/core";

// ── Theme cache (fixes the refresh animation) ──────────────────
const SYSTEM_VIEW_CACHE_KEY = "nxuo-system-view";
const VALID_SYSTEM_VIEWS = [
  "Dark Mode",
  "Light Mode",
  "System-Settings",
] as const;

const readCachedSystemView = (): string => {
  try {
    const cached = localStorage.getItem(SYSTEM_VIEW_CACHE_KEY);
    if (cached && (VALID_SYSTEM_VIEWS as readonly string[]).includes(cached)) {
      return cached;
    }
  } catch {
    /* localStorage unavailable */
  }
  return "Dark Mode";
};

const writeCachedSystemView = (view: string): void => {
  try {
    localStorage.setItem(SYSTEM_VIEW_CACHE_KEY, view);
  } catch {
    /* ignore */
  }
};

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
  /** To activate the search for navigating pages of a notebook */
  searchingKeys: string;
  setSearchingKeys: React.Dispatch<SetStateAction<string>>;
  /** Temporarily store the searched query to check what element to highlight */
  searchQuery: string;
  setSearchQuery: React.Dispatch<SetStateAction<string>>;
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
  searchingKeys: string;
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

  // Boots directly into the cached theme — no flash, no spurious animation.
  const [systemView, setSystemView] = useState<string>(readCachedSystemView);

  /** Evaluation logic verifying if dark mode applies matching theme properties or system preferences */
  const isDarkMode =
    systemView === "Dark Mode" ||
    (systemView === "System-Settings" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Raw state setter — do NOT expose directly; always go through `setDarkMode`.
  const [darkMode, setDarkModeState] = useState<boolean>(isDarkMode);

  // Ref mirrors state so the wrapper can compare against the latest value
  // without being recreated on every render.
  const darkModeRef = useRef<boolean>(isDarkMode);
  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

  const [searchingKeys, setSearchingKeys] = useState<string>("ctrl-P");

  // Keep the localStorage cache in sync so the next refresh boots correctly.
  useEffect(() => {
    writeCachedSystemView(systemView);
  }, [systemView]);

  // ==========================================
  // THEME TRANSITION — SINGLE CHOKE POINT
  // ==========================================
  /**
   * Every caller — CommandBar, BGEcho_O, the Settings page, the OS preference
   * listener, and any child route using the outlet context — ends up here.
   *
   * Direction:
   *   next === true  → "expand"    — new (dark) snapshot grows from the anchor,
   *                                   covering old (light). Dark bubble appears.
   *   next === false → "contract"  — old (dark) snapshot shrinks to the anchor,
   *                                   revealing new (light). Dark bubble recedes.
   *
   * Anchor: horizontal centre of the viewport, top edge (centre-top).
   *
   * `flushSync` forces React to commit synchronously inside the VT callback so
   * the "new" snapshot is fully rendered before the browser captures it. Any
   * `useLayoutEffect` inside that commit (e.g. LIFECYCLE 3 aligning
   * `defaultColor`) therefore also lands inside the snapshot — no post-bubble
   * colour snap.
   */
  const setDarkMode = useCallback((action: React.SetStateAction<boolean>) => {
    const current = darkModeRef.current;
    const next = typeof action === "function" ? action(current) : action;

    if (next === current) return;

    // Optimistic ref update so rapid successive toggles see the latest value.
    darkModeRef.current = next;

    // Fallback for WebViews without View Transitions support.
    if (!document.startViewTransition) {
      setDarkModeState(next);
      return;
    }

    const root = document.documentElement;

    // ── ORIGIN: horizontal centre, top edge ──────────────────────
    const originX = window.innerWidth / 2;
    const originY = 0;

    // Farthest corner from the origin — covers the whole viewport.
    const endRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY),
    );

    // Direction drives both the freeze selector and the stacking order.
    //   expand   → new (dark) on top, old (light) behind
    //   contract → old (dark) on top, new (light) behind
    const direction: "expand" | "contract" = next ? "expand" : "contract";
    root.setAttribute("data-vt", direction);
    root.style.setProperty("--vt-old-z", direction === "contract" ? "2" : "1");
    root.style.setProperty("--vt-new-z", direction === "expand" ? "2" : "1");

    const transition = document.startViewTransition(() => {
      // Inside flushSync, React commits `darkMode` and runs layout effects
      // (LIFECYCLE 3 → setDefaultColor) synchronously, so the "new" snapshot
      // is fully consistent: correct theme AND correct text colour.
      flushSync(() => setDarkModeState(next));
    });

    transition.ready
      .then(() => {
        if (direction === "expand") {
          // Dark bubble grows from centre-top.
          root.animate(
            {
              clipPath: [
                `circle(0px at ${originX}px ${originY}px)`,
                `circle(${endRadius}px at ${originX}px ${originY}px)`,
              ],
            },
            {
              duration: 500,
              easing: "ease-in-out",
              fill: "both", // ← keeps the new snapshot at full radius after the animation
              pseudoElement: "::view-transition-new(root)",
            },
          );
        } else {
          // Dark bubble shrinks back into centre-top.
          root.animate(
            {
              clipPath: [
                `circle(${endRadius}px at ${originX}px ${originY}px)`,
                `circle(0px at ${originX}px ${originY}px)`,
              ],
            },
            {
              duration: 500,
              easing: "ease-in-out",
              fill: "both", // ← keeps the old snapshot invisible after the animation
              pseudoElement: "::view-transition-old(root)",
            },
          );
        }
      })
      .catch(() => {
        /* rapid toggling aborted the transition — state is already correct */
      });

    transition.finished.finally(() => {
      root.removeAttribute("data-vt");
      root.style.removeProperty("--vt-old-z");
      root.style.removeProperty("--vt-new-z");
    });
  }, []);

  // ==========================================
  // LIFECYCLE 1: INTERNAL THEME RESYNC
  // ==========================================
  /** Automatically updates theme flags whenever workspace style selectors adjust */
  useEffect(() => {
    setTimeout(() => {
      setDarkMode(isDarkMode);
    }, 0);
  }, [systemView, isDarkMode, setDarkMode]);

  // ==========================================
  // LIFECYCLE 2: OS SYSTEM PREFERENCE LISTENER
  // ==========================================
  /** Binds native system hardware listener loops if System-Settings rule is selected */
  useEffect(() => {
    if (systemView !== "System-Settings") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches); // goes through the wrapped setter — animates
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [systemView, setDarkMode]);

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

  // Seed from the boot theme so the first painted frame already matches.
  const [defaultColor, setDefaultColor] = useState(
    isDarkMode ? "#ffffff" : "#000000",
  );

  const [defaultStrikeThroughShortcut, setDefaultStrikeThroughShortcut] =
    useState<string>("Mod-Shift-x");

  const [openShortcut, setOpenShortcut] = useState<string>("Mod-Alt-C");
  const [defaultSavingFolder, setDefaultSavingFolder] = useState<string>("");
  const [textModeShortcut, setTextModeShortcut] =
    useState<string>("Ctrl-Shift-Q");
  const [canvasModeShortcut, setCanvasModeShortcut] =
    useState<string>("Ctrl-Shift-C");

  const [zenModeShortcut, setZenModeShortcut] =
    useState<string>("Ctrl-Shift-Z");
  const [zenMode, setZenMode] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  //useEffect(() => console.clear(), [searchQuery]);

  // ==========================================
  // LIFECYCLE 3: CONTRAST COLOR SELECTOR ALIGNER
  // ==========================================
  /**
   * Adjusts global typography fallbacks to match dark or light surface elements.
   *
   * MUST be a `useLayoutEffect` (not `useEffect` + `setTimeout`): when
   * `setDarkMode` fires, `darkMode` flips inside a `flushSync`, React commits,
   * and this layout effect runs synchronously inside that same commit — i.e.
   * BEFORE the View Transition captures its "new" snapshot. The snapshot
   * therefore contains both the new theme AND the matching text colour, and
   * the page never flashes white-on-light or black-on-dark after the bubble.
   */
  useLayoutEffect(() => {
    setTimeout(() => {
      setDefaultColor(darkMode ? "#ffffff" : "#000000");
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
      searchingKeys,
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
    searchingKeys,
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
          if (savedData.searchingKeys !== undefined)
            setSearchingKeys(savedData.searchingKeys);
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
    searchingKeys,
    setSearchingKeys,
    searchQuery,
    setSearchQuery,
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
