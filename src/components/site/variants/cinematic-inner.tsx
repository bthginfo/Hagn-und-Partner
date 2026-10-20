"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUpRight, Check, Info, Mail, MapPin, Phone, Quote } from "lucide-react";
import type { ContentItem, SectionContent, SectionType } from "@/lib/types";
import { ContentIcon } from "../content-icon";
import { ExternalMedia } from "../consent";
import { ContentLink, EditableImage, EditableText } from "../editable";
import { useSectionHeadingLevel } from "../heading-level";
import type { VariantSectionProps } from "./types";

export const cinematicInnerTypes = new Set<SectionType>([
  "stats", "richtext", "cards", "list", "downloads", "quote", "logos", "video", "map",
  "divider", "timeline", "notice", "comparison", "columns", "opening-hours",
]);

type TextKey = "heading" | "subheading" | "text" | "quote" | "attribution" | "caption";
type ItemTextKey = "title" | "text" | "meta" | "label";
type TextTag = "h1" | "h2" | "h3" | "p" | "span" | "div" | "blockquote";

function useCinematicContent({ section, editable, onChange }: VariantSectionProps) {
  const c = section.content;
  const Heading = useSectionHeadingLevel(section.id);
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (c.items || []).map((item, position) => position === index ? { ...item, [key]: value } : item));
  const text = (key: TextKey, as: TextTag = "p", className = "") => <EditableText as={as} value={c[key]} editable={editable} className={className} onChange={value => update(key, value)} />;
  const heading = (className = "ic-heading") => text("heading", Heading, className);
  const itemText = (item: ContentItem, index: number, key: ItemTextKey, as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} className={className} onChange={value => updateItem(index, key, value)} />;
  const image = (className = "") => <EditableImage image={c.image} editable={editable} className={className} onChange={value => update("image", value)} />;
  const itemImage = (item: ContentItem, index: number, className = "") => <EditableImage image={item.image} editable={editable} className={className} onChange={value => updateItem(index, "image", value)} />;
  const icon = (item: ContentItem, name = "ArrowUpRight", size = 27) => <ContentIcon name={item.icon || name} size={size} editable={editable} itemId={item.id} sectionId={section.id} />;
  const details = (item: ContentItem, index: number) => item.details?.length ? <ul className="ic-details">{item.details.map((entry, detailIndex) => <li key={detailIndex}><Check size={16} aria-hidden="true" /><EditableText as="span" value={entry} editable={editable} onChange={value => updateItem(index, "details", item.details!.map((detail, position) => position === detailIndex ? value : detail))} /></li>)}</ul> : null;
  const itemLink = (item: ContentItem, index: number, label = "Mehr erfahren", className = "ic-text-link", download = false) => item.href ? <ContentLink href={item.href} editable={editable} className={className} download={download}><EditableText as="span" value={item.label || label} editable={editable} onChange={value => updateItem(index, "label", value)} />{download ? <ArrowDownToLine size={20} aria-hidden="true" /> : <ArrowUpRight size={20} aria-hidden="true" />}</ContentLink> : null;
  const actions = () => c.primaryLabel || c.secondaryLabel || editable ? <div className="ic-actions">
    {(c.primaryLabel || editable) && <ContentLink href={c.primaryHref} editable={editable} className="ic-button"><EditableText as="span" value={c.primaryLabel} editable={editable} onChange={value => update("primaryLabel", value)} /><ArrowUpRight size={20} aria-hidden="true" /></ContentLink>}
    {c.secondaryLabel && <ContentLink href={c.secondaryHref} editable={editable} className="ic-text-link"><EditableText as="span" value={c.secondaryLabel} editable={editable} onChange={value => update("secondaryLabel", value)} /><ArrowRight size={19} aria-hidden="true" /></ContentLink>}
  </div> : null;
  const intro = () => <header className="ic-intro"><div>{heading()}{(c.subheading || editable) && text("subheading", "p", "ic-subheading")}</div>{(c.text || editable) && text("text", "p", "ic-copy")}</header>;
  return { c, items: c.items || [], update, updateItem, text, heading, itemText, image, itemImage, icon, details, itemLink, actions, intro };
}

type Binding = ReturnType<typeof useCinematicContent>;
type InnerProps = VariantSectionProps & { b: Binding };

