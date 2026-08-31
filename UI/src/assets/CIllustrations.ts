/**
 * @file Illustrations.ts
 * @description Central layout asset library mapping illustration themes, asset file paths,
 * and theme-adaptive user interface accent colors.
 *
 * @architecture
 * - Supplies visual theme data and color mapping pairs across workspace selection menus.
 * - Auto-maps flat asset arrays into index-aligned `illustrationUI` object models.
 * - Holds accent hex colors to tint active status tags, buttons, and system toggles.
 */

export interface illustrationUI {
  /** Sequential identifier index parameter tracking layout positions */
  idx: number;
  /** Direct public asset storage directory path pointing to graphic files */
  file: string;
  /** Unique key string identifying the specific aesthetic style family */
  theme: string;
  /** Clean reader-friendly display label name assigned to the theme option */
  name: string;
  /** Nested hex string sub-record matching button accents to light vs dark frames */
  ui: { light: string; dark: string };
}

/** Flat config catalog storing asset file pointers, identifiers, and theme-adaptive visual palettes */
const IllustationAssets = [
  {
    file: "/CIllustration(1).png",
    theme: "sketch-white",
    name: "Neural Override",
    ui: { dark: "#3B82F6", light: "#60A5FA" },
  },
  {
    file: "/CIllustration(2).png",
    theme: "sketch-black",
    name: "Digital Dreams",
    ui: { dark: "#a75db4", light: "#753E7F" },
  },
  {
    file: "/CIllustration(3).png",
    theme: "isometric-blue",
    name: "Isometric Estate",
    ui: { dark: "#F59E0B", light: "#FBBF24" },
  },
  {
    file: "/CIllustration(4).png",
    theme: "isometric-green",
    name: "Isometric Garden",
    ui: { dark: "#8cb0ff", light: "#5D4D8D" },
  },
  {
    file: "/CIllustration(5).png",
    theme: "clay-minimal",
    name: "Clay Minimal",
    ui: { dark: "#EF4444", light: "#F87171" },
  },
  {
    file: "/CIllustration(7).svg",
    theme: "space-nebula",
    name: "Space Nebula",
    ui: { dark: "#92e3a9", light: "#477855" },
  },
  {
    file: "/CIllustration(8).png",
    theme: "space-galaxy",
    name: "Space Galaxy",
    ui: { dark: "#c95f50", light: "#7C382F" },
  },
];

/**
 * Compiled array exporting structured illustration objects.
 * Automatically injects calculated mathematical indexing parameters on top of baseline properties.
 */
export const Illustrations: illustrationUI[] = IllustationAssets.map(
  (bg, i) => ({
    idx: i + 1,
    file: bg.file,
    theme: bg.theme,
    name: bg.name,
    ui: bg.ui,
  }),
);
