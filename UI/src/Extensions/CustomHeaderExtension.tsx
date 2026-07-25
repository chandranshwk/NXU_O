import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import Header from "../Helper/Header";

export const CustomHeaderExtension = Node.create({
  name: "customHeaderBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      idx: {
        default: 0,
        parseHTML: (element) =>
          parseInt(element.getAttribute("data-idx") || "0", 10),
        renderHTML: (attributes) => ({ "data-idx": attributes.idx }),
      },
      name: {
        default: "Default Header Name",
        parseHTML: (element) => element.getAttribute("data-name"),
        renderHTML: (attributes) => ({ "data-name": attributes.name }),
      },
      time: {
        default: () =>
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        parseHTML: (element) => element.getAttribute("data-time"),
        renderHTML: (attributes) => ({ "data-time": attributes.time }),
      },
      date: {
        default: () =>
          new Date().toLocaleDateString([], {
            dateStyle: "medium",
          }),
        parseHTML: (element) => element.getAttribute("data-date"),
        renderHTML: (attributes) => ({ "data-date": attributes.date }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="custom-header-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "custom-header-block" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(
      ({ node, updateAttributes, selected }) => {
        const { idx, name, time, date } = node.attrs;

        return (
          <NodeViewWrapper
            as="div"
            className="inline-sticky w-full clear-both my-2"
            data-id={`custom-header-${idx}`}
            data-idx={idx}
          >
            <Header
              idx={idx}
              name={name}
              time={time}
              date={date}
              updateAttributes={updateAttributes}
              selected={selected}
            />
          </NodeViewWrapper>
        );
      },
      {
        update: ({ newNode }) => newNode.type.name === "customHeaderBlock",
      },
    );
  },

  addCommands() {
    return {
      insertCustomHeader:
        (attributes?: {
          idx?: number;
          name: string;
          time: string;
          date: string;
        }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customHeaderBlock: {
      insertCustomHeader: (attributes?: {
        idx?: number;
        name: string;
        time: string;
        date: string;
      }) => ReturnType;
    };
  }
}
