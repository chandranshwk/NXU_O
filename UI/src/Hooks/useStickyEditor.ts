import { useEditor } from "@tiptap/react";
import { useRef } from "react";
import { getEditorExtensions } from "../assets/TipTapEditor";
import { useSettings } from "../contexts/settingsContext";
import { useEditorContext } from "../contexts/editorContext";
import { useScratchContext } from "../contexts/scratchContext";

interface UseStickyEditorProps {
  initialContent: string;
  onContentUpdate?: (html: string) => void;
}

export const useStickyEditor = ({
  initialContent,
  onContentUpdate,
}: UseStickyEditorProps) => {
  const context = useEditorContext();
  const settings = useSettings();
  const scratch = useScratchContext();
  const isTransitioningRef = useRef<boolean>(false);

  const editor = useEditor({
    editorProps: {
      attributes: {
        className:
          "prose dark:prose-invert max-w-full w-full break-words [word-break:break-word] outline-none px-2 py-1 [&_span[style*='CalibriLocal']]:leading-[0.4] text-xs min-h-[40px] [&_.inline-sticky]:float-right [&_.inline-sticky]:ml-4 [&_.inline-sticky]:mb-4 clear-both",
      },
    },
    extensions: getEditorExtensions({ settings }),
    content: initialContent,

    onFocus: ({ editor: currentEditor }) => {
      if (context?.setEditor) {
        context.setEditor(currentEditor);
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      if (isTransitioningRef.current) return;
      const currentHTML = currentEditor.getHTML();

      // Fire local callback if provided, otherwise fallback to global scratchpad
      if (onContentUpdate) {
        onContentUpdate(currentHTML);
      } else if (scratch?.info !== currentHTML && scratch?.setInfo) {
        scratch.setInfo(currentHTML);
      }
    },
    onSelectionUpdate: ({ editor: currentEditor }) => {
      if (!context) return;
      context.setIsBold(currentEditor.isActive("bold"));
      context.setIsItalic(currentEditor.isActive("italic"));
      context.setIsUnderline(currentEditor.isActive("underline"));
      context.setIsStrikethrough(currentEditor.isActive("strike"));
      context.setIsBulletList(currentEditor.isActive("bulletList"));
      context.setIsOrderedList(currentEditor.isActive("orderedList"));
      context.setIsBlockquote(currentEditor.isActive("blockquote"));
      context.setIsCodeBlock(currentEditor.isActive("codeBlock"));

      const highlightAttrs = currentEditor.getAttributes("highlight");
      context.setHighlightedColor(highlightAttrs.color || "");

      let activeHeading = 0;
      for (let i = 1; i <= 6; i++) {
        if (currentEditor.isActive("heading", { level: i })) {
          activeHeading = i;
          break;
        }
      }
      context.toggleHeading(activeHeading);

      const attrs = currentEditor.getAttributes("textStyle");
      context.setFont(attrs.fontFamily || settings?.defaultFont);
      context.setFontSize(attrs.fontSize || settings?.defaultFontSize);
      context.setTextColor(attrs.color || settings?.defaultColor);
    },
  });

  return { editor, isTransitioningRef };
};
