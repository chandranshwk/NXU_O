import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FolderGroupsComponent } from "./FolderGroupsComponent";

export const FolderGroupsNode = Node.create({
  name: "folderGroups",
  group: "block",
  atom: true, // Makes it act as a single, uneditable block

  addAttributes() {
    return {
      folderId: {
        default: "",
        parseHTML: (el) => el.getAttribute("data-folder-id"),
      },
      darkMode: {
        default: false,
        parseHTML: (el) => el.getAttribute("data-dark-mode") === "true",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="folder-groups"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "folder-groups" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FolderGroupsComponent);
  },
});
