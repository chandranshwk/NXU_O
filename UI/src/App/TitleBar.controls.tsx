import { useEffect, useState } from "react";
import {
  VscChromeClose,
  VscChromeMinimize,
  VscChromeMaximize,
  VscChromeRestore,
} from "react-icons/vsc";
import { FiChevronDown } from "react-icons/fi";
import type { Window } from "@tauri-apps/api/window";
import WindowMenu, {
  type MenuTab,
  type AddAction,
} from "./TitleBar.WindowMenu";

interface TitleBarControlProps {
  appWindow: Window;
  darkMode: boolean;
  tabs?: MenuTab[];
  maxTabs?: number;
  createActions?: AddAction[];
  pageLinks?: AddAction[];
  onSelectTab?: (id: string) => void;
  onCloseTab?: (id: string) => void;
  onAddCustomTab?: (label: string, destination: string) => void;
}

const ControlButton: React.FC<{
  label: string;
  onClick: () => void;
  darkMode: boolean;
  variant?: "default" | "danger";
  active?: boolean;
  children: React.ReactNode;
}> = ({
  label,
  onClick,
  darkMode,
  variant = "default",
  active = false,
  children,
}) => {
  const isDanger = variant === "danger";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`group/btn relative flex items-center justify-center w-12 h-full outline-none
        transition-colors duration-100
        ${
          active
            ? darkMode
              ? "text-zinc-100 bg-white/8"
              : "text-zinc-900 bg-black/6"
            : ""
        }
        ${
          darkMode
            ? isDanger
              ? "text-zinc-400 hover:text-white hover:bg-[#E81123]"
              : "text-zinc-400 hover:text-zinc-100 hover:bg-white/8"
            : isDanger
              ? "text-zinc-600 hover:text-white hover:bg-[#E81123]"
              : "text-zinc-600 hover:text-zinc-900 hover:bg-black/6"
        }
        focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40`}
    >
      {children}
      <span
        role="tooltip"
        className={`text-[10px] tracking-wide pointer-events-none hidden group-hover/btn:block absolute
          right-2 top-[calc(100%+6px)] px-2 py-1 rounded shadow-md whitespace-nowrap z-50
          ${
            darkMode
              ? "bg-zinc-800 text-zinc-200 border border-zinc-700"
              : "bg-zinc-900 text-zinc-100"
          }`}
      >
        {label}
      </span>
    </button>
  );
};

const TitleBarControl: React.FC<TitleBarControlProps> = ({
  darkMode,
  appWindow,
  tabs = [],
  maxTabs = 8,
  createActions = [],
  pageLinks = [],
  onSelectTab,
  onCloseTab,
  onAddCustomTab,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;

    appWindow.isMaximized().then((v) => {
      if (!cancelled) setIsMaximized(v);
    });

    appWindow
      .onResized(() => {
        appWindow.isMaximized().then((v) => {
          if (!cancelled) setIsMaximized(v);
        });
      })
      .then((fn) => {
        if (cancelled) fn();
        else unlisten = fn;
      });

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, [appWindow]);

  return (
    <>
      <div className="flex items-stretch h-full select-none">
        <div ref={setMenuAnchorEl} className="flex items-stretch">
          <ControlButton
            label="Window menu"
            onClick={() => setMenuOpen((o) => !o)}
            darkMode={darkMode}
            active={menuOpen}
          >
            <FiChevronDown size={18} strokeWidth={1.75} />
          </ControlButton>
        </div>

        <div
          className={`w-px my-2 ${darkMode ? "bg-white/10" : "bg-black/10"}`}
        />

        <ControlButton
          label="Minimize"
          onClick={() => appWindow.minimize()}
          darkMode={darkMode}
        >
          <VscChromeMinimize size={17} />
        </ControlButton>

        <ControlButton
          label={isMaximized ? "Restore" : "Maximize"}
          onClick={() => appWindow.toggleMaximize()}
          darkMode={darkMode}
        >
          {isMaximized ? (
            <VscChromeRestore size={17} />
          ) : (
            <VscChromeMaximize size={14} />
          )}
        </ControlButton>

        <ControlButton
          label="Close"
          onClick={() => appWindow.close()}
          darkMode={darkMode}
          variant="danger"
        >
          <VscChromeClose size={16} />
        </ControlButton>
      </div>

      <WindowMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        anchorEl={menuAnchorEl}
        darkMode={darkMode}
        tabs={tabs}
        maxTabs={maxTabs}
        createActions={createActions}
        pageLinks={pageLinks}
        onSelectTab={(id) => {
          onSelectTab?.(id);
          setMenuOpen(false);
        }}
        onCloseTab={onCloseTab}
        onAddCustomTab={onAddCustomTab}
      />
    </>
  );
};

export default TitleBarControl;
