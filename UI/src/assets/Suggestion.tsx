import type { Editor, Range } from "@tiptap/core";
import type { SuggestionProps } from "@tiptap/suggestion";

export interface SuggestionItem {
  title: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export const suggestionConfig = {
  char: "/",
  startOfLine: true,

  items: ({ query }: { query: string }): SuggestionItem[] => {
    const items: SuggestionItem[] = [
      {
        title: "Heading 1",
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .toggleHeading({ level: 1 })
            .run(),
      },
      {
        title: "Heading 2",
        command: ({ editor, range }) =>
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .toggleHeading({ level: 2 })
            .run(),
      },
      {
        title: "Bullet List",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleBulletList().run(),
      },
      {
        title: "Ordered List",
        command: ({ editor, range }) =>
          editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
      },
    ];

    return items.filter((item) =>
      item.title.toLowerCase().startsWith(query.toLowerCase()),
    );
  },

  render: () => {
    return {
      onStart: (props: SuggestionProps<SuggestionItem>) => {
        console.log("Slash suggestion initiated:", props);
      },
      onUpdate: (props: SuggestionProps<SuggestionItem>) => {
        console.log("Slash suggestion modified:", props);
      },
      onExit: () => {
        console.log("Slash suggestion closed");
      },
    };
  },
};
