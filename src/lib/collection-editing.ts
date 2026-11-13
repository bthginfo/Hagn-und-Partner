/** Returns the original array for invalid moves and otherwise preserves item identity. */
export function moveCollectionItem<T>(items: readonly T[], from: number, to: number): readonly T[] {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 ||
    from >= items.length || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function collectionLines(text: string) {
  return text.split(/\r\n?|\n/).map(line => line.trim()).filter(Boolean);
}

/** Keep authored columns as the maximum and balance a small set without a lone last card. */
export function collectionColumns(maximum: number, count: number) {
  const columns = Math.max(1, Math.min(maximum, count || maximum));
  return columns > 2 && count <= 8 && count % columns === 1 && count % (columns - 1) !== 1
    ? columns - 1 : columns;
}
