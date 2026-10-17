/** Soft pastel palette used to tint section canvas wrappers. */
export const presetHexColors = [
  "#3b82f6",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#ec4899",
  "#eab308",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f59e0b",
  "#fef3c7",
  "#fce7f3",
  "#e0f2fe",
  "#d1fae5",
  "#ede9fe",
  "#fed7aa",
  "#fecaca",
  "#cffafe",
  "#e5e7eb",
  "#f3f4f6",
];

/** Picks a random hex color from the design palette. */
export const getRandomColor = (): string =>
  presetHexColors[Math.floor(Math.random() * presetHexColors.length)];
