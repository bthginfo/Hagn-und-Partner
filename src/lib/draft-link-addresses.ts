type Anchor = { id: string; anchor?: string };
type LinkedPage = { slug: string; sections: Anchor[] };

const pathFor = (slug: string) => "/" + slug.replace(/^\/+|\/+$/g, "");
const anchorFor = (section: Anchor) => section.anchor || section.id;
const linkField = /^(?:href|url|link|target|ctaTarget|(?:primary|secondary|cta|button|target)Href)$/i;

/**
 * Keep existing internal targets when a page or anchor is deliberately renamed.
 * Fragment-only links belong to the page where they occur. A bare path is
 * changed only when it matches the previous route exactly.
 */
export function updateDraftAddresses<T>(draft: T, previous: LinkedPage, next: LinkedPage,
  renaming?: { sectionId: string; nextSectionId: string; owner?: object }): T {
  const before = pathFor(previous.slug), after = pathFor(next.slug);
  const slugChanged = before !== after;
  const anchors = new Map<string, string>();
  for (const section of previous.sections) {
    const updated = next.sections.find(entry => entry.id === (renaming?.sectionId === section.id ? renaming.nextSectionId : section.id));
    if (!updated) continue;
    const from = anchorFor(section), to = anchorFor(updated);
    if (from !== to) anchors.set(from, to);
  }
  if (!slugChanged && !anchors.size) return draft;

  function replace(value: string, local: boolean) {
    if (value.startsWith("#")) {
      const changed = local ? anchors.get(value.slice(1)) : undefined;
      return changed ? "#" + changed : value;
    }
    if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return value;
    const match = /^([^?#]*)(\?[^#]*)?(#(.*))?$/.exec(value);
    if (!match || pathFor(match[1]) !== before) return value;
    const changed = match[4] ? anchors.get(match[4]) : undefined;
    return (slugChanged ? after : match[1]) + (match[2] ?? "") + (changed ? "#" + changed : match[3] ?? "");
  }
  function visit(value: unknown, local: boolean, key = ""): unknown {
    if (typeof value === "string") return linkField.test(key) ? replace(value, local) : value;
    if (Array.isArray(value)) {
      const mapped = value.map(entry => visit(entry, local));
      return mapped.some((entry, index) => entry !== value[index]) ? mapped : value;
    }
    if (!value || typeof value !== "object") return value;
    const record = value as Record<string, unknown>;
    const here = local || record === (renaming?.owner ?? next);
    let changed: Record<string, unknown> | undefined;
    for (const [field, entry] of Object.entries(record)) {
      const updated = visit(entry, here, field);
      if (updated !== entry) (changed ??= { ...record })[field] = updated;
    }
    return changed ?? value;
  }
  return visit(draft, false) as T;
}
