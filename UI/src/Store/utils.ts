import type { MockNotebook, MockPage, MockPageNode } from "../assets/SAMPLE";
import type { NodeComponentType } from "./types";

export interface TreeUpdateResult {
  notebooks: MockNotebook[];
  activeNotebook: MockNotebook | null;
}

/** Immutably replaces one item in an array by id; leaves siblings untouched. */
export function updateItemById<T extends { id: string }>(
  items: T[],
  id: string,
  updater: (item: T) => T,
): T[] {
  return items.map((item) => (item.id === id ? updater(item) : item));
}

/** Immutably removes one item from an array by id; leaves siblings untouched. */
export function removeItemById<T extends { id: string }>(
  items: T[],
  id: string,
): T[] {
  return items.filter((item) => item.id !== id);
}

/** Applies an updater to a single notebook, capturing the refreshed active ref. */
export function mapNotebook(
  notebooks: MockNotebook[],
  notebookId: string,
  updater: (notebook: MockNotebook) => MockNotebook,
): TreeUpdateResult {
  let activeNotebook: MockNotebook | null = null;
  const next = notebooks.map((notebook) => {
    if (notebook.id !== notebookId) return notebook;
    const updated = updater(notebook);
    activeNotebook = updated;
    return updated;
  });
  return { notebooks: next, activeNotebook };
}

/** Applies an updater to a single page inside a notebook. */
export function mapPage(
  notebooks: MockNotebook[],
  notebookId: string,
  pageId: string,
  updater: (page: MockPage) => MockPage,
): TreeUpdateResult {
  return mapNotebook(notebooks, notebookId, (notebook) => ({
    ...notebook,
    pages: updateItemById(notebook.pages, pageId, updater),
  }));
}

/** Applies an updater to a single node inside a page. */
export function mapNode(
  notebooks: MockNotebook[],
  notebookId: string,
  pageId: string,
  nodeId: string,
  updater: (node: MockPageNode) => MockPageNode,
): TreeUpdateResult {
  return mapPage(notebooks, notebookId, pageId, (page) => ({
    ...page,
    nodes: updateItemById(page.nodes, nodeId, updater),
  }));
}

/** Applies an updater to a single page's print zone. */
export function mapPrintZone(
  notebooks: MockNotebook[],
  notebookId: string,
  pageId: string,
  updater: (zone: MockPage["printZone"]) => MockPage["printZone"],
): TreeUpdateResult {
  return mapPage(notebooks, notebookId, pageId, (page) => ({
    ...page,
    printZone: updater(page.printZone),
  }));
}

/** Returns a date string and an `HH:MM` time string for the current instant. */
export function generateTimestamp(): {
  createdDate: string;
  createdTime: string;
} {
  const now = new Date();
  const createdDate = now.toISOString().split("T")[0];
  const [hours, minutes] = now.toTimeString().split(" ")[0].split(":");
  return { createdDate, createdTime: `${hours}:${minutes}` };
}

// ─────────────────────────────────────────────────────────────
// Node construction
// ─────────────────────────────────────────────────────────────

/** Spatial defaults per canvas node type. Exhaustive by design. */
const NODE_DEFAULTS: Record<
  NodeComponentType,
  { width: number; height: number }
> = {
  text: { width: 550, height: 180 },
  map: { width: 400, height: 320 },
};

/**
 * Builds a fully-formed `MockPageNode` from a type identifier.
 * `cascadeIndex` staggers new cards so they don't stack on top of each other.
 */
export function createNode(
  type: NodeComponentType,
  cascadeIndex = 0,
): MockPageNode {
  const size = NODE_DEFAULTS[type];
  const step = 28;

  return {
    id: crypto.randomUUID(),
    type,
    x: 80 + cascadeIndex * step,
    y: 80 + cascadeIndex * step,
    width: size.width,
    height: size.height,
    content: "",
    backgroundColor: "#ffffff",
  };
}
