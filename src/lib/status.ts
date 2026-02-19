export const shelfStatuses = ["want", "reading", "read", "dropped", "paused"] as const;

export type ShelfStatus = (typeof shelfStatuses)[number];

export function buildBookDocId(title: string, googleBookId: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

  return `${slug || "book"}--${googleBookId}`;
}

export function parseGoogleDateToTimestamp(value?: string): number | null {
  if (!value) {
    return null;
  }

  const parts = value.split("-").map(Number);

  if (parts.length === 3) {
    const [year, month, day] = parts;
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }
    return Date.UTC(year, month - 1, day);
  }

  if (parts.length === 2) {
    const [year, month] = parts;
    if (!Number.isFinite(year) || !Number.isFinite(month)) {
      return null;
    }
    return Date.UTC(year, month - 1, 1);
  }

  if (parts.length === 1) {
    const [year] = parts;
    if (!Number.isFinite(year)) {
      return null;
    }
    return Date.UTC(year, 0, 1);
  }

  return null;
}
