import { useState, useMemo } from "react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useNavigate } from "react-router-dom";
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
import type { CodeFile } from "../Pages/CodeIDE.SAMPLE";
import { SortableGroup } from "../Pages/SortableGroup";
import { SortableRow } from "../Pages/SortableRow";

const isNotebook = (
  item: CodeFile | MockNotebook | Folder,
): item is MockNotebook => "pages" in item && "events" in item;
const isCodeFile = (item: CodeFile | MockNotebook | Folder): item is CodeFile =>
  "titleSlug" in item && "examples" in item;
const isFolder = (item: CodeFile | MockNotebook | Folder): item is Folder =>
  "content" in item && "color" in item;

export const FolderGroupsComponent = (props: NodeViewProps) => {
  const { folderId, darkMode } = props.node.attrs;
  const navigate = useNavigate();

  const folders = useWorkspaceStore((s) => s.folders);
  const reorderFolderContent = useWorkspaceStore((s) => s.reorderFolderContent);

  const [activeId, setActiveId] = useState<string | null>(null);

  const folder: Folder | undefined = folders.find((f) => f.id === folderId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const groupOrder = useMemo(() => {
    if (!folder || folder.content.length === 0)
      return ["group-notebooks", "group-problems", "group-folders"];
    const first = folder.content[0];
    if (isFolder(first))
      return ["group-folders", "group-notebooks", "group-problems"];
    if (isNotebook(first))
      return ["group-notebooks", "group-problems", "group-folders"];
    return ["group-problems", "group-notebooks", "group-folders"];
  }, [folder]);

  if (!folder) return null;

  const notebooks = folder.content.filter(isNotebook);
  const codeFiles = folder.content.filter(isCodeFile);
  const nestedFolders = folder.content.filter(isFolder);

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
        if (group === "group-notebooks") newContent.push(...notebooks);
        if (group === "group-problems") newContent.push(...codeFiles);
      }
      reorderFolderContent(folder.id, newContent);
      return;
    }

    let newNotebooks = [...notebooks];
    let newCodeFiles = [...codeFiles];
    let newFolders = [...nestedFolders];

    if (notebooks.some((n) => n.id.toString() === activeId)) {
      const oldIndex = notebooks.findIndex((n) => n.id.toString() === activeId);
      const newIndex = notebooks.findIndex((n) => n.id.toString() === overId);
      if (oldIndex !== -1 && newIndex !== -1)
        newNotebooks = arrayMove(notebooks, oldIndex, newIndex);
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
      const oldIndex = codeFiles.findIndex((c) => c.id.toString() === activeId);
      const newIndex = codeFiles.findIndex((c) => c.id.toString() === overId);
      if (oldIndex !== -1 && newIndex !== -1)
        newCodeFiles = arrayMove(codeFiles, oldIndex, newIndex);
    }

    const newContent: (MockNotebook | CodeFile | Folder)[] = [];
    for (const group of groupOrder) {
      if (group === "group-folders") newContent.push(...newFolders);
      if (group === "group-notebooks") newContent.push(...newNotebooks);
      if (group === "group-problems") newContent.push(...newCodeFiles);
    }
    reorderFolderContent(folder.id, newContent);
  };

  const activeNotebook = notebooks.find((n) => n.id.toString() === activeId);
  const activeCodeFile = codeFiles.find((c) => c.id.toString() === activeId);
  const activeFolder = nestedFolders.find((f) => f.id.toString() === activeId);
  const activeGroup = groupOrder.find((g) => g === activeId);

  return (
    <NodeViewWrapper className="my-8" contentEditable={false}>
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
                      {nestedFolders.map((f) => (
                        <SortableRow
                          key={f.id}
                          item={f}
                          isNotebook={false}
                          isFolder={true}
                          darkMode={darkMode}
                          onNavigate={() => navigate(`/folder/${f.id}`)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </SortableGroup>
              );
            }
            if (group === "group-notebooks" && notebooks.length > 0) {
              return (
                <SortableGroup
                  key={group}
                  id={group}
                  title="Notebooks"
                  darkMode={darkMode}
                >
                  <SortableContext
                    items={notebooks.map((n) => n.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col">
                      {notebooks.map((nb) => (
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
            if (group === "group-problems" && codeFiles.length > 0) {
              return (
                <SortableGroup
                  key={group}
                  id={group}
                  title="Problems"
                  darkMode={darkMode}
                >
                  <SortableContext
                    items={codeFiles.map((c) => c.id.toString())}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col">
                      {codeFiles.map((c) => (
                        <SortableRow
                          key={c.id}
                          item={c}
                          isNotebook={false}
                          isFolder={false}
                          darkMode={darkMode}
                          onNavigate={() => navigate(`/code/${c.titleSlug}`)}
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
                    ? notebooks.map((nb) => (
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
                    : codeFiles.map((c) => (
                        <SortableRow
                          key={c.id}
                          item={c}
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
    </NodeViewWrapper>
  );
};
