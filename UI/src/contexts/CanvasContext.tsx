import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";

// 1. Define the interface for the context state
interface CanvasContextType {
  zoom: number;
  setZoom: React.Dispatch<SetStateAction<number>>;
  panning: boolean;
  setPanning: React.Dispatch<SetStateAction<boolean>>;
  isDrawing: boolean;
  setIsDrawing: React.Dispatch<SetStateAction<boolean>>;
  isErasing: boolean;
  setIsErasing: React.Dispatch<SetStateAction<boolean>>;
  isSelectMode: boolean;
  setIsSelectMode: React.Dispatch<SetStateAction<boolean>>;
}

// 2. Create the context with an undefined default value
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// 3. Create the provider component
export const CanvasProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // Initialize zoom at 1 (100%)
  const [zoom, setZoom] = useState<number>(() => {
    try {
      const savedZoom = localStorage.getItem("canvas-zoom");
      return savedZoom !== null ? parseFloat(savedZoom) : 1.0;
    } catch (error) {
      console.warn("Failed to parse canvas-zoom from localStorage:", error);
      return 1.0;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem("canvas-zoom", zoom.toString());
    } catch (error) {
      console.warn(
        "Failed to persist canvas-zoom state to localStorage:",
        error,
      );
    }
  }, [zoom]);
  const [panning, setPanning] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [isSelectMode, setIsSelectMode] = useState<boolean>(true);

  return (
    <CanvasContext.Provider
      value={{
        zoom,
        setZoom,
        panning,
        setPanning,
        isDrawing,
        setIsDrawing,
        isErasing,
        setIsErasing,
        isSelectMode,
        setIsSelectMode,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};

/* eslint-disable react-refresh/only-export-components */
export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
};
