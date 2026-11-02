/**
 * @file ShortcutChip.tsx
 * @component ShortcutChip
 * @description A small, inline key-cap chip that displays a configured
 * keyboard shortcut. Used for *discovery* (teaching users that a shortcut
 * exists) — pair it with an action label or place it next to the UI element
 * the shortcut triggers.
 *
 * @architecture
 * - Reads the live shortcut string from `useSettings`, so chips update
 *   automatically when the user rebinds keys in Settings.
 * - Renders through the existing `FormatHotkey` primitive, which already
 *   handles platform-specific modifier symbols (⌘ / Ctrl).
 * - Optional `label` prop prepends a verb ("Press") so the chip is never
 *   shown without context.
 * - Optional `title` prop attaches a native tooltip explaining the action.
 * - `variant="ghost"` strips the border/background for use inside menus,
 *   footers, and dense layouts where a full chip would be noisy.
 *
 * @usage
 * // Discovery chip next to the search bar
 * <ShortcutChip
 *   hotkey="commandBar"
 *   label="Press"
 *   title="Open the command bar"
 *   darkMode={darkMode}
 * />
 *
 * // Reference chip inside the command bar footer (no border)
 * <ShortcutChip
 *   hotkey="commandBar"
 *   variant="ghost"
 *   darkMode={darkMode}
 * />
 */

import React from "react";
import { FormatHotkey } from "./FormatHotKeys";
import { useSettings } from "../../contexts/settingsContext";

type ShortcutKey =
  | "commandBar"
  | "search"
  | "scratchpad"
  | "zen"
  | "notes"
  | "folder"
  | "strike";

interface ShortcutChipProps {
  /** Which configured shortcut to display. */
  hotkey: ShortcutKey;
  /**
   * Optional verb prefix shown before the keys, e.g. "Press".
   * Recommended for discovery chips — omits on reference chips in menus.
   */
  label?: string;
  /** Native tooltip text (browser default). */
  title?: string;
  /** Visual density. `default` = bordered chip; `ghost` = borderless inline. */
  variant?: "default" | "ghost";
  /** Current theme flag. */
  darkMode: boolean;
  /** Optional extra classes. */
  className?: string;
}

/**
 * Maps the semantic `hotkey` token to the correct value from the settings
 * context. Kept outside the component so the switch is a pure lookup.
 */
function resolveHotkey(
  settings: ReturnType<typeof useSettings>,
  hotkey: ShortcutKey,
): string {
  switch (hotkey) {
    case "commandBar":
      return settings.openCommandBarKeys;
    case "search":
      return settings.searchingKeys;
    case "scratchpad":
      return settings.scratchpadOpenShortcut;
    case "zen":
      return settings.zenModeShortcut;
    case "notes":
      return settings.notesViewShortcut;
    case "folder":
      return settings.folderExplorerShortcut;
    case "strike":
      return settings.defaultStrikeThroughShortcut;
  }
}

export const ShortcutChip: React.FC<ShortcutChipProps> = ({
  hotkey,
  label,
  title,
  variant = "default",
  darkMode,
  className = "",
}) => {
  const settings = useSettings();
  const keyStr = resolveHotkey(settings, hotkey);

  if (!keyStr) return null;

  // Bordered chip — the "discovery" look, used next to actions.
  const borderedClass = darkMode
    ? "border border-zinc-700/70 bg-zinc-800/50 text-zinc-300"
    : "border border-zinc-200 bg-zinc-50 text-zinc-600";

  // Ghost variant — same layout, no border/background. Used inside menus,
  // footers, and tooltips where a full chip would compete for attention.
  const ghostClass = darkMode ? "text-zinc-500" : "text-zinc-400";

  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium select-none whitespace-nowrap ${
        variant === "ghost" ? ghostClass : borderedClass
      } ${className}`}
    >
      {label && <span className="opacity-60">{label}</span>}
      <FormatHotkey hotkeyStr={keyStr} />
    </span>
  );
};

export default ShortcutChip;