const darkTypes = new Set<SectionType>(["cards", "quote", "video", "timeline", "opening-hours"]);
const pinkTypes = new Set<SectionType>(["stats", "list", "divider", "notice"]);

export function CinematicInnerSection(props: VariantSectionProps) {
  const { section, editable, selected, onSelect } = props;
  const b = useCinematicContent(props);
  const d = section.design;
  const base = darkTypes.has(section.type) ? { bg: "var(--hp-palette-primary, #1d1c58)", fg: "var(--hp-palette-background, #fff9ff)" } : pinkTypes.has(section.type) ? { bg: "var(--hp-palette-accent, #fbd8ee)", fg: "var(--hp-palette-primary, #1d1c58)" } : { bg: "var(--hp-palette-background, #f4f2fa)", fg: "var(--hp-palette-primary, #1d1c58)" };
  const palette = d.theme === "dark" ? { bg: "var(--hp-palette-primary, #1d1c58)", fg: "var(--hp-palette-background, #fff9ff)" } : d.theme === "accent" ? { bg: "var(--hp-palette-accent, #fbd8ee)", fg: "var(--hp-palette-primary, #1d1c58)" } : d.theme === "soft" ? { bg: "var(--hp-palette-surface, #e3def0)", fg: "var(--hp-palette-primary, #1d1c58)" } : base;
  const scale = Number.isFinite(d.fontScale) ? Math.max(.6, Math.min(2, d.fontScale)) : 1;
  const style = {
    "--ic-bg": d.background || palette.bg, "--ic-fg": d.textColor || (palette.fg === "var(--hp-palette-primary, #1d1c58)" ? "var(--hp-palette-text, #1d1c58)" : palette.fg),
    "--ic-accent": d.accentColor || (palette.fg === "var(--hp-palette-background, #fff9ff)" ? "var(--hp-palette-accent, #fbd8ee)" : "var(--hp-palette-primary, #514589)"),
    "--ic-scale": scale, "--ic-radius": `${d.radius}px`, "--ic-columns": d.columns,
    "--ic-display": d.headingFont === "sans" ? "var(--font-body, Manrope), sans-serif" : "var(--font-cinematic, 'Barlow Condensed'), sans-serif",
    "--ic-body": "var(--font-body, Manrope), sans-serif",
    "--ic-gutter": "clamp(22px, 4.7cqi, 88px)", "--ic-max": d.width === "normal" ? "1180px" : d.width === "full" ? "100%" : "1424px",
    "--ic-space": d.spacing === "compact" ? "clamp(48px, 6cqi, 90px)" : d.spacing === "airy" ? "clamp(90px, 12cqi, 180px)" : "clamp(68px, 9cqi, 136px)",
    borderWidth: d.border ? `${d.border}px` : undefined,
  } as CSSProperties;
  let body: ReactNode;
  switch (section.type) {
    case "stats": body = <CinematicFacts {...props} b={b} />; break;
    case "richtext": body = <CinematicManuscript {...props} b={b} />; break;
    case "cards": body = <CinematicReel {...props} b={b} />; break;
    case "list": body = <CinematicList {...props} b={b} />; break;
    case "downloads": body = <CinematicDownloads {...props} b={b} />; break;
    case "quote": body = <CinematicQuotation {...props} b={b} />; break;
    case "logos": body = <CinematicLogos {...props} b={b} />; break;
    case "video": body = <CinematicVideo {...props} b={b} />; break;
    case "map": body = <CinematicMap {...props} b={b} />; break;
    case "divider": body = <div className="ic-wrap ic-divider">{b.heading("ic-divider-heading")}<hr />{b.text("text", "p", "ic-copy")}</div>; break;
    case "timeline": body = <CinematicTimeline {...props} b={b} />; break;
    case "notice": body = <CinematicNotice {...props} b={b} />; break;
    case "comparison": body = <CinematicComparison {...props} b={b} />; break;
    case "columns": body = <CinematicColumns {...props} b={b} />; break;
    case "opening-hours": body = <CinematicHours {...props} b={b} />; break;
    default: body = <div className="ic-wrap ic-scene">{b.intro()}{b.actions()}</div>;
  }
  return <section id={section.anchor || section.id} data-section-id={section.id} data-section-type={section.type} data-theme={d.theme}
    className={`ic-section ic-section--${section.type} ic-align--${d.align} ic-animation--${d.animation} ic-image--${d.imageSide}${editable ? " hp-editable-section" : ""}${selected ? " hp-section-selected" : ""}${!section.visible ? " hp-section-hidden" : ""}`}
    style={style} onClick={editable ? () => onSelect?.() : undefined}>
    {editable && <button type="button" className="hp-section-select" onClick={event => { event.stopPropagation(); onSelect?.(); }} aria-label={`${section.name} auswählen`}>{section.name}{!section.visible && " · ausgeblendet"}</button>}
    {body}
  </section>;
}

