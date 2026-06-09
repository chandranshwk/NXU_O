export interface illustrationUI {
  idx: number;
  file: string;
  theme: string;
  name: string;
  ui: { light: string; dark: string };
}

// I updated the UI colors to provide the "Accent" color for your tags/toggles
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

export const Illustrations: illustrationUI[] = IllustationAssets.map(
  (bg, i) => ({
    idx: i + 1,
    file: bg.file,
    theme: bg.theme,
    name: bg.name,
    ui: bg.ui,
  }),
);
