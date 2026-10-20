import type { SectionType } from "@/lib/types";

const aliases: Partial<Record<SectionType, SectionType>> = {
  "navy-hero": "hero", "navy-bento": "cards", "navy-service-tabs": "services", "navy-people": "team", "navy-process": "steps", "navy-contact": "contact",
  "editorial-hero": "hero", "cinematic-hero": "hero", "noir-hero": "hero",
  "portrait-mosaic": "team", "portrait-rail": "team", "people-index": "team",
  "service-explorer": "services", "focus-finder": "services", "case-deck": "services",
  "editorial-statement": "statement", "kinetic-statement": "statement", "noir-manifesto": "statement",
  "contact-poster": "cta", "contact-dock": "cta", "noir-contact": "cta",
  "editorial-gallery": "gallery", "image-curtain": "gallery", "stacked-panels": "steps",
};
export function sectionBaseType(type: SectionType): SectionType { return aliases[type] || type; }
export function sectionCapabilities(type: SectionType) {
  const base = sectionBaseType(type); const feed = ["blog-cards", "blog-editorial", "blog-list"].includes(type);
  return {
    base, feed,
    items: !feed && ["hero", "services", "team", "split", "faq", "accordion", "steps", "stats", "cards", "list", "downloads", "logos", "timeline", "comparison", "columns", "opening-hours", "richtext"].includes(base),
    image: ["hero", "split", "statement", "contact", "richtext", "cta", "quote", "notice", "video", "map"].includes(base),
    gallery: base === "gallery" || base === "logos",
    itemImages: ["hero", "services", "team", "split", "cards", "logos", "timeline", "columns", "richtext"].includes(base),
    icons: ["services", "split", "cards", "list", "columns"].includes(base),
    columns: ["team", "cards", "columns", "stats", "comparison", "gallery", "logos"].includes(base) || feed,
    imageSide: base === "split" || base === "map" || base === "quote",
  };
}
