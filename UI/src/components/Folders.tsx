import React, { useState } from "react";
import type { Folder } from "../assets/SAMPLE";
import { useNavigate } from "react-router-dom";

interface FoldersProps {
  folder: Folder;
  darkMode: boolean;
}

const mixWithWhite = (hex: string, weight: number): string => {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return hex;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const mix = (c: number) => Math.round(c + (255 - c) * weight);
  const toHex = (c: number) => c.toString(16).padStart(2, "0");

  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
};

const Folders: React.FC<FoldersProps> = ({ folder }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const paperColor = mixWithWhite(folder.color, 0.65);
  const paperBorderColor = mixWithWhite(folder.color, 0.4);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-75 h-65 group cursor-pointer select-none transition-transform duration-300 hover:-translate-y-1"
      onClick={() => navigate(`folder/${folder.id}`)}
    >
      {/* ========================================================= */}
      {/* 1. BACK TAB (Top Left)                                    */}
      {/* ========================================================= */}
      <div
        className="absolute top-3 left-0 w-25 h-5 rounded-tl-xl rounded-tr-4xl z-0"
        style={{ backgroundColor: folder.color }}
      />

      {/* ========================================================= */}
      {/* 2. FOLDER BODY (Background)                               */}
      {/* ========================================================= */}
      <div
        className="absolute top-8 inset-x-0 bottom-0 rounded-tr-[10px] rounded-b-[20px] z-0"
        style={{ backgroundColor: folder.color }}
      />

      {/* ========================================================= */}
      {/* 3. STACKED PAPERS (Inside)                                */}
      {/* ========================================================= */}
      <div className="absolute top-19 left-7.5 right-7.5 bottom-0 z-10 pointer-events-none">
        {folder.content.slice(0, 4).map((item, index, slicedArray) => {
          // slicedArray.length will be at most 4, and at least 1
          const total = slicedArray.length;
          const reverseIdx = total - 1 - index;

          const offsetY = reverseIdx * 12;
          const insetX = (total - 1 - reverseIdx) * 12;
          const zIndex = total - reverseIdx;
          const hoverRise = isHovered ? reverseIdx * 32 : 0;

          return (
            <div
              key={item.id}
              className="absolute bottom-0 rounded-t-md border flex justify-center shadow-sm transition-transform duration-300 ease-out"
              style={{
                backgroundColor: paperColor,
                borderColor: paperBorderColor,
                top: `${offsetY}px`,
                left: `${insetX}px`,
                right: `${insetX}px`,
                zIndex: zIndex,
                transform: `translateY(-${hoverRise}px)`,
              }}
            >
              <span className="relative truncate mx-5 top-1 text-[8px] font-mono font-black uppercase text-black/70">
                {item.title || "NOTE"}
              </span>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 4. FRONT FLAP & CONTENT                                   */}
      {/* ========================================================= */}
      {/* DETERMINES THE ROUNDED OF THE FOLDER */}
      <div
        className="absolute bottom-0 inset-x-0 h-30 rounded-b-[10px] z-20 flex flex-col shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.15)]"
        style={{ backgroundColor: folder.color }}
      >
        {/* Title Tab (The raised notch) */}
        <div
          className="flex justify-center w-[calc(50%+4rem)] truncate left-[calc(100%-13.5rem)] rounded-tl-2xl px-4 items-center shadow-[0_-8px_16px_-6px_rgba(0,0,0,0.15)] relative -top-4 py-2 mb-1"
          style={{ backgroundColor: folder.color }}
        >
          <h3 className="text-xs truncate font-semibold text-black tracking-tight leading-none">
            {folder.title}
          </h3>
        </div>

        {/* Description */}
        <p className="px-6 text-[10.5px] font-semibold text-black/70 relative -top-2 leading-[1.4] line-clamp-2">
          {folder.description}
        </p>

        {/* Footer */}
        <div className="mt-auto mb-4 px-6 flex items-center justify-between text-[9px] font-normal text-black/60">
          <div className="flex gap-5">
            <span>{folder.content.length} Items</span>
            <span>{folder.lastUpdatedDate}</span>
          </div>
          <span className="font-mono text-[9px] tracking-wide text-black/50">
            {folder.color.replace("#", "").toUpperCase()}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. CUSTOM ICON STAMP (Top Left Overlay)                   */}
      {/* ========================================================= */}
      {folder.icon && (
        <div className="absolute top-5 left-5 z-30 w-12 h-12 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm rounded-xl shadow-lg border border-black/10 dark:border-white/10 flex items-center justify-center -rotate-6 group-hover:rotate-0 transition-all duration-300">
          {/*  Check if it's an emoji or an image */}
          {folder.icon.startsWith("data:image") ? (
            <img
              src={folder.icon}
              alt="Custom Folder Icon"
              className="w-9 h-9 object-contain [image-rendering:pixelated]"
            />
          ) : (
            <span className="text-2xl">{folder.icon}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default Folders;
