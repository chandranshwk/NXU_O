import { useState, useRef, useEffect } from "react";
import {
  FiArrowLeft,
  FiFolder,
  FiChevronDown,
  FiEdit2,
  FiDroplet,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { type Folder, PRESET_COLORS as COLOR_PALETTE } from "../assets/SAMPLE";
import { useWorkspaceStore } from "../Store/store";
import { PixelIconEditor } from "../components/PixelIconEditor";

interface FolderHeaderProps {
  folder: Folder;
  darkMode: boolean;
}

export const FolderHeader = ({ folder, darkMode }: FolderHeaderProps) => {
  const navigate = useNavigate();

  // Store actions
  const renameFolder = useWorkspaceStore((s) => s.renameFolder);
  const updateFolderColor = useWorkspaceStore((s) => s.updateFolderColor);
  const updateFolderDescription = useWorkspaceStore(
    (s) => s.updateFolderDescription,
  );
  const updateFolderIcon = useWorkspaceStore((s) => s.updateFolderIcon);

  // Local state
  const [title, setTitle] = useState(folder.title);
  const [description, setDescription] = useState(folder.description);
  const [isColorOpen, setIsColorOpen] = useState(false);
  const [isIconEditorOpen, setIsIconEditorOpen] = useState(false);

  const colorRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Sync local state if folder changes externally
  useEffect(() => {
    setTimeout(() => {
      setTitle(folder.title);
      setDescription(folder.description);
    }, 0);
  }, [folder.title, folder.description]);

  // Auto-resize the description textarea
  useEffect(() => {
    if (descRef.current) {
      descRef.current.style.height = "auto";
      descRef.current.style.height = `${descRef.current.scrollHeight}px`;
    }
  }, [description]);

  // Close color picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
        setIsColorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleSave = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== folder.title) {
      renameFolder(folder.id, trimmed);
    } else {
      setTitle(folder.title);
    }
  };

  const handleDescriptionSave = () => {
    if (description !== folder.description) {
      updateFolderDescription(folder.id, description);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto w-full px-12 pt-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-md transition-colors ${
            darkMode
              ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <FiArrowLeft size={14} />
          Folders
        </button>
      </div>

      <header className="max-w-4xl mx-auto w-full px-12 pt-6 pb-12">
        {/*  Icon & Color Picker Container */}
        <div className="flex items-center gap-4 mb-4">
          {/* Custom Pixel Icon Button */}
          <div className="relative group">
            <button
              onClick={() => setIsIconEditorOpen(true)}
              className="w-20 h-20 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 outline-none rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50"
              style={{
                backgroundColor: folder.icon
                  ? "transparent"
                  : folder.color + "20",
                color: folder.color,
              }}
            >
              {folder.icon ? (
                //  Check if it's an emoji or an image
                folder.icon.startsWith("data:image") ? (
                  <img
                    src={folder.icon}
                    alt="Folder Icon"
                    className="w-16 h-16 object-contain [image-rendering:pixelated]"
                  />
                ) : (
                  <span className="text-5xl">{folder.icon}</span>
                )
              ) : (
                <FiFolder size={48} strokeWidth={1.5} />
              )}
            </button>

            {/* Edit Overlay hint */}
            <div className="absolute -bottom-2 -right-2 bg-zinc-800 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <FiEdit2 size={12} />
            </div>
          </div>

          {/* Color Picker Button */}
          <div className="relative" ref={colorRef}>
            <button
              onClick={() => setIsColorOpen((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
                darkMode
                  ? "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                  : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-600"
              }`}
            >
              <FiDroplet size={14} style={{ color: folder.color }} />
              <span className="text-xs font-medium">Color</span>
              <FiChevronDown size={12} className="opacity-50" />
            </button>

            {/* Color Palette Popover */}
            {isColorOpen && (
              <div
                className={`absolute top-full left-0 mt-2 p-3 rounded-xl shadow-xl border grid grid-cols-4 gap-2 z-50 w-48 ${
                  darkMode
                    ? "bg-zinc-900 border-zinc-700"
                    : "bg-white border-zinc-200"
                }`}
              >
                {COLOR_PALETTE.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      updateFolderColor(folder.id, color);
                      setIsColorOpen(false);
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      folder.color === color
                        ? "border-zinc-900 dark:border-white scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Inline Editable Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleTitleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          className={`w-full bg-transparent text-4xl font-bold tracking-tight mb-2 outline-none border-b-2 border-transparent transition-colors focus:border-zinc-300 dark:focus:border-zinc-700 ${
            darkMode
              ? "text-zinc-100 placeholder-zinc-700"
              : "text-zinc-900 placeholder-zinc-300"
          }`}
          placeholder="Untitled Folder"
        />

        {/* Inline Editable Description */}
        <textarea
          ref={descRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleDescriptionSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          rows={1}
          className={`w-full bg-transparent resize-none outline-none text-[15px] leading-relaxed mb-4 border-b-2 border-transparent transition-colors focus:border-zinc-300 dark:focus:border-zinc-700 ${
            darkMode
              ? "text-zinc-400 placeholder-zinc-700"
              : "text-zinc-600 placeholder-zinc-300"
          }`}
          placeholder="Add a description..."
        />

        <div
          className={`text-xs flex items-center gap-2 ${
            darkMode ? "text-zinc-500" : "text-zinc-400"
          }`}
        >
          <span>{folder.content.length} items</span>
          <span>•</span>
          <span>Updated {folder.lastUpdatedDate}</span>
        </div>
      </header>

      {/*  Render the Pixel Editor Modal */}
      {isIconEditorOpen && (
        <PixelIconEditor
          initialIcon={folder.icon}
          darkMode={darkMode}
          onSave={(base64) => {
            updateFolderIcon(folder.id, base64);
            setIsIconEditorOpen(false);
          }}
          onClose={() => setIsIconEditorOpen(false)}
        />
      )}
    </>
  );
};