function CinematicFacts({ b }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-facts">{b.intro()}<dl className="ic-fact-strip">{b.items.map((item, index) => <div className="ic-fact" key={item.id} data-item-id={item.id}><dt>{b.itemText(item, index, "text", "span", "ic-fact-label")}</dt><dd>{b.itemText(item, index, "title", "span", "ic-fact-value")}</dd>{item.meta && b.itemText(item, index, "meta", "p", "ic-meta")}{item.icon && <span className="ic-fact-icon">{b.icon(item)}</span>}</div>)}</dl>{b.actions()}</div>;
}

function CinematicManuscript({ b }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-manuscript"><header className="ic-manuscript-title">{b.heading()}{b.text("subheading", "p", "ic-subheading")}{b.c.image && b.image("ic-manuscript-image")}</header><div className="ic-manuscript-body">{b.text("text", "div", "ic-reading-copy")}{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="ic-manuscript-passage">{b.itemText(item, index, "title", "h3", "ic-item-heading")}{b.itemText(item, index, "text", "p", "ic-copy")}{b.details(item, index)}{b.itemLink(item, index)}</article>)}{b.actions()}</div></div>;
}

function FilmRail({ children, label, count, className = "" }: { children: ReactNode; label: string; count: number; className?: string }) {
  const rail = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const scrollTo = (index: number) => {
    const viewport = rail.current;
    if (!viewport) return;
    const next = Math.max(0, Math.min(index, count - 1));
    const panel = viewport.children[next] as HTMLElement | undefined;
    const first = viewport.children[0] as HTMLElement | undefined;
    if (panel && first) viewport.scrollTo({ left: panel.offsetLeft - first.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[contenteditable],input,textarea,button,a")) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); scrollTo(active + (event.key === "ArrowRight" ? 1 : -1)); }
  };
  return <div className={`ic-film-rail ${className}`}>
    {count > 1 && <div className="ic-rail-controls"><span aria-live="polite">{active + 1} / {count}</span><button type="button" aria-label="Vorheriger Inhalt" disabled={active === 0} onClick={() => scrollTo(active - 1)}><ArrowLeft size={21} /></button><button type="button" aria-label="Nächster Inhalt" disabled={active >= count - 1} onClick={() => scrollTo(active + 1)}><ArrowRight size={21} /></button></div>}
    <div ref={rail} role="region" aria-label={label} tabIndex={count > 1 ? 0 : undefined} className="ic-rail" onKeyDown={keyboard} onScroll={event => {
      const viewport = event.currentTarget; const panels = Array.from(viewport.children) as HTMLElement[];
      if (!panels.length) return;
      if (viewport.scrollLeft > 1 && viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft <= 2) { setActive(count - 1); return; }
      const start = panels[0].offsetLeft; let nearest = 0; let distance = Infinity;
      panels.forEach((panel, index) => { const next = Math.abs(panel.offsetLeft - start - viewport.scrollLeft); if (next < distance) { nearest = index; distance = next; } });
      setActive(nearest);
    }}>{children}</div>
  </div>;
}

function CinematicReel({ b, editable }: InnerProps) {
  return <div className="ic-scene ic-reel"><div className="ic-wrap">{b.intro()}</div><FilmRail count={b.items.length} label={b.c.heading || "Themen"} className="ic-reel-rail">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="ic-reel-panel">{(item.image || editable) && b.itemImage(item, index, "ic-reel-image")}<div className="ic-reel-copy"><div className="ic-reel-top">{b.itemText(item, index, "meta", "span", "ic-meta")}<span className="ic-reel-symbol">{b.icon(item, "ArrowUpRight", 33)}</span></div>{b.itemText(item, index, "title", "h3", "ic-reel-title")}{b.itemText(item, index, "text", "p", "ic-copy")}{b.details(item, index)}{b.itemLink(item, index, "Weiterlesen")}</div></article>)}</FilmRail><div className="ic-wrap">{b.actions()}</div></div>;
}

