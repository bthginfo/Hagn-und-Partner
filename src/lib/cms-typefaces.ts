/** CMS font choices use licensed files in the application, never a remote stylesheet. */
export const CMS_TYPEFACES = {
  "dm-sans": ["DM Sans", "sans-serif"],
  manrope: ["Manrope", "sans-serif"],
  inter: ["Inter", "sans-serif"],
  outfit: ["Outfit", "sans-serif"],
  archivo: ["Archivo", "sans-serif"],
  oswald: ["Oswald", "sans-serif"],
  "space-grotesk": ["Space Grotesk", "sans-serif"],
  fraunces: ["Fraunces", "serif"],
  "playfair-display": ["Playfair Display", "serif"],
  "cormorant-garamond": ["Cormorant Garamond", "serif"],
  "fira-code": ["Fira Code", "monospace"],
} as const;

export type CmsTypeface = keyof typeof CMS_TYPEFACES;
export function cmsTypeface(value: unknown): string | undefined {
  if (typeof value !== "string" || !Object.hasOwn(CMS_TYPEFACES, value)) return;
  const [name, fallback] = CMS_TYPEFACES[value as CmsTypeface];
  return '"CMS ' + name + '", ' + fallback;
}

export const CMS_ELEMENT_COLORS = [
  "headingColor", "cardBackground", "buttonBackground", "buttonTextColor", "secondaryLinkColor", "iconColor",
] as const;
export type CmsElementColor = typeof CMS_ELEMENT_COLORS[number];
export type CmsAppearance = Partial<Record<CmsElementColor, string>> & {
  background?: string;
  textColor?: string;
  headingTypeface?: CmsTypeface;
  bodyTypeface?: CmsTypeface;
  headingScale?: number;
  bodyScale?: number;
};

export const cmsAppearanceColor = (value: unknown): value is string =>
  typeof value === "string" && /^#(?:[\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(value);
