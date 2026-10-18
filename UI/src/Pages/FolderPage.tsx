import { useEffect, useMemo, useState, useRef } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { FiFolder, FiPlus, FiBook, FiCode, FiSearch } from "react-icons/fi";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useWorkspaceStore } from "../Store/store";
import type { Folder, MockNotebook } from "../assets/SAMPLE";
import type { CodeFile } from "./CodeIDE.SAMPLE";

import { FolderHeader } from "./FolderHeader";
import { SortableGroup } from "./SortableGroup";
import { SortableRow } from "./SortableRow";

// ── Type guards ───────────────────────────────────────────────────
const isNotebook = (
  item: CodeFile | MockNotebook | Folder,
): item is MockNotebook => "pages" in item && "events" in item;
const isCodeFile = (item: CodeFile | MockNotebook | Folder): item is CodeFile =>
  "titleSlug" in item && "examples" in item;
const isFolder = (item: CodeFile | MockNotebook | Folder): item is Folder =>
  "content" in item && "color" in item;

// ── Main Component ────────────────────────────────────────────────
const FolderContent = () => {
  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const folders = useWorkspaceStore((s) => s.folders);
  const notebooks = useWorkspaceStore((s) => s.notebooks);
  const codeFiles = useWorkspaceStore((s) => s.codeFiles);

  const initializeData = useWorkspaceStore((s) => s.initializeData);
  const reorderFolderContent = useWorkspaceStore((s) => s.reorderFolderContent);
  const updateFolderBody = useWorkspaceStore((s) => s.updateFolderBody);
  const updateFolderFooter = useWorkspaceStore((s) => s.updateFolderFooter);
  const addItemToFolder = useWorkspaceStore((s) => s.addItemToFolder);

  const [activeId, setActiveId] = useState<string | null>(null);

  //  State for the "Add Item" Dropdown & Search
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const addMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Close Add Menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addMenuRef.current &&
        !addMenuRef.current.contains(event.target as Node)
      ) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //  Auto-focus search input when menu opens, and clear on close
  useEffect(() => {
    if (isAddMenuOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setTimeout(() => {
        setSearchQuery("");
      }, 0);
    }
  }, [isAddMenuOpen]);

  const folder: Folder | undefined = folders.find((f) => f.id === id);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const groupOrder = useMemo(() => {
    if (!folder) return [];
    if (folder.content.length === 0)
      return ["group-notebooks", "group-problems", "group-folders"];
    const first = folder.content[0];
    if (isFolder(first))
      return ["group-folders", "group-notebooks", "group-problems"];
    if (isNotebook(first))
      return ["group-notebooks", "group-problems", "group-folders"];
    return ["group-problems", "group-notebooks", "group-folders"];
  }, [folder]);

  if (!folder) {
    return (
      <div
        className={`h-screen w-full flex flex-col items-center justify-center gap-3 ${darkMode ? "bg-[#191919] text-zinc-500" : "bg-white text-zinc-500"}`}
      >
        <FiFolder size={32} />
        <span className="text-sm font-medium">Locating folder…</span>
      </div>
    );
  }

  const nestedFolders = folder.content.filter(isFolder);
  const folderNotebooks = folder.content.filter(isNotebook);
  const folderCodeFiles = folder.content.filter(isCodeFile);

  //  Filter available items and apply search query
  const existingIds = folder.content.map((c) => c.id.toString());

  const availableNotebooks = notebooks
    .filter((n) => !existingIds.includes(n.id.toString()))
    .filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const availableCodeFiles = codeFiles
    .filter((c) => !existingIds.includes(c.id.toString()))
    .filter((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const hasResults =
    availableNotebooks.length > 0 || availableCodeFiles.length > 0;

  const handleDragStart = (event: DragStartEvent) =>
    setActiveId(event.active.id.toString());

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId.startsWith("group-")) {
      const oldIndex = groupOrder.indexOf(activeId);
      const newIndex = groupOrder.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(groupOrder, oldIndex, newIndex);
      const newContent: (MockNotebook | CodeFile | Folder)[] = [];
      for (const group of newOrder) {
        if (group === "group-folders") newContent.push(...nestedFolders);
        if (group === "group-notebooks") newContent.push(...folderNotebooks);
        if (group === "group-problems") newContent.push(...folderCodeFiles);
      }
      reorderFolderContent(folder.id, newContent);
      return;
    }

    let newNotebooks = [...folderNotebooks];
    let newCodeFiles = [...folderCodeFiles];
    let newFolders = [...nestedFolders];

    if (folderNotebooks.some((n) => n.id.toString() === activeId)) {
      const oldIndex = folderNotebooks.findIndex(
        (n) => n.id.toString() === activeId,
      );
      const newIndex = folderNotebooks.findIndex(
        (n) => n.id.toString() === overId,
      );
      if (oldIndex !== -1 && newIndex !== -1)
        newNotebooks = arrayMove(folderNotebooks, oldIndex, newIndex);
    } else if (nestedFolders.some((f) => f.id.toString() === activeId)) {
      const oldIndex = nestedFolders.findIndex(
        (f) => f.id.toString() === activeId,
      );
      const newIndex = nestedFolders.findIndex(
        (f) => f.id.toString() === overId,
      );
      if (oldIndex !== -1 && newIndex !== -1)
        newFolders = arrayMove(nestedFolders, oldIndex, newIndex);
    } else {
      const oldIndex = folderCodeFiles.findIndex(
        (c) => c.id.toString() === activeId,
      );
      const newIndex = folderCodeFiles.findIndex(
        (c) => c.id.toString() === overId,
      );
      if (oldIndex !== -1 && newIndex !== -1)
        newCodeFiles = arrayMove(folderCodeFiles, oldIndex, newIndex);
    }

    const newContent: (MockNotebook | CodeFile | Folder)[] = [];
    for (const group of groupOrder) {
      if (group === "group-folders") newContent.push(...newFolders);
      if (group === "group-notebooks") newContent.push(...newNotebooks);
      if (group === "group-problems") newContent.push(...newCodeFiles);
    }
    reorderFolderContent(folder.id, newContent);
  };

  const activeNotebook = folderNotebooks.find(
    (n) => n.id.toString() === activeId,
  );
  const activeCodeFile = folderCodeFiles.find(
    (c) => c.id.toString() === activeId,
  );
  const activeFolder = nestedFolders.find((f) => f.id.toString() === activeId);
  const activeGroup = groupOrder.find((g) => g === activeId);

  const textAreaClass = `w-full resize-none bg-transparent outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-[15px] leading-relaxed ${
    darkMode ? "text-zinc-300" : "text-zinc-800"
  }`;

  const handleAdd = (item: MockNotebook | CodeFile | Folder) => {
    addItemToFolder(folder.id, item);
    setIsAddMenuOpen(false);
  };

  return (
    <div
      className={`h-screen w-full overflow-y-auto font-sans ${darkMode ? "bg-[#191919] text-zinc-200" : "bg-white text-zinc-900"}`}
    >
      <FolderHeader folder={folder} darkMode={darkMode} />

      <div className="max-w-4xl mx-auto w-full px-12 pt-4">
        {/* TOP TEXTAREA */}
        <textarea
          value={folder.body || ""}
          onChange={(e) => updateFolderBody(folder.id, e.target.value)}
          placeholder="Write notes, descriptions, or thoughts . . ."
          rows={3}
          className={textAreaClass}
        />
        {/*  TOOLBAR WITH ADD BUTTON */}
        <div className="flex items-center justify-between mt-8 mb-2">
          <h2
            className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
          >
            Folder Contents
          </h2>

          <div className="relative" ref={addMenuRef}>
            <button
              onClick={() => setIsAddMenuOpen((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                darkMode
                  ? "bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-200"
                  : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              <FiPlus size={14} />
              Add Item
            </button>

            {/*  THE NOTION-STYLE DROPDOWN MENU */}
            {isAddMenuOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-85 rounded-xl shadow-2xl border flex flex-col overflow-hidden z-50 ${
                  darkMode
                    ? "bg-[#202020] border-zinc-800"
                    : "bg-white border-zinc-200"
                }`}
              >
                {/* Search Input Area */}
                <div
                  className={`flex items-center gap-2 px-3 py-2 border-b ${darkMode ? "border-zinc-800" : "border-zinc-100"}`}
                >
                  <FiSearch
                    size={16}
                    className={darkMode ? "text-zinc-500" : "text-zinc-400"}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-transparent text-sm outline-none ${
                      darkMode
                        ? "text-zinc-200 placeholder:text-zinc-600"
                        : "text-zinc-800 placeholder:text-zinc-400"
                    }`}
                  />
                </div>

                {/* Scrollable Results */}
                <div className="max-h-80 overflow-y-auto p-1.5">
                  {!hasResults && (
                    <div
                      className={`px-3 py-6 text-center text-xs ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      No items found.
                    </div>
                  )}

                  {/* Notebooks Section */}
                  {availableNotebooks.length > 0 && (
                    <div className="mb-1">
                      <div
                        className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Notebooks
                      </div>
                      {availableNotebooks.map((nb) => (
                        <button
                          key={nb.id}
                          onClick={() => handleAdd(nb)}
                          className={`w-full flex items-center gap-3 px-2 py-1.5 text-[14px] rounded-md text-left transition-colors ${
                            darkMode
                              ? "hover:bg-zinc-800/80 text-zinc-300"
                              : "hover:bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          <div className="w-6 h-6 rounded flex items-center justify-center bg-blue-500/10 shrink-0">
                            <FiBook size={14} className="text-blue-500" />
                          </div>
                          <span className="truncate">{nb.title}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Code Files Section */}
                  {availableCodeFiles.length > 0 && (
                    <div>
                      <div
                        className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
                      >
                        Code Problems
                      </div>
                      {availableCodeFiles.map((cf) => (
                        <button
                          key={cf.id}
                          onClick={() => handleAdd(cf)}
                          className={`w-full flex items-center gap-3 px-2 py-1.5 text-[14px] rounded-md text-left transition-colors ${
                            darkMode
                              ? "hover:bg-zinc-800/80 text-zinc-300"
                              : "hover:bg-zinc-100 text-zinc-700"
                          }`}
                        >
                          <div className="w-6 h-6 rounded flex items-center justify-center bg-emerald-500/10 shrink-0">
                            <FiCode size={14} className="text-emerald-500" />
                          </div>
                          <span className="truncate">{cf.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* THE GROUPS */}
        <div className="pb-8">
          {folder.content.length === 0 && (
            <div
              className={`py-10 text-sm ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
            >
              This folder is empty. Click "Add Item" to get started.
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={groupOrder}
              strategy={verticalListSortingStrategy}
            >
              {groupOrder.map((group) => {
                if (group === "group-folders" && nestedFolders.length > 0) {
                  return (
                    <SortableGroup
                      key={group}
                      id={group}
                      title="Folders"
                      darkMode={darkMode}
                    >
                      <SortableContext
                        items={nestedFolders.map((f) => f.id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col">
                          {nestedFolders.map((nestedFolder) => (
                            <SortableRow
                              key={nestedFolder.id}
                              item={nestedFolder}
                              isNotebook={false}
                              isFolder={true}
                              darkMode={darkMode}
                              onNavigate={() =>
                                navigate(`/folder/${nestedFolder.id}`)
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </SortableGroup>
                  );
                }
                if (group === "group-notebooks" && folderNotebooks.length > 0) {
                  return (
                    <SortableGroup
                      key={group}
                      id={group}
                      title="Notebooks"
                      darkMode={darkMode}
                    >
                      <SortableContext
                        items={folderNotebooks.map((n) => n.id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col">
                          {folderNotebooks.map((nb) => (
                            <SortableRow
                              key={nb.id}
                              item={nb}
                              isNotebook={true}
                              isFolder={false}
                              darkMode={darkMode}
                              onNavigate={() => navigate(`/document/${nb.id}`)}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </SortableGroup>
                  );
                }
                if (group === "group-problems" && folderCodeFiles.length > 0) {
                  return (
                    <SortableGroup
                      key={group}
                      id={group}
                      title="Problems"
                      darkMode={darkMode}
                    >
                      <SortableContext
                        items={folderCodeFiles.map((c) => c.id.toString())}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="flex flex-col">
                          {folderCodeFiles.map((file) => (
                            <SortableRow
                              key={file.id}
                              item={file}
                              isNotebook={false}
                              isFolder={false}
                              darkMode={darkMode}
                              onNavigate={() =>
                                navigate(`/code/${file.titleSlug}`)
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </SortableGroup>
                  );
                }
                return null;
              })}
            </SortableContext>

            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeFolder ? (
                <SortableRow
                  item={activeFolder}
                  isNotebook={false}
                  isFolder={true}
                  darkMode={darkMode}
                  onNavigate={() => {}}
                  isOverlay
                />
              ) : activeNotebook ? (
                <SortableRow
                  item={activeNotebook}
                  isNotebook={true}
                  isFolder={false}
                  darkMode={darkMode}
                  onNavigate={() => {}}
                  isOverlay
                />
              ) : activeCodeFile ? (
                <SortableRow
                  item={activeCodeFile}
                  isNotebook={false}
                  isFolder={false}
                  darkMode={darkMode}
                  onNavigate={() => {}}
                  isOverlay
                />
              ) : activeGroup ? (
                <SortableGroup
                  id={activeGroup}
                  title={
                    activeGroup === "group-folders"
                      ? "Folders"
                      : activeGroup === "group-notebooks"
                        ? "Notebooks"
                        : "Problems"
                  }
                  darkMode={darkMode}
                  isOverlay
                >
                  <div className="flex flex-col opacity-40 pointer-events-none">
                    {activeGroup === "group-folders"
                      ? nestedFolders.map((f) => (
                          <SortableRow
                            key={f.id}
                            item={f}
                            isNotebook={false}
                            isFolder={true}
                            darkMode={darkMode}
                            onNavigate={() => {}}
                            isOverlay
                          />
                        ))
                      : activeGroup === "group-notebooks"
                        ? folderNotebooks.map((nb) => (
                            <SortableRow
                              key={nb.id}
                              item={nb}
                              isNotebook={true}
                              isFolder={false}
                              darkMode={darkMode}
                              onNavigate={() => {}}
                              isOverlay
                            />
                          ))
                        : folderCodeFiles.map((file) => (
                            <SortableRow
                              key={file.id}
                              item={file}
                              isNotebook={false}
                              isFolder={false}
                              darkMode={darkMode}
                              onNavigate={() => {}}
                              isOverlay
                            />
                          ))}
                  </div>
                </SortableGroup>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
        {/* BOTTOM TEXTAREA */}
        <textarea
          value={folder.footer || ""}
          onChange={(e) => updateFolderFooter(folder.id, e.target.value)}
          placeholder="Write footers . . ."
          rows={3}
          className={textAreaClass}
        />
        <div className="h-32" /> {/* Spacer for scrolling */}
      </div>
    </div>
  );
};

export default FolderContent;
