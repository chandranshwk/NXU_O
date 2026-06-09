export const getInitials = (name?: string) => {
  if (name) {
    const nameLength = name.length;
    let last = "";
    if (name.charAt(nameLength / 2) !== " ") last = name.charAt(nameLength / 2);
    else last = name.charAt(nameLength / 2 + 1);
    const first = name.charAt(0);
    return first + last;
  }
};

export const formatName = (font: string) => {
  // 1. Strip the "Local" suffix from absolute targets first
  font = font.replace("Local", "").trim();

  let w = "";
  let output = "";
  const len = font.length;

  for (let i = 0; i < len; i++) {
    const ch = font.charAt(i);

    // 2. DETECT BOTH BREAKS: Check for a camelCase uppercase transition boundary
    const isCamelTransition =
      i > 0 &&
      ch >= "A" &&
      ch <= "Z" &&
      font.charAt(i - 1) !== " " &&
      font.charAt(i - 1) !== "-";

    // 3. FLUSH CURRENT WORD: If hitting a split symbol OR an uppercase letter transition
    if (ch === " " || ch === "-" || isCamelTransition) {
      if (w.trim().length > 0) {
        output +=
          w.charAt(0).toUpperCase() + w.substring(1).toLowerCase() + " ";
        w = "";
      }
    }

    // 4. ACCUMULATE: Skip structural spaces/hyphens so words merge cleanly into the buffer
    if (ch !== " " && ch !== "-") {
      w += ch;
    }
  }

  // 5. FINAL FLUSH: Clear the last word out of the engine buffer trace
  if (w.trim().length > 0) {
    output += w.charAt(0).toUpperCase() + w.substring(1).toLowerCase() + " ";
  }

  return output.trim();
};
