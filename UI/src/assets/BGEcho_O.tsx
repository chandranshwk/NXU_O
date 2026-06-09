export interface UITheme {
  bgUser: string;
  bgMessenger: string;
  text: string;
  secondaryText: string;
  border: string;
  accent: string;
}

export interface Background {
  idx: number;
  url: string;
  theme: string;
  name: string;
  type: "image" | "illustration";
  ui: UITheme;
}

const BACKGROUND_ASSETS = [
  // 1-5: Minimalist/Architectural
  {
    file: "/bg(1).webp",
    theme: "morning-mist",
    name: "Pastel Heights",
    ui: {
      bgUser: "#D6D9E6",
      bgMessenger: "#F7EFE1",
      text: "#4A4E69",
      secondaryText: "#8E94B2",
      border: "#C4C9D9",
      accent: "#FBC4AB",
    },
  },
  {
    file: "/bg(2).webp",
    theme: "sketch-white",
    name: "Neural Override",
    ui: {
      bgUser: "#E28E24",
      bgMessenger: "#E7E2D3",
      text: "#1F2322",
      secondaryText: "#5E6C6B",
      border: "#36413E",
      accent: "#4D7C8A",
    },
  },
  {
    file: "/bg(3).webp",
    theme: "industrial-grey",
    name: "Isometric Estate",
    ui: {
      bgUser: "#D9A406",
      bgMessenger: "#E4E2D5",
      text: "#1A1A1B",
      secondaryText: "#6B6B65",
      border: "#2D2D2E",
      accent: "#E63908",
    },
  },
  {
    file: "/bg(5).webp",
    theme: "clay-minimal",
    name: "Clay Minimal",
    ui: {
      bgUser: "#D1C9BE",
      bgMessenger: "#EFEEE5",
      text: "#4A4641",
      secondaryText: "#9B948B",
      border: "#C7B9A9",
      accent: "#9E9A95",
    },
  },

  // 6-10: Tech & Space
  {
    file: "/bg(6).png",
    theme: "blueprint",
    name: "Monolith Dark",
    ui: {
      bgUser: "#2B2B2B",
      bgMessenger: "#121212",
      text: "#F2F2F2",
      secondaryText: "#757575",
      border: "#3D3D3D",
      accent: "#FFFFFF",
    },
  },
  {
    file: "/bg(7).png",
    theme: "midnight-city",
    name: "Blueprint light",
    ui: {
      bgUser: "#E0E2E5",
      bgMessenger: "#FFFFFF",
      text: "#1A1C1E",
      secondaryText: "#858C94",
      border: "#CED4DA",
      accent: "#212529",
    },
  },
  {
    file: "/bg(8).png",
    theme: "tundra-blue",
    name: "Data Void",
    ui: {
      bgUser: "#1A1A1A",
      bgMessenger: "#000000",
      text: "#E0E0E0",
      secondaryText: "#555555",
      border: "#333333",
      accent: "#FFFFFF",
    },
  },
  {
    file: "/bg(9).png",
    theme: "desert-sand",
    name: "Liquid Metal",
    ui: {
      bgUser: "#2E2E32",
      bgMessenger: "#111113",
      text: "#E9E9EB",
      secondaryText: "#6D6D72",
      border: "#3A3A3C",
      accent: "#F2F2F7",
    },
  },
  {
    file: "/bg(10).webp",
    theme: "cyber-punk",
    name: "Mech Mind",
    ui: {
      bgUser: "#D9933B",
      bgMessenger: "#E0E0E0",
      text: "#2C2520",
      secondaryText: "#706861",
      border: "#B5A99B",
      accent: "#6D7A47",
    },
  },

  // 11-15: Artistic & Lush
  {
    file: "/bg(11).webp",
    theme: "neon-pulse",
    name: "Abyssal Parchment",
    ui: {
      bgUser: "#2E4A62",
      bgMessenger: "#F5F1E4",
      text: "#1A2530",
      secondaryText: "#6B7D8C",
      border: "#D1C8B1",
      accent: "#5D94B5",
    },
  },
  {
    file: "/bg(12).jpg",
    theme: "echo-waves",
    name: "Dark Fluidity",
    ui: {
      bgUser: "#C5A059",
      bgMessenger: "#2A2A2B",
      text: "#F5F5F5",
      secondaryText: "#8C8C8E",
      border: "#454547",
      accent: "#E5C17A",
    },
  },
  {
    file: "/bg(13).png",
    theme: "soft-glass",
    name: "Eichler Split",
    ui: {
      bgUser: "#E0E0E0",
      bgMessenger: "#262626",
      text: "#FFFFFF",
      secondaryText: "#8C8C8C",
      border: "#4D4D4D",
      accent: "#F2F2F2",
    },
  },
  {
    file: "/bg(14).png",
    theme: "forest-canopy",
    name: "Urban Grid Dark",
    ui: {
      bgUser: "#1E2B45",
      bgMessenger: "#2A2D34",
      text: "#E8E9EB",
      secondaryText: "#6B7280",
      border: "#3F444D",
      accent: "#743844",
    },
  },
  {
    file: "/bg(15).png",
    theme: "ocean-breeze",
    name: "Urban Grid Light",
    ui: {
      bgUser: "#60A5FA",
      bgMessenger: "#F1F5F9",
      text: "#1E293B",
      secondaryText: "#64748B",
      border: "#CBD5E1",
      accent: "#EF4444",
    },
  },

  // 16-20: Abstract & Mood
  {
    file: "/bg(16).webp",
    theme: "deep-space",
    name: "Chalk & Charcoal",
    ui: {
      bgUser: "#262626",
      bgMessenger: "#000000",
      text: "#FFFFFF",
      secondaryText: "#808080",
      border: "#4D4D4D",
      accent: "#F2F2F2",
    },
  },
  {
    file: "/bg(17).webp",
    theme: "zen-garden",
    name: "Quiet Morning",
    ui: {
      bgUser: "#E8EAE3",
      bgMessenger: "#F5F5F0",
      text: "#1A1A1A",
      secondaryText: "#82827C",
      border: "#D1D1CB",
      accent: "#2B2B2B",
    },
  },
  {
    file: "/bg(18).webp",
    theme: "abstract-flow",
    name: "Jungle Lagoon",
    ui: {
      bgUser: "#9B7EDE",
      bgMessenger: "#E0F2F1",
      text: "#1B3022",
      secondaryText: "#5A7D7C",
      border: "#A5D6A7",
      accent: "#26A69A",
    },
  },
  {
    file: "/bg(19).webp",
    theme: "paper-texture",
    name: "Twilight Tropic",
    ui: {
      bgUser: "#7E57C2",
      bgMessenger: "#1A1B2E",
      text: "#E8EAF6",
      secondaryText: "#9FA8DA",
      border: "#311B92",
      accent: "#4DD0E1",
    },
  },
  {
    file: "/bg(20).webp",
    theme: "candy-pop",
    name: "Kinetic Geometry",
    ui: {
      bgUser: "#F28C82",
      bgMessenger: "#3B5998",
      text: "#FFFFFF",
      secondaryText: "#ADB5BD",
      border: "#212529",
      accent: "#4A90E2",
    },
  },

  // 21-31: Characters & Dark Void
  {
    file: "/bg(21).webp",
    theme: "vintage-sepia",
    name: "Cartographer’s Path",
    ui: {
      bgUser: "#D1B9B1",
      bgMessenger: "#F4EAE6",
      text: "#2B2827",
      secondaryText: "#7A716E",
      border: "#C4B6B1",
      accent: "#E64D4D",
    },
  },
  {
    file: "/bg(22).webp",
    theme: "stormy-night",
    name: "Propaganda Pulse",
    ui: {
      bgUser: "#E22026",
      bgMessenger: "#F5EEDC",
      text: "#1A1A1B",
      secondaryText: "#5E5C56",
      border: "#2B2B2D",
      accent: "#1A1A1B",
    },
  },
  {
    file: "/bg(23).webp",
    theme: "frost",
    name: "Radial Logic",
    ui: {
      bgUser: "#E5E7EB",
      bgMessenger: "#FFFFFF",
      text: "#111827",
      secondaryText: "#6B7280",
      border: "#D1D5DB",
      accent: "#EF4444",
    },
  },
  {
    file: "/bg(27).png",
    theme: "warm-ECHO_O",
    name: "Urban Transit",
    ui: {
      bgUser: "#E3E7E9",
      bgMessenger: "#F8FAFB",
      text: "#1F2937",
      secondaryText: "#6B7280",
      border: "#D1D5DB",
      accent: "#CC5B4B",
    },
  },
  {
    file: "/bg(25).png",
    theme: "geometric-bold",
    name: "Orbital Horizon",
    ui: {
      bgUser: "#2A313D",
      bgMessenger: "#0B0E14",
      text: "#E2E8F0",
      secondaryText: "#64748B",
      border: "#1E293B",
      accent: "#94A3B8",
    },
  },
  {
    file: "/bg(26).png",
    theme: "minimal-grid",
    name: "Alpine Analytics",
    ui: {
      bgUser: "#3ABEF9",
      bgMessenger: "#F1F5F9",
      text: "#0F172A",
      secondaryText: "#64748B",
      border: "#CBD5E1",
      accent: "#FDE047",
    },
  },
  {
    file: "/bg(28).png",
    theme: "golden-hour",
    name: "Ares Descent",
    ui: {
      bgUser: "#E5E7EB",
      bgMessenger: "#6B4433",
      text: "#F9FAFB",
      secondaryText: "#D1D5DB",
      border: "#4B3228",
      accent: "#C2410C",
    },
  },
  {
    file: "/bg(30).png",
    theme: "sunset-glow",
    name: "Obsidian Slate",
    ui: {
      bgUser: "#23292E",
      bgMessenger: "#0F1214",
      text: "#E1E4E6",
      secondaryText: "#5C636A",
      border: "#1B1F22",
      accent: "#3B82F6",
    },
  },
  {
    file: "/bg(31).png",
    theme: "arctic-high",
    name: "Alabaster Grain",
    ui: {
      bgUser: "#EBE8E4",
      bgMessenger: "#F7F5F2",
      text: "#2D2C2A",
      secondaryText: "#8E8B85",
      border: "#DEDAD4",
      accent: "#5E5C59",
    },
  },
];

