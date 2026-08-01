import { Editor, useEditor } from "@tiptap/react";
import { useRef } from "react";
import { getEditorExtensions } from "../assets/TipTapEditor";
import { useSettings } from "../contexts/settingsContext";
import { useWorkspace } from "../contexts/workspaceContext";
import { Node as ProsemirrorNode } from "@tiptap/pm/model";
import type { HeaderProps } from "../Helper/Header";

interface UseStickyEditorProps {
  initialContent: string;
  onContentUpdate?: (html: string) => void;
  autofocus?: "start" | "end" | boolean;
  darkMode?: boolean;
  trackHeaders?: boolean;
  trackToDos?: boolean;
}

interface Action {
  pattern: RegExp;
  exec: (
    editorInstance: Editor,
    cursorFrom: number,
    matchDetails: RegExpExecArray,
  ) => void;
}

const getActionTargets = (
  currentHeaderCount: number,
  currentToDoCount: number,
): Action[] => [
  {
    pattern: /\[\[\[header:(.+?)\]\]\]$/,
    exec: (ed, cursorPosition, matchDetails) => {
      const fullMatchedText = matchDetails[0];
      const capturedHeaderName = matchDetails[1];
      const triggerLength = fullMatchedText.length;

      const currentTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const currentDatestamp = new Date().toLocaleDateString([], {
        dateStyle: "medium",
      });

      ed.chain()
        .deleteRange({
          from: cursorPosition - triggerLength,
          to: cursorPosition,
        })
        .insertContent({
          type: "customHeaderBlock",
          attrs: {
            idx: currentHeaderCount,
            name: capturedHeaderName,
            time: currentTimestamp,
            date: currentDatestamp,
          },
        })
        .run();
    },
  },
  {
    pattern: /\[\[\[todo:(.+?)\]\]\]$/,
    exec: (ed, cursorPosition, matchDetails) => {
      const fullMatchedText = matchDetails[0];
      const capturedToDoName = matchDetails[1];
      const triggerLength = fullMatchedText.length;

      const currentTimestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const currentDatestamp = new Date().toLocaleDateString([], {
        dateStyle: "medium",
      });

      ed.chain()
        .focus()
        .deleteRange({
          from: cursorPosition - triggerLength,
          to: cursorPosition,
        })
        .insertContent({
          type: "customToDoBlock",
          attrs: {
            idx: currentToDoCount,
            title: capturedToDoName,
            time: currentTimestamp,
            date: currentDatestamp,
            items: [{ id: crypto.randomUUID(), text: "", done: false }],
          },
        })
        .run();
    },
  },
  {
    pattern: /\[\[\[image(?::([^\]]+))?\]\]\]$/,
    exec: (ed, cursorPosition, matchDetails) => {
      const fullMatchedText = matchDetails[0];
      const capturedImageSrc = matchDetails[1] ? matchDetails[1].trim() : "";
      const triggerLength = fullMatchedText.length;

      ed.chain()
        .focus()
        .deleteRange({
          from: cursorPosition - triggerLength,
          to: cursorPosition,
        })
        .insertCustomImage({
          src: capturedImageSrc, // Passes the safely parsed web address or falls back to an empty string
          alt: "",
          width: "100%",
          alignment: "center",
        })
        .run();
    },
  },

  {
    pattern: /\[\[\[link\]\]\]$/,
    exec: (ed, cursorPosition) => {
      const triggerLength = "[[[link]]]".length;
      ed.chain()
        .focus()
        .deleteRange({
          from: cursorPosition - triggerLength,
          to: cursorPosition,
        })
        .run();
    },
  },
];

export const useStickyEditor = ({
  initialContent,
  onContentUpdate,
  autofocus = false,
  trackHeaders = false,
  trackToDos = false,
}: UseStickyEditorProps) => {
  const settings = useSettings();
  const isTransitioningRef = useRef<boolean>(false);
  const { setHeaders } = useWorkspace();

  const editor = useEditor({
    editorProps: {
      attributes: {
        className:
          "prose dark:prose-invert max-w-full w-full break-words [word-break:break-word] outline-none px-2 py-1 [&_span[style*='CalibriLocal']]:leading-[0.4] text-xs min-h-[40px] [&_.inline-sticky]:float-right [&_.inline-sticky]:ml-4 [&_.inline-sticky]:mb-4 clear-both",
      },
    },
    extensions: getEditorExtensions({ settings }),
    content: initialContent,
    autofocus: autofocus,

    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;

      const currentHTML = currentEditor.getHTML();
      if (onContentUpdate) {
        onContentUpdate(currentHTML);
      }

      const extractedHeaders: HeaderProps[] = [];
      let headerCounter = 0;
      let todoCounter = 0;

      currentEditor.state.doc.descendants((node: ProsemirrorNode) => {
        if (node.type.name === "customHeaderBlock") {
          if (trackHeaders) {
            extractedHeaders.push({
              idx: headerCounter,
              name: node.attrs.name,
              time: node.attrs.time,
              date: node.attrs.date,
            });
          }
          headerCounter++;
        }

        if (node.type.name === "customToDoBlock") {
          todoCounter++;
        }
        return true;
      });

      if (trackHeaders) {
        setHeaders(extractedHeaders);
      }

      const { from } = currentEditor.state.selection;
      const currentLineText = currentEditor.state.doc.textBetween(
        Math.max(0, from - 60),
        from,
        " ",
      );

      const activeTargets = getActionTargets(
        trackHeaders ? headerCounter : 0,
        trackToDos ? todoCounter : 0,
      );

      for (const target of activeTargets) {
        const match = target.pattern.exec(currentLineText);
        if (match) {
          setTimeout(() => {
            target.exec(currentEditor, from, match);
          }, 10);
          break;
        }
      }
    },
  });

  return { editor, isTransitioningRef };
};
