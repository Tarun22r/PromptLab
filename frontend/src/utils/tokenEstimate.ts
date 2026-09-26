/** Rough token estimate (~4 chars/token). Matches the backend's estimate
 * so displayed counts stay consistent between the editor and the response
 * metadata panel. This is an approximation, not a real tokenizer. */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / 4));
}

/** Finds {{variable}} placeholders in a prompt template. */
export function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) ?? [];
  const names = matches.map((m) => m.replace(/[{}]/g, "").trim());
  return Array.from(new Set(names));
}
