import React, { useRef, useState, useEffect } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import {
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaTrash,
  FaCloudUploadAlt,
} from "react-icons/fa";

const Images: React.FC<NodeViewProps> = ({
  node,
  updateAttributes,
  deleteNode,
}) => {
  const { src, alt, width, alignment } = node.attrs as {
    src: string;
    alt: string;
    width: string;
    alignment: string;
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Steals cursor focus
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startWidthRef = useRef<number>(0);
  const startXRef = useRef<number>(0);

  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

  // Automatically focus the input when the image loads
  useEffect(() => {
    if (src && inputRef.current) {
      inputRef.current.focus();
    }
  }, [src]);

  // Converts native desktop files into safe base64 text strings for Tauri
  const processImageFile = (file: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateAttributes({ src: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    if (containerRef.current) {
      startWidthRef.current = containerRef.current.offsetWidth;
    }
    startXRef.current = e.clientX;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      let calculatedWidth = startWidthRef.current;

      // Smart alignment calculation
      if (alignment === "center") {
        calculatedWidth += deltaX * 2;
      } else if (alignment === "right") {
        calculatedWidth -= deltaX; // Dragging left scales up a right-aligned image
      } else {
        calculatedWidth += deltaX; // Standard left/default scaling
      }

      const parentWidth =
        containerRef.current?.parentElement?.offsetWidth || 800;
      const finalWidthPercent = Math.min(
        Math.max((calculatedWidth / parentWidth) * 100, 20),
        100,
      );

      updateAttributes({ width: `${finalWidthPercent}%` });
    };

    const stopResize = () => {
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
  };

  return (
    <NodeViewWrapper
      as="div"
      contentEditable={false}
      className={`flex w-50 my-6 relative select-none group ${alignmentClasses[alignment as "left" | "center" | "right"]}`}
    >
      <div
        ref={containerRef}
        style={{ width: width || "100%" }}
        className="relative flex flex-col gap-2.5 border border-transparent hover:border-zinc-200/80 dark:hover:border-zinc-800/80 rounded-xl p-1.5 transition-all duration-200 bg-zinc-50/30 dark:bg-zinc-900/10 backdrop-blur-xs"
      >
        {!src ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) {
                processImageFile(e.dataTransfer.files[0]);
              }
            }}
            className={`w-50 min-h-40 flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging
                ? "border-emerald-500 bg-emerald-50/10"
                : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            }`}
          >
            <FaCloudUploadAlt className="w-8 h-8 text-zinc-400 mb-2 animate-pulse" />
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Drag image here or click below
            </p>
            <label className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 text-[11px] font-medium rounded-md cursor-pointer transition-opacity hover:opacity-90">
              Browse Files
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    processImageFile(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>
        ) : (
          /* If image exists, show Toolbar, Image, and Input */
          <>
            {/* Toolbar pops up on parent container hover */}
            <div
              role="toolbar"
              className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-zinc-950 dark:bg-white border border-zinc-800 dark:border-zinc-200 text-zinc-200 dark:text-zinc-800 px-2 py-1.5 rounded-xl shadow-md transition-opacity duration-200 z-50 text-xs"
            >
              <button
                type="button"
                onClick={() => updateAttributes({ alignment: "left" })}
                className={`p-1 rounded cursor-pointer ${alignment === "left" ? "text-emerald-400" : ""}`}
              >
                <FaAlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateAttributes({ alignment: "center" })}
                className={`p-1 rounded cursor-pointer ${alignment === "center" ? "text-emerald-400" : ""}`}
              >
                <FaAlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => updateAttributes({ alignment: "right" })}
                className={`p-1 rounded cursor-pointer ${alignment === "right" ? "text-emerald-400" : ""}`}
              >
                <FaAlignRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-zinc-800 dark:bg-zinc-200 mx-1" />
              <button
                type="button"
                onClick={deleteNode}
                className="p-1 rounded text-red-400 hover:text-red-500 cursor-pointer"
              >
                <FaTrash className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Display Image Canvas Box with Intelligent Interactive Handles */}
            <div className="relative overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 group/canvas">
              <img
                src={src}
                alt={alt || "Tauri asset"}
                className="w-full h-auto object-contain block pointer-events-none select-none"
              />

              {/* Resizing Hotspot: Automatically shifts sides to preserve natural vector tracking layout anchors */}
              {alignment === "right" ? (
                <div
                  onMouseDown={startResize}
                  className={`resize-handle absolute top-0 left-0 h-full w-2.5 bg-emerald-500/0 hover:bg-emerald-500/40 cursor-ew-resize transition-all ${
                    isResizing ? "bg-emerald-500/50 w-3" : ""
                  }`}
                />
              ) : (
                <div
                  onMouseDown={startResize}
                  className={`resize-handle absolute top-0 right-0 h-full w-2.5 bg-emerald-500/0 hover:bg-emerald-500/40 cursor-ew-resize transition-all ${
                    isResizing ? "bg-emerald-500/50 w-3" : ""
                  }`}
                />
              )}
            </div>

            <div className="px-1 w-full">
              <input
                ref={inputRef}
                type="text"
                value={alt}
                placeholder="Add alternative descriptive text..."
                onChange={(e) => updateAttributes({ alt: e.target.value })}
                className="w-full text-[11px] font-sans font-medium bg-transparent outline-none border-b border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 text-center text-zinc-400 focus:text-zinc-600 dark:text-zinc-500 py-1"
              />
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default Images;