function CinematicList({ b }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-checklist"><header>{b.heading()}{b.text("subheading", "p", "ic-subheading")}{b.text("text", "p", "ic-copy")}{b.actions()}</header><ul className="ic-list-index">{b.items.map((item, index) => <li key={item.id} data-item-id={item.id}><span className="ic-list-icon">{b.icon(item, "Check", 26)}</span><div>{b.itemText(item, index, "title", "h3", "ic-list-title")}{b.itemText(item, index, "text", "p", "ic-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div>{item.meta && b.itemText(item, index, "meta", "span", "ic-meta")}</li>)}</ul></div>;
}

function CinematicDownloads({ b }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-download-layout"><header className="ic-download-intro">{b.heading()}{b.text("subheading", "p", "ic-subheading")}{b.text("text", "p", "ic-copy")}{b.items.length > 0 && <p className="ic-file-count">{b.items.length} {b.items.length === 1 ? "Dokument" : "Dokumente"}<ArrowDownToLine size={18} aria-hidden="true" /></p>}{b.actions()}</header><div className="ic-file-index">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="ic-file-entry"><div className="ic-file-symbol">{b.icon(item, "FileText", 36)}</div><div className="ic-file-description">{b.itemText(item, index, "title", "h3", "ic-file-title")}{b.itemText(item, index, "text", "p", "ic-copy")}{b.itemText(item, index, "meta", "span", "ic-meta")}{b.details(item, index)}{b.itemLink(item, index, "Herunterladen", "ic-download-link", true)}</div></article>)}</div></div>;
}

function CinematicQuotation({ b }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-quotation"><div className="ic-quotation-heading">{b.heading("ic-quote-heading")}<Quote size={50} strokeWidth={1} aria-hidden="true" /></div><figure className={`ic-quotation-layout${b.c.image ? " ic-quotation-layout--portrait" : ""}`}><div>{b.text("quote", "blockquote", "ic-quote-text")}</div>{b.c.image && b.image("ic-quote-portrait")}<figcaption className="ic-quote-credit">{b.text("attribution", "span", "ic-quote-name")}{b.text("text", "span", "ic-copy")}</figcaption></figure>{b.actions()}</div>;
}

function CinematicLogos({ b, editable }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-affiliations">{b.intro()}<div className="ic-logo-register">{(b.c.images || []).map((image, index) => <div className="ic-logo-cell" key={index}><EditableImage image={image} editable={editable} className="ic-logo-image" onChange={value => b.update("images", b.c.images!.map((entry, position) => index === position ? value : entry))} /></div>)}{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="ic-logo-cell">{item.image ? b.itemImage(item, index, "ic-logo-image") : <span className="ic-affiliation-icon">{b.icon(item, "BadgeCheck", 34)}</span>}{b.itemText(item, index, "title", "h3", "ic-logo-title")}{b.itemText(item, index, "text", "p", "ic-copy")}{b.itemLink(item, index, "Zur Website")}</article>)}</div>{b.actions()}</div>;
}

function CinematicVideo({ b, editable }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-screening">{b.intro()}<div className="ic-screen-border"><div className="ic-screen-corner" aria-hidden="true" /><div className="ic-media-frame"><ExternalMedia kind="video" url={b.c.videoUrl} title={b.c.heading} editable={editable} /></div></div>{b.text("caption", "p", "ic-screen-caption")}{b.actions()}</div>;
}

function CinematicMap({ b, site, editable }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-arrival"><header className="ic-arrival-title">{b.heading()}{b.text("subheading", "p", "ic-subheading")}</header><div className="ic-arrival-address"><MapPin size={31} strokeWidth={1.3} aria-hidden="true" /><address><strong>{site.name}</strong><span>{site.address}</span><span>{site.postalCode} {site.city}</span></address>{b.text("text", "p", "ic-copy")}<div className="ic-arrival-contact"><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable}><Phone size={17} /><span>{site.phone}</span></ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}><Mail size={17} /><span>{site.email}</span></ContentLink></div>{b.actions()}</div><div className="ic-arrival-map ic-media-frame"><ExternalMedia kind="map" address={b.c.mapAddress || `${site.legalName}, ${site.address}, ${site.postalCode} ${site.city}`} url={b.c.videoUrl} title={b.c.heading} editable={editable} /></div></div>;
}

