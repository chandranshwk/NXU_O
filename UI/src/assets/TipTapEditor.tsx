import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Strike from "@tiptap/extension-strike";
import { Extension, Mark } from "@tiptap/core";
import Highlight from "@tiptap/extension-highlight";
import type { settingsContextType } from "../contexts/settingsContext";

// 🚀 CENTRALIZED BUNDLE SCHEMA CONFIGURATION
export const getEditorExtensions = ({
  settings,
}: {
  settings: settingsContextType;
}) => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },

    strike: false,
    bulletList: false,
    orderedList: false,
  }),

  TextAlign.configure({
    types: ["heading", "paragraph", "tableCell", "tableHeader"],
  }),
  Strike.extend({
    addKeyboardShortcuts() {
      return {
        [`${settings.defaultStrikeThroughShortcut}`]: () =>
          this.editor.commands.toggleStrike(),
      };
    },
  }),
  Mark.create({
    name: "narratorHighlight",
    parseHTML() {
      return [{ tag: "span[class='narrator-active-highlight']" }];
    },
    renderHTML() {
      return ["span", { class: "narrator-active-highlight" }, 0];
    },
  }),

  // This lightweight command interceptor to your extensions array in src/components/EditorDoc.tsx
  Extension.create({
    name: "headingSizingGuard",
    addCommands() {
      return {
        toggleHeading:
          (attributes: { level: number }) =>
          ({ chain }) => {
            return chain()
              .setMark("textStyle", { fontSize: null })
              .removeEmptyTextStyle()
              .toggleNode("heading", "paragraph", attributes)
              .run();
          },
      };
    },
  }),

  // 3. FIXED: Custom shortcuts component block is pushed inside the extensions array wrapper
  Extension.create({
    name: "customShortcuts",
    addKeyboardShortcuts() {
      return {
        "Mod-Alt-1": () => this.editor.commands.toggleHeading({ level: 1 }),
        "Mod-Alt-2": () => this.editor.commands.toggleHeading({ level: 2 }),
        "Mod-Alt-3": () => this.editor.commands.toggleHeading({ level: 3 }),

        // Remove the dead toggleStrike command line from here to clear duplication

        "Mod-Shift-s": () => {
          console.log("Custom save shortcut fired from text canvas!");
          return true;
        },
      };
    },
  }),
  TextStyle,
  Color,
  FontFamily,
  ListItem,
  Highlight.configure({
    multicolor: true, // Enables choosing different highlighter ink colors later
  }),
  BulletList.configure({
    HTMLAttributes: {
      class: `list-disc pl-5 my-2 space-y-1`,
    },
  }),

  OrderedList.configure({
    HTMLAttributes: {
      class: `list-decimal pl-5 my-2 space-y-1`,
    },
  }),

  Extension.create({
    name: "fontSize",

    addOptions() {
      return {
        types: ["textStyle"],
      };
    },

    addGlobalAttributes() {
      return [
        {
          types: this.options.types,
          attributes: {
            fontSize: {
              default: null,
              parseHTML: (element) =>
                element.style.fontSize?.replace(/['"]+/g, ""),
              renderHTML: (attributes) => {
                if (!attributes.fontSize) return {};
                return { style: `font-size: ${attributes.fontSize}` };
              },
            },
          },
        },
      ];
    },

    addCommands() {
      return {
        setFontSize:
          (fontSize: string) =>
          ({ chain }) => {
            return chain().setMark("textStyle", { fontSize }).focus().run();
          },
        unsetFontSize:
          () =>
          ({ chain }) => {
            return chain()
              .setMark("textStyle", { fontSize: null })
              .focus()
              .removeEmptyTextStyle()
              .run();
          },
      };
    },
  }),

  TableRow,
  TableHeader,
  TableCell.configure({
    HTMLAttributes: {
      // High-density padding, light system border structures
      class:
        "border border-zinc-300 dark:border-zinc-700/80 px-3 py-1.5 min-w-[80px] text-xs font-sans relative",
    },
  }),
  Table.configure({
    resizable: true,
    handleWidth: 5,
    cellMinWidth: 40,
    HTMLAttributes: {
      class:
        "border-collapse table-fixed w-full max-w-full my-4 overflow-hidden rounded-md text-zinc-800 dark:text-zinc-100",
    },
  }),
];
