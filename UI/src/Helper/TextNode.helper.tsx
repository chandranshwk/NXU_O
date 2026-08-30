export interface BlockItem {
  id: string;
  html: string;
}

export function extractParagraphsToBlocks(html: string): BlockItem[] {
  if (!html) return [{ id: `b-init-${Math.random()}`, html: "<p></p>" }];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  const blocks: BlockItem[] = [];

  const generateId = () =>
    `block-${Math.random().toString(36).substring(2, 9)}`;

  for (const node of body.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"].includes(tag)
      ) {
        if (el.textContent?.trim()) {
          blocks.push({ id: generateId(), html: el.outerHTML });
        }
      } else if (tag === "ul" || tag === "ol") {
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

  if (blocks.length === 0) {
    const text = body.innerHTML.trim();
    blocks.push({
      id: generateId(),
      html: text ? `<p>${text}</p>` : "<p></p>",
    });
  }

  return blocks;
}
