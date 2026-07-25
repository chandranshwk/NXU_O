import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import ToDoBoard from "../Helper/ToDoBoard";

export interface ToDoItem {
  id: string;
  text: string;
  done: boolean;
}

export const CustomToDoExtension = Node.create({
  name: "customToDoBlock",
  group: "block",
  atom: true, // Prevents the Tiptap cursor from splitting the board component frame

  addAttributes() {
    return {
      idx: {
        default: 0,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-idx") || "0", 10),
        renderHTML: (attributes) => ({ "data-idx": attributes.idx }),
      },
      title: {
        default: "Project Task List",
        parseHTML: (element) => element.getAttribute("data-title") || "",
        renderHTML: (attributes) => ({ "data-title": attributes.title }),
      },
      // 🚀 FIXED: Tracks your dynamic internal array schema of multiple child todos inside a single block
      items: {
        default: [] as ToDoItem[],
        parseHTML: (element) => {
          try {
            return JSON.parse(element.getAttribute("data-items") || "[]");
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          "data-items": JSON.stringify(attributes.items),
        }),
      },
      time: {
        default: () =>
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        parseHTML: (element) => element.getAttribute("data-time") || "",
        renderHTML: (attributes) => ({ "data-time": attributes.time }),
      },
      date: {
        default: () =>
          new Date().toLocaleDateString([], { dateStyle: "medium" }),
        parseHTML: (element) => element.getAttribute("data-date") || "",
        renderHTML: (attributes) => ({ "data-date": attributes.date }),
      },
    };
  },

  // 🚀 FIXED: Point tag parsing hooks explicitly to custom-todo-board targets
  parseHTML() {
    return [{ tag: 'div[data-type="custom-todo-board"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "custom-todo-board" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(
      ({ node, updateAttributes, selected }) => {
        const { idx, title, items, time, date } = node.attrs;

        return (
          <NodeViewWrapper as="div" className="w-full clear-both my-4">
            {/* 🚀 FIXED: Renders the actual interactive ToDoBoard container component */}
            <ToDoBoard
              idx={idx}
              title={title}
              items={items}
              time={time}
              date={date}
              updateAttributes={updateAttributes}
              selected={selected}
            />
          </NodeViewWrapper>
        );
      },
      {
        // 🚀 FIXED: Aligned node type tracking name exactly with customToDoBlock
        update: ({ newNode }) => newNode.type.name === "customToDoBlock",
      },
    );
  },

  addCommands() {
    return {
      // 🚀 FIXED: Standardized signature matching to use the correct command parameters and runner chains
      insertCustomToDo:
        (attributes?: {
          idx?: number;
          title: string;
          items?: ToDoItem[];
          time: string;
          date: string;
        }) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: {
                ...attributes,
                items: attributes?.items || [
                  { id: crypto.randomUUID(), text: "", done: false },
                ],
              },
            })
            .run();
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customToDoBlock: {
      // 🚀 FIXED: Aligned TypeScript definitions to accept the right parameters
      insertCustomToDo: (attributes?: {
        idx?: number;
        title: string;
        items?: ToDoItem[];
        time: string;
        date: string;
      }) => ReturnType;
    };
  }
}
