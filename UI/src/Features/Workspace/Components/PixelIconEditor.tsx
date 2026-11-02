import { useState, useEffect, useRef } from "react";
import { FiX, FiCheck, FiEdit3, FiSmile, FiPenTool } from "react-icons/fi";
import { BiEraser } from "react-icons/bi";
import { motion, AnimatePresence } from "motion/react";

// Helper functions to convert colors
const hslToHex = (h: number, s: number, l: number) => {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

const hexToHsl = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

interface PixelIconEditorProps {
  initialIcon?: string;
  darkMode: boolean;
  onSave: (icon: string | undefined) => void; //  Changed to 'icon' to support both Base64 and Emojis
  onClose: () => void;
}

const GRID_SIZE = 16;
const PALETTE = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#a855f7",
  "#ec4899",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#f8fafc",
];

//  Curated Emoji List for Workspaces
const EMOJIS = [
  "📁",
  "🚀",
  "💻",
  "🎨",
  "📚",
  "🔥",
  "💡",
  "🧠",
  "📝",
  "📊",
  "⚙️",
  "🎯",
  "🏢",
  "🌟",
  "💼",
  "📈",
  "🛠️",
  "🧪",
  "🎓",
  "🌍",
  "🎵",
  "🎮",
  "📸",
  "🍕",
  "☕",
  "🏆",
  "🚧",
  "🧩",
  "🔒",
  "🗂️",
  "🗓️",
  "📌",
];