function CinematicTimeline({ b, editable }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-chronology">{b.intro()}<ol className="ic-timeline">{b.items.map((item, index) => <li key={item.id} data-item-id={item.id} className="ic-time-scene"><div className="ic-time-date">{b.itemText(item, index, item.meta ? "meta" : "title", "span")}</div><article className={`ic-time-frame${item.image ? " ic-time-frame--image" : ""}`}>{(item.image || editable) && b.itemImage(item, index, "ic-time-image")}<div className="ic-time-copy">{item.meta && b.itemText(item, index, "title", "h3", "ic-time-title")}{b.itemText(item, index, "text", "p", "ic-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div></article></li>)}</ol>{b.actions()}</div>;
}

function CinematicNotice({ b }: InnerProps) {
  return <aside className="ic-wrap ic-scene ic-notice"><div>{b.heading("ic-notice-heading")}{b.text("subheading", "p", "ic-subheading")}{b.text("text", "p", "ic-notice-copy")}{b.items.map((item, index) => <div key={item.id} data-item-id={item.id} className="ic-notice-item">{b.itemText(item, index, "title", "h3", "ic-item-heading")}{b.itemText(item, index, "text", "p", "ic-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div>)}{b.actions()}</div><Info className="ic-notice-symbol" strokeWidth={.75} aria-hidden="true" /></aside>;
}

function CinematicComparison({ b }: InnerProps) {
  return <div className="ic-wrap ic-scene ic-comparison-scene">{b.intro()}<div className="ic-comparison-register">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="ic-comparison-column"><header>{b.icon(item, "Columns3", 29)}{b.itemText(item, index, "title", "h3", "ic-comparison-title")}{b.itemText(item, index, "meta", "p", "ic-comparison-meta")}</header><div>{b.itemText(item, index, "text", "p", "ic-copy")}{b.details(item, index)}</div><div className="ic-comparison-action">{b.itemLink(item, index)}</div></article>)}</div>{b.actions()}</div>;
}

function CinematicColumns({ b }: InnerProps) {
  return <div className="ic-scene ic-reading-room"><div className="ic-wrap">{b.intro()}</div><FilmRail count={b.items.length} label={b.c.heading || "Weitere Informationen"} className="ic-manuscript-rail">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="ic-manuscript-sheet"><header>{b.itemText(item, index, "title", "h3", "ic-sheet-title")}{b.icon(item, "BookOpen", 27)}</header>{item.image && b.itemImage(item, index, "ic-sheet-image")}{b.itemText(item, index, "text", "p", "ic-reading-copy")}{b.details(item, index)}{b.itemLink(item, index)}</article>)}</FilmRail><div className="ic-wrap">{b.actions()}</div></div>;
}

function CinematicHours({ b, site, editable }: InnerProps) {
  const items: ContentItem[] = b.items.length ? b.items : site.openingHours.map((entry, index) => ({ id: `hours-${index}`, title: entry.day, text: entry.hours }));
  const updateHours = (index: number, key: "title" | "text", value: string) => b.update("items", items.map((item, position) => position === index ? { ...item, [key]: value } : item));
  return <div className="ic-wrap ic-scene ic-hours"><header>{b.heading()}{b.text("subheading", "p", "ic-subheading")}{b.text("text", "p", "ic-copy")}{b.actions()}</header><div className="ic-hours-board">{items.map((item, index) => <div className="ic-hours-row" key={item.id} data-item-id={item.id}><EditableText as="h3" value={item.title} editable={editable} className="ic-hours-day" onChange={value => updateHours(index, "title", value)} /><EditableText as="p" value={item.text} editable={editable} className="ic-hours-time" onChange={value => updateHours(index, "text", value)} />{item.meta && b.itemText(item, index, "meta", "span", "ic-meta")}</div>)}</div></div>;
}
