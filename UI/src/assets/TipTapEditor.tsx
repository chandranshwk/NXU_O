import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Strike from "@tiptap/extension-strike";
import { Extension, Mark } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/extension-bubble-menu";
import Suggestion from "@tiptap/suggestion";

import type { settingsContextType } from "../contexts/settingsContext";
import { CustomHeaderExtension } from "../Extensions/CustomHeaderExtension";
import { CustomToDoExtension } from "../Extensions/CustomToDoExtensions";
import { CustomImageBlockExtension } from "../Extensions/CustomImageExtension";
import { suggestionConfig } from "../assets/Suggestion";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textStyleColors: {
      unsetColor: () => ReturnType;
      unsetBackgroundColor: () => ReturnType;
    };
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
  }
}

export const getEditorExtensions = ({
  settings,
}: {
  settings: settingsContextType;
}) => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    paragraph: {
      HTMLAttributes: {
        class: "transition-colors duration-150 rounded-lg",
      },
    },
    strike: false,
    bulletList: false,
    orderedList: false,
  }),
  CustomHeaderExtension,
  CustomToDoExtension,
  CustomImageBlockExtension,

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
  Extension.create({
    name: "headingSizingGuard",
    addCommands() {
      return {
        toggleHeading:
          (attributes: { level: number }) =>
          ({ chain }) => {
            return chain()
              .updateAttributes("textStyle", { fontSize: null })
              .toggleNode("heading", "paragraph", attributes)
              .run();
          },
      };
    },
  }),

  Extension.create({
    name: "customShortcuts",
    addKeyboardShortcuts() {
      return {
        "Mod-Alt-1": () => this.editor.commands.toggleHeading({ level: 1 }),
        "Mod-Alt-2": () => this.editor.commands.toggleHeading({ level: 2 }),
        "Mod-Alt-3": () => this.editor.commands.toggleHeading({ level: 3 }),
        "Mod-Shift-s": () => {
          console.log("Custom save shortcut fired from text canvas!");
          return true;
        },
      };
    },
  }),

  TextStyle.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          parseHTML: (element) => element.style.backgroundColor || null,
          renderHTML: (attributes) => {
            if (!attributes.backgroundColor) return {};
            return { style: `background-color: ${attributes.backgroundColor}` };
          },
        },
      };
    },
    addCommands() {
      return {
        unsetColor:
          () =>
          ({ chain }) => {
            return chain()
              .setMark("textStyle", { color: "" })
              .updateAttributes("textStyle", { color: null })
              .run();
          },
        unsetBackgroundColor:
          () =>
          ({ chain, state, dispatch }) => {
            if (dispatch) {
              const { tr } = state;
              const { from, to } = state.selection;

              tr.addMark(
                from,
                to,
                state.schema.marks.textStyle.create({ backgroundColor: null }),
              );

              tr.removeMark(from, to, state.schema.marks.textStyle);
              dispatch(tr);
            }

            return chain()
              .setMark("textStyle", { backgroundColor: "" })
              .updateAttributes("textStyle", { backgroundColor: null })
              .run();
          },
      };
    },
  }),

  Color,
  FontFamily,
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
              .updateAttributes("textStyle", { fontSize: null })
              .focus()
              .run();
          },
      };
    },
  }),

  TableRow,
  TableHeader,
  TableCell.configure({
    HTMLAttributes: {
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

  BubbleMenu.configure({}),

  Extension.create({
    name: "blockStylePersistenceSchema",
    addGlobalAttributes() {
      return [
        {
          types: ["paragraph", "heading"],
          attributes: {
            backgroundColor: {
              default: null,
              parseHTML: (element) =>
                element.getAttribute("data-background-color") ||
                element.style.backgroundColor ||
                null,
              renderHTML: (attributes) => {
                if (!attributes.backgroundColor) return {};
                return {
                  "data-background-color": attributes.backgroundColor,
                  style: `background-color: ${attributes.backgroundColor}; padding: 4px 8px; border-radius: 6px;`,
                };
              },
            },
          },
        },
      ];
    },
  }),

  Extension.create<{ suggestion: Record<string, unknown> }>({
    name: "slashCommands",
    addOptions() {
      return {
        suggestion: suggestionConfig,
      };
    },
    addProseMirrorPlugins() {
      return [
        Suggestion({
          editor: this.editor,
          ...this.options.suggestion,
        }),
      ];
    },
  }),
];
