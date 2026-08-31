/**
 * @file TextNode.helper.ts
 * @description Core text parsing utilities for splitting multi-line editor
 * data down into individual drag-and-drop structural elements.
 *
 * @architecture
 * - Parses raw input markup strings using browser DOMParser instances.
 * - Extracts block structures (headings, blocks, list trees) into separate array layers.
 * - Assigns safe tracking identifiers to protect re-rendering stability.
 */

export interface BlockItem {
  /** Safe identifier string tracking the individual paragraph layout */
  id: string;
  /** Extracted HTML string body representing a single structural node view */
  html: string;
}

/**
 * @function extractParagraphsToBlocks
 * @description Splits raw HTML content into a structured array of block objects.
 * Headings and blocks remain whole, while lists are split out line-by-line.
 *
 * @param {string} html - Raw HTML source text layout received from storage modules.
 * @returns {BlockItem[]} Array containing structured block map configurations.
 */
export function extractParagraphsToBlocks(html: string): BlockItem[] {
  // Return an empty paragraph fallback structure if no text payload exists
  if (!html) return [{ id: `b-init-${Math.random()}`, html: "<p></p>" }];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  const blocks: BlockItem[] = [];

  /** Local helper used to compute small tracking ID tokens */
  const generateId = () =>
    `block-${Math.random().toString(36).substring(2, 9)}`;

  // Iterate over direct child components contained within the parsed document body
  for (const node of body.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      // Core Content Catch: Capture standard layout elements cleanly if text strings exist
      if (
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"].includes(tag)
      ) {
        if (el.textContent?.trim()) {
          blocks.push({ id: generateId(), html: el.outerHTML });
        }
      }
      // List Splitter: Break grouped standard lists down into independent list lines
      else if (tag === "ul" || tag === "ol") {
        const items = el.querySelectorAll("li");
        for (const li of items) {
          if (li.textContent?.trim()) {
            blocks.push({
              id: generateId(),
              html: `<${tag}>${li.outerHTML}</${tag}>`,
            });
          }
        }
      }
    }
  }

  // Fallback Catch: If data parsing returns zero elements, process the payload as a paragraph
  if (blocks.length === 0) {
    const text = body.innerHTML.trim();
    blocks.push({
      id: generateId(),
      html: text ? `<p>${text}</p>` : "<p></p>",
    });
  }

  return blocks;
}
