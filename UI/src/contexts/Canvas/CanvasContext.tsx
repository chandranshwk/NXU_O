import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { NodeComponentType } from "./CanvasNodeWrapper";
import { useWorkspaceStore } from "../../Store/store";

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
  widgetOpen: boolean;
  setWidgetOpen: React.Dispatch<SetStateAction<boolean>>;

  /** Currently focused page — required by store-bound actions. */
  activePageId: string | null;
  setActivePageId: React.Dispatch<SetStateAction<string | null>>;

  /** Currently focused node id, or null when nothing is selected. */
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<SetStateAction<string | null>>;

  /** Constructs a node of the given type and appends it to the active page. */
  addNode: (type: NodeComponentType) => void;

  /** Removes the currently selected node from the active page. */
  deleteSelectedNode: () => void;
}

// 2. Create the context with an undefined default value
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// 3. Create the provider component
export const CanvasProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // ── Viewport state ───────────────────────────────────────────
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
  const [widgetOpen, setWidgetOpen] = useState<boolean>(false);

  // ── Active target state ──────────────────────────────────────
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Clear node selection whenever the active page changes — a stale id
  // would otherwise linger and target the wrong page on delete.
  useEffect(() => {
    setTimeout(() => {
      setSelectedNodeId(null);
    }, 0);
  }, [activePageId]);

  // ── Store-bound action: add node ─────────────────────────────
  const addNode = useCallback(
    (type: NodeComponentType) => {
      const { activeNotebook, addNodeToPage } = useWorkspaceStore.getState();

      if (!activeNotebook || !activePageId) {
        console.warn("[addNode] missing active target", {
          notebookId: activeNotebook?.id,
          activePageId,
        });
        return;
      }

      addNodeToPage(activeNotebook.id, activePageId, type);
    },
    [activePageId],
  );

  // ── Store-bound action: delete selected node ─────────────────
  const deleteSelectedNode = useCallback(() => {
    const { activeNotebook, deleteNodeFromPage } = useWorkspaceStore.getState();

    if (!activeNotebook || !activePageId || !selectedNodeId) {
      console.warn("[deleteSelectedNode] missing target", {
        notebookId: activeNotebook?.id,
        activePageId,
        selectedNodeId,
      });
      return;
    }

    deleteNodeFromPage(activeNotebook.id, activePageId, selectedNodeId);
    setSelectedNodeId(null);
  }, [activePageId, selectedNodeId]);

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
        widgetOpen,
        setWidgetOpen,
        activePageId,
        setActivePageId,
        selectedNodeId,
        setSelectedNodeId,
        addNode,
        deleteSelectedNode,
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
