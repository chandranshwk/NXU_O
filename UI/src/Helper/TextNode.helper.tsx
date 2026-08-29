export function extractParagraphs(html: string): string[] {
  if (!html) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const body = doc.body;
  const paragraphs: string[] = [];

  for (const node of body.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (
        ["p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"].includes(tag)
      ) {
        const text = el.textContent?.trim();
        if (text) paragraphs.push(text);
      } else if (tag === "ul" || tag === "ol") {
        const items = el.querySelectorAll("li");
        for (const li of items) {
          const text = li.textContent?.trim();
          if (text) paragraphs.push(text);
        }
      }
    }
  }

  if (paragraphs.length === 0) {
    const text = body.textContent?.trim();
    if (text) paragraphs.push(text);
  }

  return paragraphs;
}
