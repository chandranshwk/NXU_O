// 🚀 FIXED: Added clear structural shapes to completely avoid 'any' casting metrics
export interface ShortcutObject {
  label?: string;
  keys: string | string[];
  description?: string;
  icon?: React.ReactNode;
}

export type ShortcutInput = string | string[] | ShortcutObject;

/**
 * Verifies if a physical hardware KeyboardEvent matches a specified shortcut configuration.
 * Supports strings ("ctrl+alt+t"), arrays (["shift", "d"]), or objects with a .keys property.
 *
 * @param event The native browser KeyboardEvent from keydown listeners.
 * @param shortcutInput The target shortcut configuration map (string, array, or object block).
 * @returns boolean True if the key combination matches perfectly.
 */
export const matchShortcut = (
  event: KeyboardEvent,
  shortcutInput: ShortcutInput,
): boolean => {
  if (!shortcutInput) return false;

  // 🚀 FIXED: Initialize without useless baseline variable assignment space maps
  let tokens: string[];

  // 1. Safely extract and clean shortcut tokens from any data structure
  if (Array.isArray(shortcutInput)) {
    tokens = shortcutInput.map((t) => String(t).toLowerCase().trim());
  } else if (typeof shortcutInput === "string") {
    // Standardize token splits down across both dash and plus configurations smoothly
    tokens = shortcutInput
      .toLowerCase()
      .split(/[+-]/)
      .map((t) => t.trim());
  } else if (
    shortcutInput &&
    typeof shortcutInput === "object" &&
    "keys" in shortcutInput
  ) {
    const innerKeys = shortcutInput.keys;
    tokens = Array.isArray(innerKeys)
      ? innerKeys.map((t) => String(t).toLowerCase().trim())
      : String(innerKeys)
          .toLowerCase()
          .split(/[+-]/)
          .map((t) => t.trim());
  } else {
    return false;
  }

  // 2. Map required modifier criteria from the parsed token string array
  const needsCtrl =
    tokens.includes("ctrl") ||
    tokens.includes("mod") ||
    tokens.includes("control");
  const needsMeta =
    tokens.includes("meta") ||
    tokens.includes("cmd") ||
    tokens.includes("command") ||
    tokens.includes("mod");
  const needsAlt = tokens.includes("alt") || tokens.includes("option");
  const needsShift = tokens.includes("shift");

  // 3. Isolate the target execution character key (e.g., 't', 'd', 'enter')
  const targetCharacter = tokens.find(
    (t) =>
      ![
        "mod",
        "ctrl",
        "control",
        "meta",
        "cmd",
        "command",
        "shift",
        "alt",
        "option",
        "win",
      ].includes(t),
  );

  // 4. Capture current physical hardware state vectors
  const ctrlActive = event.ctrlKey;
  const metaActive = event.metaKey;
  const altActive = event.altKey;
  const shiftActive = event.shiftKey;
  const keyActive = event.key.toLowerCase();

  // 5. Run exact strict modifier match tests
  // An unrequested modifier being active causes the validation block to fail instantly
  const modifiersMatch =
    ctrlActive === (needsCtrl || needsMeta) &&
    metaActive === needsMeta &&
    altActive === needsAlt &&
    shiftActive === needsShift;

  return modifiersMatch && keyActive === targetCharacter;
};
