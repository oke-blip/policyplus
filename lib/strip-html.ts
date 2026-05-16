/** Strip HTML tags and decode common entities for plain-text previews. */
export function stripHtml(html: string): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>?/gm, " ");
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&quot;/gi, '"');
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");
  text = text.replace(/&#39;/gi, "'");
  return text.replace(/\s+/g, " ").trim();
}