export const PixelIconEditor = ({
  initialIcon,
  darkMode,
  onSave,
  onClose,
}: PixelIconEditorProps) => {
  const [activeTab, setActiveTab] = useState<"emoji" | "draw">("emoji");

  // Draw state
  const [pixels, setPixels] = useState<string[]>(
    Array(GRID_SIZE * GRID_SIZE).fill("transparent"),
  );
  const [selectedColor, setSelectedColor] = useState(PALETTE[0]);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [isDrawing, setIsDrawing] = useState(false);

  // Color picker state
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [hsl, setHsl] = useState({ h: 0, s: 0, l: 0 });
  const colorPickerRef = useRef<HTMLDivElement>(null);

  //  Determine initial tab based on existing icon type
  useEffect(() => {
    if (initialIcon) {
      if (initialIcon.startsWith("data:image")) {
        setTimeout(() => {
          setActiveTab("draw"); // It's a custom pixel drawing
        }, 0);
      } else {
        setTimeout(() => {
          setActiveTab("emoji"); // It's an emoji
        }, 0);
      }
    }
  }, [initialIcon]);

  //  LOAD EXISTING DRAWING INTO THE GRID
  useEffect(() => {
    if (!initialIcon || !initialIcon.startsWith("data:image")) return;

    const img = new Image();
    img.src = initialIcon;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = GRID_SIZE;
      canvas.height = GRID_SIZE;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);
        const imgData = ctx.getImageData(0, 0, GRID_SIZE, GRID_SIZE).data;
        const loadedPixels: string[] = [];

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          const a = imgData[i + 3];

          if (a === 0) {
            loadedPixels.push("transparent");
          } else {
            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            loadedPixels.push(hex.toUpperCase());
          }
        }
        setPixels(loadedPixels);
      }
    };
  }, [initialIcon]);

  // Sync HSL state when selectedColor changes
  useEffect(() => {
    setTimeout(() => {
      setHsl(hexToHsl(selectedColor));
    }, 0);
  }, [selectedColor]);

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle continuous drawing
  useEffect(() => {
    const handleMouseUp = () => setIsDrawing(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const paintPixel = (index: number) => {
    setPixels((prev) => {
      const next = [...prev];
      next[index] = tool === "eraser" ? "transparent" : selectedColor;
      return next;
    });
  };

  const generateBase64 = () => {
    if (pixels.every((p) => p === "transparent")) return undefined;
    const canvas = document.createElement("canvas");
    canvas.width = GRID_SIZE;
    canvas.height = GRID_SIZE;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      pixels.forEach((color, i) => {
        if (color !== "transparent") {
          ctx.fillStyle = color;
          ctx.fillRect(i % GRID_SIZE, Math.floor(i / GRID_SIZE), 1, 1);
        }
      });
      return canvas.toDataURL("image/png");
    }
    return undefined;
  };

  const handleSave = () => {
    if (activeTab === "emoji") {
      onSave(
        initialIcon && !initialIcon.startsWith("data:image")
          ? initialIcon
          : "📁",
      );
    } else {
      onSave(generateBase64());
    }
    onClose();
  };

  const checkerboardStyle = {
    backgroundImage: `linear-gradient(45deg, ${darkMode ? "#2a2a2a" : "#e5e7eb"} 25%, transparent 25%), 
                      linear-gradient(-45deg, ${darkMode ? "#2a2a2a" : "#e5e7eb"} 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, ${darkMode ? "#2a2a2a" : "#e5e7eb"} 75%), 
                      linear-gradient(-45deg, transparent 75%, ${darkMode ? "#2a2a2a" : "#e5e7eb"} 75%)`,
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
    backgroundColor: darkMode ? "#1e1e1e" : "#ffffff",
  };

  const isCustomColor = !PALETTE.includes(selectedColor);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
          className={`w-100 flex flex-col rounded-lg shadow-2xl border overflow-hidden ${darkMode ? "bg-[#18181b] border-zinc-800" : "bg-white border-zinc-200"}`}
        >
          {/* Header */}
          <div
            className={`px-5 py-4 border-b flex items-center justify-between ${darkMode ? "border-zinc-800" : "border-zinc-100"}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-lg ${darkMode ? "bg-zinc-800" : "bg-zinc-100"}`}
              >
                <FiEdit3
                  size={16}
                  className={darkMode ? "text-zinc-300" : "text-zinc-600"}
                />
              </div>
              <div>
                <h2
                  className={`text-sm font-bold tracking-tight ${darkMode ? "text-zinc-100" : "text-zinc-900"}`}
                >
                  STAMP
                </h2>
                <p className="text-[11px] text-zinc-500 font-medium">
                  Pick an emoji or draw a stamp
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Live Preview */}
              <div
                className={`w-10 h-10 rounded shadow-inner flex items-center justify-center border ${darkMode ? "bg-zinc-900 border-zinc-700" : "bg-zinc-50 border-zinc-200"}`}
              >
                {activeTab === "emoji" ? (
                  <span className="text-xl">
                    {initialIcon && !initialIcon.startsWith("data:image")
                      ? initialIcon
                      : "📁"}
                  </span>
                ) : pixels.some((p) => p !== "transparent") ? (
                  <img
                    src={generateBase64()}
                    alt="Preview"
                    className="w-8 h-8 object-contain [image-rendering:pixelated]"
                  />
                ) : (
                  <span className="text-[10px] text-zinc-500">Empty</span>
                )}
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${darkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"}`}
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/*  Tabs */}
          <div
            className={`flex border-b ${darkMode ? "border-zinc-800" : "border-zinc-100"}`}
          >
            <button
              onClick={() => setActiveTab("emoji")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                activeTab === "emoji"
                  ? darkMode
                    ? "text-blue-400 border-b-2 border-blue-400 bg-zinc-800/30"
                    : "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : darkMode
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <FiSmile size={14} /> Emojis
            </button>
            <button
              onClick={() => setActiveTab("draw")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                activeTab === "draw"
                  ? darkMode
                    ? "text-blue-400 border-b-2 border-blue-400 bg-zinc-800/30"
                    : "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50"
                  : darkMode
                    ? "text-zinc-500 hover:text-zinc-300"
                    : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <FiPenTool size={14} /> Draw Stamp
            </button>
          </div>

          {/*  TAB 1: EMOJIS */}
          {activeTab === "emoji" && (
            <div className={`p-6 ${darkMode ? "bg-[#121212]" : "bg-zinc-50"}`}>
              <div className="grid grid-cols-8 gap-2">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onSave(emoji);
                      onClose();
                    }}
                    className={`text-2xl w-10 h-10 flex items-center justify-center rounded-lg transition-transform hover:scale-110 hover:bg-black/10 dark:hover:bg-white/10 ${
                      initialIcon === emoji
                        ? "bg-blue-500/20 ring-2 ring-blue-500"
                        : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex justify-start items-center pt-6 mt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    onSave(undefined);
                    onClose();
                  }}
                  className={`text-xs font-medium transition-colors ${darkMode ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"}`}
                >
                  Remove Icon
                </button>
              </div>
            </div>
          )}

          {/*  TAB 2: DRAW STAMP */}
          {activeTab === "draw" && (
            <>
              <div
                className={`p-6 flex flex-col items-center ${darkMode ? "bg-[#121212]" : "bg-zinc-50"}`}
              >
                <div
                  className={`relative border-2 rounded-lg overflow-hidden shadow-xl cursor-crosshair ${darkMode ? "border-zinc-700" : "border-zinc-300"}`}
                  style={{
                    ...checkerboardStyle,
                    width: "288px",
                    height: "288px",
                  }}
                >
                  <div
                    className="grid w-full h-full"
                    style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
                  >
                    {pixels.map((color, i) => (
                      <div
                        key={i}
                        onMouseDown={() => {
                          setIsDrawing(true);
                          paintPixel(i);
                        }}
                        onMouseEnter={() => {
                          if (isDrawing) paintPixel(i);
                        }}
                        className="w-full h-full border-[0.5px] border-black/5 dark:border-white/5 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                        style={{
                          backgroundColor:
                            color === "transparent" ? "transparent" : color,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div
                className={`p-5 border-t ${darkMode ? "border-zinc-800" : "border-zinc-100"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTool("brush")}
                      className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${tool === "brush" ? "bg-blue-500 text-white" : darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"}`}
                      title="Brush"
                    >
                      <div
                        className="w-4 h-4 rounded-sm shadow-sm"
                        style={{ backgroundColor: selectedColor }}
                      />
                    </button>
                    <button
                      onClick={() => setTool("eraser")}
                      className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${tool === "eraser" ? "bg-blue-500 text-white" : darkMode ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"}`}
                      title="Eraser"
                    >
                      <BiEraser size={14} />
                    </button>
                  </div>

                  {/* Custom Color Picker Popover */}
                  <div className="relative" ref={colorPickerRef}>
                    <button
                      onClick={() => setIsColorPickerOpen((v) => !v)}
                      className={`w-8 h-8 rounded-md p-0.5 transition-transform hover:scale-110 ${tool === "brush" && isCustomColor ? "ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#18181b]" : ""}`}
                      style={{
                        background:
                          "conic-gradient(from 90deg at 50% 50%, #E11D48, #D946EF, #8B5CF6, #3B82F6, #06B6D4, #10B981, #EAB308, #F97316, #E11D48)",
                      }}
                      title="Custom Color"
                    >
                      <div
                        className={`w-full h-full rounded-sm flex items-center justify-center overflow-hidden ${darkMode ? "bg-[#18181b]" : "bg-white"}`}
                      >
                        <div
                          className="w-full h-full rounded-sm"
                          style={{
                            backgroundColor:
                              isCustomColor && tool === "brush"
                                ? selectedColor
                                : "transparent",
                          }}
                        />
                      </div>
                    </button>

                    {isColorPickerOpen && (
                      <div
                        className={`absolute bottom-full right-0 mb-3 p-4 rounded-xl shadow-2xl border w-64 z-100 ${darkMode ? "bg-[#1e1e1e] border-zinc-700" : "bg-white border-zinc-200"}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-xs font-bold uppercase ${darkMode ? "text-zinc-400" : "text-zinc-500"}`}
                          >
                            Color
                          </span>
                          <div
                            className="w-6 h-6 rounded-md shadow-inner border border-black/20"
                            style={{ backgroundColor: selectedColor }}
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={hsl.h}
                            onChange={(e) => {
                              const h = parseInt(e.target.value);
                              setHsl((prev) => ({ ...prev, h }));
                              setSelectedColor(hslToHex(h, hsl.s, hsl.l));
                            }}
                            className="w-full h-3 rounded-full appearance-none outline-none cursor-pointer"
                            style={{
                              background:
                                "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                            }}
                          />
                        </div>
                        <div className="mb-3">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={hsl.s}
                            onChange={(e) => {
                              const s = parseInt(e.target.value);
                              setHsl((prev) => ({ ...prev, s }));
                              setSelectedColor(hslToHex(hsl.h, s, hsl.l));
                            }}
                            className="w-full h-3 rounded-full appearance-none outline-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${hslToHex(hsl.h, 0, hsl.l)}, ${hslToHex(hsl.h, 100, hsl.l)})`,
                            }}
                          />
                        </div>
                        <div className="mb-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={hsl.l}
                            onChange={(e) => {
                              const l = parseInt(e.target.value);
                              setHsl((prev) => ({ ...prev, l }));
                              setSelectedColor(hslToHex(hsl.h, hsl.s, l));
                            }}
                            className="w-full h-3 rounded-full appearance-none outline-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #000, ${hslToHex(hsl.h, hsl.s, 50)}, #fff)`,
                            }}
                          />
                        </div>
                        <div
                          className={`flex items-center px-2 py-1.5 rounded-md border ${darkMode ? "bg-zinc-900 border-zinc-700" : "bg-zinc-50 border-zinc-200"}`}
                        >
                          <span className="text-xs font-mono text-zinc-500 mr-1">
                            #
                          </span>
                          <input
                            type="text"
                            value={selectedColor.replace("#", "").toUpperCase()}
                            onChange={(e) => {
                              const hex = e.target.value;
                              if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
                                setSelectedColor(`#${hex}`);
                              }
                            }}
                            className={`w-full bg-transparent text-xs font-mono uppercase outline-none ${darkMode ? "text-zinc-200" : "text-zinc-800"}`}
                            maxLength={6}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-8 gap-1.5 mb-5">
                  {PALETTE.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setTool("brush");
                      }}
                      className={`w-full aspect-square rounded-md border transition-all hover:scale-110 ${selectedColor === color && tool === "brush" ? "border-blue-500 ring-2 ring-blue-500/30 scale-110 z-10" : "border-black/10 dark:border-white/10"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() =>
                      setPixels(
                        Array(GRID_SIZE * GRID_SIZE).fill("transparent"),
                      )
                    }
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${darkMode ? "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800" : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"}`}
                  >
                    Clear Canvas
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all active:scale-95"
                  >
                    <FiCheck size={14} /> Save Stamp
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
