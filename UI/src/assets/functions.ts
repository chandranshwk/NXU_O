/**
 * @file functions.ts
 * @description General text formatting utilities. Handles computing user profile
 * avatar initials and parsing system font family strings into reader-friendly labels.
 *
 * @architecture
 * - Serves as a stateless utility module used across toolbars and sidebar rails.
 * - Uses string center slicing math to compute compact layout avatar characters.
 * - Implements a state-machine buffer parser to split camelCase or dash-separated typography names.
 */

/**
 * @function getInitials
 * @description Generates a two-character avatar layout token. It extracts the first character
 * alongside a middle character snapshot to build high-density visual identifiers.
 *
 * @param {string} [name] - Target string parameter describing workspace folder or user labels.
 * @returns {string | undefined} Completed 2-character avatar string token.
 */
export const getInitials = (name?: string) => {
  if (name) {
    const nameLength = name.length;
    let last: string;

    // Slices text precisely at center points, stepping ahead if encountering blank space frames
    if (name.charAt(nameLength / 2) !== " ") last = name.charAt(nameLength / 2);
    else last = name.charAt(nameLength / 2 + 1);

    const first = name.charAt(0);
    return first + last;
  }
};

/**
 * @function formatName
 * @description Decodes raw system typography strings (e.g., "CourierNewLocal" or "open-sans")
 * down to clean title casing format labels (e.g., "Courier New" or "Open Sans").
 *
 * @param {string} font - Raw asset configuration string identifying the target font family.
 * @returns {string} Fully formatted, space-separated string title.
 */
export const formatName = (font: string) => {
  // 1. Strip the "Local" environment file suffix from targets first
  font = font.replace("Local", "").trim();

  let w = "";
  let output = "";
  const len = font.length;

  for (let i = 0; i < len; i++) {
    const ch = font.charAt(i);

    // 2. DETECT BOTH BREAKS: Check for a camelCase uppercase transition boundary line
    const isCamelTransition =
      i > 0 &&
      ch >= "A" &&
      ch <= "Z" &&
      font.charAt(i - 1) !== " " &&
      font.charAt(i - 1) !== "-";

    // 3. FLUSH CURRENT WORD: If hitting a split symbol OR an uppercase letter transition point
    if (ch === " " || ch === "-" || isCamelTransition) {
      if (w.trim().length > 0) {
        // Enforce strict Title-Case structures inside the word buffer fragment
        output +=
          w.charAt(0).toUpperCase() + w.substring(1).toLowerCase() + " ";
        w = "";
      }
    }

    // 4. ACCUMULATE: Skip structural spaces/hyphens so words merge cleanly into the buffer loop
    if (ch !== " " && ch !== "-") {
      w += ch;
    }
  }

  // 5. FINAL FLUSH: Clear the last remaining token out of the engine buffer trace
  if (w.trim().length > 0) {
    output += w.charAt(0).toUpperCase() + w.substring(1).toLowerCase() + " ";
  }

  return output.trim();
};
