/**
 * Command palette search: accent- and case-insensitive, every word of the query
 * must appear in the label or the keywords; label-start matches rank first.
 */

export type PaletteCommand = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  keywords?: string;
};

export const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

export function filterCommands<T extends PaletteCommand>(commands: T[], query: string): T[] {
  const q = fold(query);
  if (!q) return commands;
  const words = q.split(/\s+/);
  return commands
    .map((c, index) => {
      const label = fold(c.label);
      const hay = `${label} ${fold(c.keywords ?? "")} ${fold(c.group)}`;
      if (!words.every((w) => hay.includes(w))) return null;
      const score = (label.startsWith(q) ? 0 : label.includes(q) ? 1 : 2) * 100 + index;
      return { c, score };
    })
    .filter((x): x is { c: T; score: number } => x !== null)
    .sort((a, b) => a.score - b.score)
    .map((x) => x.c);
}
