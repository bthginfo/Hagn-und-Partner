export const SECTION_TYPES = ["hero", "statement", "services", "team", "split", "contact", "faq", "steps", "stats", "gallery", "richtext", "cta", "cards", "list", "downloads", "quote", "logos", "video", "map", "divider", "timeline", "accordion", "notice", "comparison", "columns", "opening-hours", "editorial-hero", "portrait-mosaic", "service-explorer", "editorial-statement", "contact-poster", "editorial-gallery", "cinematic-hero", "focus-finder", "portrait-rail", "stacked-panels", "kinetic-statement", "contact-dock", "blog-cards", "blog-editorial", "blog-list", "noir-hero", "case-deck", "people-index", "image-curtain", "noir-manifesto", "noir-contact", "navy-hero", "navy-bento", "navy-service-tabs", "navy-people", "navy-process", "navy-contact"] as const;
export type DesignVariant=1|2|3|4|5;
export type SectionType = typeof SECTION_TYPES[number];
export type ImagePosition = "0% 0%" | "50% 0%" | "100% 0%" | "0% 50%" | "50% 50%" | "100% 50%" | "0% 100%" | "50% 100%" | "100% 100%";
export interface ImageValue { src: string; alt: string; position: ImagePosition; caption?: string }
export interface ContentItem { id: string; title: string; text: string; image?: ImageValue; icon?: string; href?: string; label?: string; meta?: string; email?: string; phone?: string; tags?: string[]; details?: string[] }
export interface SectionContent {
  heading: string; subheading?: string; text?: string; image?: ImageValue; images?: ImageValue[]; items?: ContentItem[];
  primaryLabel?: string; primaryHref?: string; secondaryLabel?: string; secondaryHref?: string; quote?: string; attribution?: string;
  videoUrl?: string; mapAddress?: string; caption?: string;
}
export interface SectionDesign {
  heroLayout?: "auto" | "panorama" | "split" | "portrait" | "compact" | "bento";
  theme: "light" | "dark" | "accent" | "soft"; background?: string; textColor?: string; accentColor?: string;
  headingFont: "display" | "sans"; fontScale: number; radius: number; border: number; spacing: "compact" | "normal" | "airy";
  width: "normal" | "wide" | "full"; imageSide: "left" | "right"; columns: 2 | 3 | 4; animation: "none" | "reveal" | "parallax"; align: "left" | "center";
}
export interface Section { id: string; type: SectionType; name: string; visible: boolean; anchor?: string; content: SectionContent; design: SectionDesign }
export interface PageContent { id: string; slug: string; title: string; locale: string; seo: {title: string; description: string; image?: string; noindex?: boolean}; sections: Section[] }
export interface NavItem { label: string; href: string }
export interface FooterColumn {id:string;title:string;links:NavItem[]}
export interface FooterConfig {brandText:string;ctaLabel:string;ctaHref:string;addressHeading:string;contactHeading:string;navigationHeading:string;copyright:string;showAddress:boolean;showContact:boolean;showHours:boolean;showCookieSettings:boolean;showBackToTop:boolean;columns:FooterColumn[];legalLinks:NavItem[]}
export interface BlogConfig {enabled:boolean;title:string;description:string;slug:string;layout:'cards'|'editorial'|'list';showInNavigation:boolean;navLabel:string}
export interface BlogPost {id:string;slug:string;title:string;excerpt:string;author:string;date:string;updatedAt:string;status:'draft'|'published';cover?:ImageValue;sections:Section[];seo:{title:string;description:string;image?:string;noindex?:boolean}}
export interface ColorPalette {primary:string;accent:string;background:string;text:string;surface:string;border:string}
export interface SiteConfig {
  name: string; legalName: string; tagline: string; phone: string; email: string; fax: string; address: string; city: string; postalCode: string;
  navigation: NavItem[]; footerText: string; openingHours: {day: string; hours: string}[];
  theme: {primary: string; accent: string; background: string; radius: number; font: "manrope" | "dm-sans";palettes?:Partial<Record<DesignVariant,ColorPalette>>};
  designVariant?:DesignVariant;
  consent: {enabled: boolean; title: string; text: string}; analytics: {googleId: string; matomoUrl: string; matomoSiteId: string};
  footer?:FooterConfig;blog?:BlogConfig;
}
export interface WebsiteContent { version: 1; config: SiteConfig; pages: PageContent[];posts?:BlogPost[] }
export interface Revision {id: string; createdAt: string; label: string; content?: WebsiteContent}
export interface CmsState {draft: WebsiteContent; published: WebsiteContent; updatedAt: string; publishedAt: string | null; revision: number; revisions: Revision[]}
export interface MediaAsset {id: string; url: string; name: string; alt: string; type: string; size: number; createdAt: string; position: ImagePosition}
export interface Inquiry { id: string; name: string; email: string; phone: string; subject: string; message: string; createdAt: string; status: "new" | "in-progress" | "done" | "spam"; note: string; consentAt: string; emailStatus: "pending" | "sent" | "failed" | "not-configured" }
export interface SmtpSettings {host: string; port: number; secure: boolean; user: string; password?: string; passwordSet?: boolean; from: string; to: string; enabled: boolean}
export interface SiteSettings {smtp: SmtpSettings; retentionDays: number; onboardingComplete: boolean; siteUrl: string; storageRegion: string; databaseRegion: string}
export interface SystemStatus {database: boolean; blob: boolean; smtp: boolean; region: string; mode: "production" | "development"; initialized: boolean}
export interface AdminBootstrap {state: CmsState; settings: SiteSettings; media: MediaAsset[]; inquiries: Inquiry[]; system: SystemStatus}