export const ALL_BACKGROUNDS: Background[] = BACKGROUND_ASSETS.map((bg, i) => ({
  idx: i + 1,
  url: bg.file,
  theme: bg.theme,
  name: bg.name,
  type: bg.file.endsWith(".png") ? "illustration" : "image",
  ui: bg.ui,
}));

export const getThemeActions = ({
  setDarkMode,
}: {
  setDarkMode: (value: boolean) => void;
}) => {
  return ALL_BACKGROUNDS.map((bg) => ({
    id: `Theme - ${bg.idx}`,
    title: `Set ECHO_O theme to ${bg.name}`,
    shortcut: `/t${bg.idx}-ECHO_O`,
    module: "ECHO_O",
    category: "Themes",
    hideByDefault: true,

    // 1. The Icon: A solid circle of the theme's accent color
    icon: (
      <div
        className="w-4 h-4 rounded-full shadow-sm border border-white"
        style={{ backgroundColor: bg.ui.accent }}
      />
    ),

    // 2. The Custom Styling for the Bar
    style: {
      // Use the actual background image, but crop it to a specific sliver
      backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.65), rgba(255,255,255,0.5)), url("${bg.url}")`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    },

    action: () => {
      localStorage.setItem("selected-bg", JSON.stringify(bg));
      window.dispatchEvent(new CustomEvent("theme-change", { detail: bg }));
      if (
        bg.idx === 5 ||
        bg.idx === 7 ||
        bg.idx === 8 ||
        bg.idx === 15 ||
        bg.idx === 18 ||
        bg.idx === 24 ||
        bg.idx === 27
      )
        setDarkMode(true);
      else setDarkMode(false);
    },
  }));
};
