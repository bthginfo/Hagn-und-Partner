"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, Clock3, Info, Mail, MapPin, Maximize2, Menu, Phone, Plus, Quote, X } from "lucide-react";
import type { ContentItem, SectionContent, SectionType } from "@/lib/types";
import { copyrightText, footerConfig } from "@/lib/site-config";
import { ContentIcon } from "../content-icon";
import { ContactForm } from "../contact-form";
import { consentEvent, ExternalMedia } from "../consent";
import { ContentDisclosure, EditableChoice, ContentLink, EditableImage, EditableText, safeHref, teamEmailLabel } from "../editable";
import { SectionHeadingProvider, useSectionHeadingLevel } from "../heading-level";
import type { VariantSectionProps, VariantSiteProps } from "./types";
import { useSmartHeader } from "../smart-header";

const navyAliases: Partial<Record<SectionType, SectionType>> = { "navy-hero": "hero", "navy-bento": "cards", "navy-service-tabs": "services", "navy-people": "team", "navy-process": "steps", "navy-contact": "contact" };
export const navyTypes = new Set<SectionType>(["hero", "statement", "services", "team", "split", "contact", "faq", "steps", "stats", "gallery", "richtext", "cta", "cards", "list", "downloads", "quote", "logos", "video", "map", "divider", "timeline", "accordion", "notice", "comparison", "columns", "opening-hours", "navy-hero", "navy-bento", "navy-service-tabs", "navy-people", "navy-process", "navy-contact"]);

export function NavySite({ page, site, editable, selectedSectionId, onSectionSelect, onSectionChange, fallback }: VariantSiteProps) {
  const Main = editable ? "div" : "main";
  const sections = page.sections.filter(section => section.visible || editable);
  const portraits = sections.filter(section => ["team", "navy-people", "portrait-mosaic", "portrait-rail", "people-index"].includes(section.type)).flatMap(section => section.content.items || []).filter(item => item.image);
  const topics = sections.filter(section => ["services", "navy-service-tabs", "service-explorer", "focus-finder", "case-deck"].includes(section.type)).flatMap(section => section.content.items || []);
  const sceneImage = sections.find(section => section.type === "split" && section.content.image)?.content.image;
  return <>
    <NavyHeader site={site} page={page} editable={editable} fallback={fallback} />
    <Main data-site-main={editable ? "" : undefined} role={editable ? "region" : undefined} aria-label={editable ? `Seitenvorschau: ${page.title}` : undefined} className="nv-main" id="hauptinhalt" tabIndex={editable ? undefined : -1}>
      {sections.map(section => <SectionHeadingProvider key={section.id} sectionId={section.id}>{navyTypes.has(section.type) ? <NavySection section={section} site={site} editable={editable} selected={selectedSectionId === section.id} onSelect={() => onSectionSelect?.(section.id)} onChange={onSectionChange} portraits={portraits} topics={topics} sceneImage={sceneImage} /> : fallback(section)}</SectionHeadingProvider>)}
      {!sections.length && editable && <div className="nv-empty"><Plus size={30} /><p>Fügen Sie einen Abschnitt aus der Bibliothek hinzu.</p></div>}
    </Main>
    <NavyFooter site={site} editable={editable} />
  </>;
}

function NavyHeader({ site, page, editable }: VariantSiteProps) {
  const id = useId(); const menuRef = useRef<HTMLDialogElement>(null); const triggerRef = useRef<HTMLButtonElement>(null); const [open, setOpen] = useState(false);
  const smartHeader = useSmartHeader({ open, disabled: editable });
  const contact = site.navigation.find(item => /\/kontakt(?:$|[?#])/.test(item.href));
  const isCurrent = (href: string) => href.replace(/^\/+|\/+$/g, "") === page.slug.replace(/^\/+|\/+$/g, "");
  useEffect(() => {
    const menu = menuRef.current;
    if (open && menu && !menu.open) menu.showModal();
    if (!open && menu?.open) { menu.close(); triggerRef.current?.focus(); }
  }, [open]);
  return <header {...smartHeader} className="nv-header"><div className="nv-header-inner">
    <ContentLink href="/" editable={editable} className="nv-brand"><strong>{site.name}</strong><span>{site.tagline}</span></ContentLink>
    <nav className="nv-desktop-nav" aria-label="Hauptnavigation">{site.navigation.filter(item => item !== contact).map((item, index) => <a key={`${item.href}-${index}`} href={safeHref(item.href)} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={editable ? event => event.preventDefault() : undefined}>{item.label}</a>)}</nav>
    <div className="nv-header-actions">{contact && <ContentLink href={contact.href} editable={editable} className="nv-header-cta">{contact.label}<ArrowUpRight size={18} /></ContentLink>}<button ref={triggerRef} type="button" className="nv-menu-toggle" aria-label="Hauptmenü öffnen" aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}><Menu size={24} /></button></div>
    <dialog ref={menuRef} id={id} className="nv-mobile-menu" aria-label="Hauptnavigation" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="nv-menu-panel"><div className="nv-menu-top"><span>{site.name}</span><button type="button" aria-label="Menü schließen" onClick={() => setOpen(false)}><X size={24} /></button></div><nav aria-label="Mobile Hauptnavigation">{site.navigation.map((item, index) => <a key={`${item.href}-${index}`} href={safeHref(item.href)} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={event => { if (editable) event.preventDefault(); setOpen(false); }}>{item.label}<ArrowUpRight size={23} /></a>)}</nav><div className="nv-menu-contact"><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable}><Phone size={18} />{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}><Mail size={18} />{site.email}</ContentLink><address>{site.address}<br />{site.postalCode} {site.city}</address></div></div>
    </dialog>
  </div></header>;
}

function NavyFooter({ site, editable }: Pick<VariantSiteProps, "site" | "editable">) {
  const footer = footerConfig(site);
  return <footer className="nv-footer"><div className="nv-footer-inner">
    {(footer.brandText || footer.ctaLabel || site.footerText) && <div className="nv-footer-top"><div>{footer.brandText && <ContentLink href="/" editable={editable} className="nv-footer-brand">{footer.brandText}</ContentLink>}{site.footerText && <p>{site.footerText}</p>}</div>{footer.ctaLabel && <ContentLink href={footer.ctaHref} editable={editable} className="nv-footer-cta">{footer.ctaLabel}<ArrowUpRight size={23} /></ContentLink>}</div>}
    <div className="nv-footer-grid">
      {footer.showAddress && <div>{footer.addressHeading && <h2>{footer.addressHeading}</h2>}<p>{site.legalName}</p><address>{site.address}<br />{site.postalCode} {site.city}</address></div>}
      {(footer.showContact || footer.showHours) && <div>{footer.contactHeading && <h2>{footer.contactHeading}</h2>}{footer.showContact && <div className="nv-footer-contact"><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable}>{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}>{site.email}</ContentLink></div>}{footer.showHours && <div className="nv-footer-hours">{site.openingHours.map((entry, index) => <p key={index}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>}</div>}
      {footer.columns.length > 0 && <div className="nv-footer-navigation">{footer.navigationHeading && <h2>{footer.navigationHeading}</h2>}<div>{footer.columns.map(column => <nav key={column.id} aria-label={column.title || footer.navigationHeading || "Weitere Seiten"}>{column.title && column.title !== footer.navigationHeading && <h3>{column.title}</h3>}{column.links.map((link, index) => <ContentLink href={link.href} editable={editable} key={`${link.href}-${index}`}>{link.label}</ContentLink>)}</nav>)}</div></div>}
    </div>
    <div className="nv-footer-bottom"><span>{copyrightText(site)}</span><div>{footer.legalLinks.map((link, index) => <ContentLink href={link.href} editable={editable} key={`${link.href}-${index}`}>{link.label}</ContentLink>)}{footer.showCookieSettings && site.consent.enabled && <button type="button" onClick={() => { if (!editable) window.dispatchEvent(new Event(consentEvent)); }}>Cookie-Einstellungen</button>}</div>{footer.showBackToTop && <a href="#hauptinhalt" className="nv-back-top" aria-label="Zum Seitenanfang"><ArrowUp size={20} /></a>}</div>
  </div></footer>;
}

type TextKey = "heading" | "subheading" | "text" | "quote" | "attribution" | "caption";
type ItemKey = "title" | "text" | "meta" | "label";
type TextTag = "h1" | "h2" | "h3" | "p" | "span" | "div" | "blockquote";

function useNavyBindings({ section, editable, onChange }: VariantSectionProps) {
  const c = section.content; const Heading = useSectionHeadingLevel(section.id);
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (c.items || []).map((item, position) => position === index ? { ...item, [key]: value } : item));
  const text = (key: TextKey, as: TextTag = "p", className = "") => <EditableText as={as} value={c[key]} editable={editable} className={className} onChange={value => update(key, value)} />;
  const heading = (className = "nv-heading") => text("heading", Heading, className);
  const itemText = (item: ContentItem, index: number, key: ItemKey, as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} className={className} onChange={value => updateItem(index, key, value)} />;
  const image = (className = "", priority = false) => <EditableImage image={c.image} editable={editable} className={className} priority={priority} onChange={value => update("image", value)} />;
  const itemImage = (item: ContentItem, index: number, className = "") => <EditableImage image={item.image} editable={editable} className={className} onChange={value => updateItem(index, "image", value)} />;
  const icon = (item: ContentItem, fallback = "ArrowUpRight", size = 25) => <ContentIcon name={item.icon || fallback} size={size} editable={editable} itemId={item.id} sectionId={section.id} />;
  const details = (item: ContentItem, index: number) => item.details?.length ? <ul className="nv-details">{item.details.map((entry, detailIndex) => <li key={detailIndex}><Check size={17} aria-hidden="true" /><EditableText as="span" value={entry} editable={editable} onChange={value => updateItem(index, "details", item.details!.map((detail, position) => detailIndex === position ? value : detail))} /></li>)}</ul> : null;
  const tags = (item: ContentItem, index: number) => item.tags?.length ? <div className="nv-tags">{item.tags.map((tag, tagIndex) => <EditableText as="span" key={tagIndex} value={tag} editable={editable} onChange={value => updateItem(index, "tags", item.tags!.map((entry, position) => tagIndex === position ? value : entry))} />)}</div> : null;
  const itemLink = (item: ContentItem, index: number, fallback = "Mehr erfahren", className = "nv-text-link", download = false) => item.href ? <ContentLink href={item.href} editable={editable} className={className} download={download}><EditableText as="span" value={item.label || fallback} editable={editable} onChange={value => updateItem(index, "label", value)} />{download ? <ArrowDownToLine size={19} /> : <ArrowUpRight size={19} />}</ContentLink> : null;
  const actions = () => c.primaryLabel || c.secondaryLabel || editable ? <div className="nv-actions">{(c.primaryLabel || editable) && <ContentLink href={c.primaryHref} editable={editable} className="nv-button"><EditableText as="span" value={c.primaryLabel} editable={editable} onChange={value => update("primaryLabel", value)} /><ArrowUpRight size={20} /></ContentLink>}{c.secondaryLabel && <ContentLink href={c.secondaryHref} editable={editable} className="nv-button nv-button--secondary"><EditableText as="span" value={c.secondaryLabel} editable={editable} onChange={value => update("secondaryLabel", value)} /><ArrowRight size={19} /></ContentLink>}</div> : null;
  const intro = () => <header className="nv-intro"><div>{heading()}{text("subheading", "p", "nv-subheading")}</div>{text("text", "p", "nv-copy")}</header>;
  return { c, items: c.items || [], update, updateItem, text, heading, itemText, image, itemImage, icon, details, tags, itemLink, actions, intro };
}

type Bindings = ReturnType<typeof useNavyBindings>;
type InnerProps = VariantSectionProps & { b: Bindings };
const navyDarkTypes = new Set<SectionType>(["hero", "team", "cards", "quote", "video", "stats"]);

export function NavySection(props: VariantSectionProps) {
  const { section, editable, selected, onSelect } = props; const b = useNavyBindings(props); const d = section.design; const type = navyAliases[section.type] || section.type;
  const dark = d.theme === "dark" || (d.theme === "light" && navyDarkTypes.has(type));
  const paletteBg = d.theme === "accent" ? "var(--hp-palette-accent, #95ceef)" : d.theme === "soft" ? "color-mix(in srgb, var(--hp-palette-accent, #95ceef) 22%, white)" : dark ? "var(--hp-palette-background, #081728)" : "color-mix(in srgb, var(--hp-palette-accent, #95ceef) 7%, white)";
  const paletteFg = dark ? "var(--hp-palette-text, #f4f7ff)" : "var(--hp-palette-primary, #09456e)";
  const style = {
    "--nv-bg": d.background || paletteBg, "--nv-fg": d.textColor || paletteFg,
    "--nv-accent": d.accentColor || (dark ? "var(--hp-palette-accent, #95ceef)" : "var(--hp-palette-primary, #09456e)"),
    "--nv-primary": "var(--hp-palette-primary, #09456e)", "--nv-light": "var(--hp-palette-text, #f4f7ff)",
    "--nv-night": "var(--hp-palette-background, #081728)", "--nv-surface": "var(--hp-palette-surface, #102a41)", "--nv-border": "var(--hp-palette-border, #35566d)",
    "--nv-font": d.headingFont === "sans" ? "var(--font-body, Manrope), sans-serif" : "var(--font-display, Manrope), sans-serif", "--nv-scale": Number.isFinite(d.fontScale) ? Math.max(.6, Math.min(2, d.fontScale)) : 1,
    "--nv-radius": `${Math.max(0, d.radius)}px`, "--nv-columns": d.columns,
    "--nv-gutter": "clamp(22px, 4.7cqi, 84px)", "--nv-max": d.width === "normal" ? "1140px" : d.width === "full" ? "100%" : "1380px",
    "--nv-space": d.spacing === "compact" ? "clamp(44px, 5cqi, 76px)" : d.spacing === "airy" ? "clamp(84px, 10.8cqi, 160px)" : "clamp(65px, 8.4cqi, 120px)",
    borderWidth: d.border ? `${d.border}px` : undefined,
  } as CSSProperties;
  let body: ReactNode;
  switch (type) {
    case "hero": body = <NavyHero {...props} b={b} />; break;
    case "statement": body = <NavyStatement {...props} b={b} />; break;
    case "services": body = <NavyServices {...props} b={b} />; break;
    case "team": body = <NavyPeople {...props} b={b} />; break;
    case "split": body = <NavySplit {...props} b={b} />; break;
    case "contact": body = <NavyContact {...props} b={b} />; break;
    case "faq": case "accordion": body = <NavyFaq {...props} b={b} />; break;
    case "steps": body = <NavyProcess {...props} b={b} />; break;
    case "stats": body = <NavyStats {...props} b={b} />; break;
    case "gallery": body = <NavyGallery {...props} b={b} />; break;
    case "richtext": body = <NavyRichtext {...props} b={b} />; break;
    case "cta": body = <NavyCta {...props} b={b} />; break;
    case "cards": body = <NavyBento {...props} b={b} />; break;
    case "list": body = <NavyList {...props} b={b} />; break;
    case "downloads": body = <NavyDownloads {...props} b={b} />; break;
    case "quote": body = <NavyQuote {...props} b={b} />; break;
    case "logos": body = <NavyLogos {...props} b={b} />; break;
    case "video": body = <NavyVideo {...props} b={b} />; break;
    case "map": body = <NavyMap {...props} b={b} />; break;
    case "divider": body = <div className="nv-wrap nv-divider">{b.heading("nv-divider-title")}<hr />{b.text("text", "p", "nv-copy")}</div>; break;
    case "timeline": body = <NavyTimeline {...props} b={b} />; break;
    case "notice": body = <NavyNotice {...props} b={b} />; break;
    case "comparison": body = <NavyComparison {...props} b={b} />; break;
    case "columns": body = <NavyColumns {...props} b={b} />; break;
    case "opening-hours": body = <NavyHours {...props} b={b} />; break;
    default: body = <div className="nv-wrap nv-scene">{b.intro()}{b.actions()}</div>;
  }
  return <section id={section.anchor || section.id} data-section-id={section.id} data-section-type={section.type} data-theme={d.theme} className={`nv-section nv-section--${type} nv-align--${d.align} nv-image--${d.imageSide} nv-animation--${d.animation}${dark ? " nv-tone--dark" : " nv-tone--light"}${editable ? " hp-editable-section" : ""}${selected ? " hp-section-selected" : ""}${!section.visible ? " hp-section-hidden" : ""}`} style={style} onClick={editable ? () => onSelect?.() : undefined}>
    {editable && <button type="button" className="hp-section-select" onClick={event => { event.stopPropagation(); onSelect?.(); }} aria-label={`${section.name} auswählen`}>{section.name}{!section.visible && " · ausgeblendet"}</button>}{body}
  </section>;
}

function NavyHero({ b, portraits = [], site, section, editable }: InnerProps) {
  const people = b.c.items === undefined ? portraits.slice(0, 3) : b.items;
  const requested = section.design.heroLayout || "auto";
  const layout = requested === "auto" ? people.length > 1 ? "bento" : "split" : requested;
  const changePerson = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => b.update("items", people.map((person, position) => position === index ? { ...person, [key]: value } : person));
  const renderPerson = (person: ContentItem, index: number, featured = false) => <div key={person.id} data-item-id={person.id} className={`nv-hero-person${featured ? " nv-hero-person--featured" : ""}`}>
    {(person.image || editable) && <EditableImage image={person.image} editable={editable} className="nv-hero-portrait" onChange={value => changePerson(index, "image", value)} />}
    <div className="nv-hero-person-copy">{person.href ? <ContentLink href={person.href} editable={editable}><EditableText as="span" className="nv-hero-person-name" value={person.title} editable={editable} onChange={value => changePerson(index, "title", value)} /><ArrowUpRight size={17} /></ContentLink> : <EditableText as="span" className="nv-hero-person-name" value={person.title} editable={editable} onChange={value => changePerson(index, "title", value)} />}{(person.meta || editable) && <EditableText as="p" value={person.meta} editable={editable} onChange={value => changePerson(index, "meta", value)} />}</div>
  </div>;
  const renderPeople = (from = 0) => people.length > from ? <div className="nv-hero-people">{people.slice(from).map((person, index) => renderPerson(person, index + from))}</div> : null;
  const message = <div className="nv-hero-message">{b.heading("nv-hero-heading")}{b.text("subheading", "p", "nv-hero-subheading")}{b.text("text", "p", "nv-hero-copy")}{b.actions()}<div className="nv-hero-direct"><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable}><Phone size={18} />{site.phone}</ContentLink><span><MapPin size={17} />{site.city}</span></div></div>;
  const photo = <div className="nv-hero-photo-tile">{b.image("nv-hero-photo", true)}{b.c.caption && b.text("caption", "p", "nv-hero-caption")}</div>;
  const office = <div className="nv-hero-office"><span><MapPin size={23} aria-hidden="true" /></span><address><strong>{site.name}</strong>{site.address}<br />{site.postalCode} {site.city}</address><ContentLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.postalCode} ${site.city}`)}`} editable={editable} label="Route zur Kanzlei planen"><ArrowUpRight size={23} /></ContentLink></div>;

  if (layout === "panorama") return <div className="nv-wrap nv-hero nv-hero--panorama" data-hero-layout={layout}>{message}{photo}<div className={`nv-hero-support${people.length ? "" : " nv-hero-support--single"}`}>{renderPeople()}{office}</div></div>;
  if (layout === "portrait") {
    const lead = people[0]?.image ? people[0] : undefined;
    return <div className={`nv-wrap nv-hero nv-hero--portrait${lead ? " nv-hero--portrait-person" : ""}`} data-hero-layout={layout}><div className="nv-hero-portrait-message">{message}</div><div className="nv-hero-feature">{lead ? renderPerson(lead, 0, true) : photo}</div>{lead && <div className="nv-hero-room">{b.image("nv-hero-room-image", true)}{b.c.caption && b.text("caption", "p", "nv-hero-room-caption")}</div>}<div className={`nv-hero-support${people.length > (lead ? 1 : 0) ? "" : " nv-hero-support--single"}`}>{renderPeople(lead ? 1 : 0)}{office}</div></div>;
  }
  if (layout === "compact") return <div className="nv-wrap nv-hero nv-hero--compact" data-hero-layout={layout}>{message}{photo}{people.length > 0 && <div className="nv-hero-compact-people">{renderPeople()}</div>}</div>;
  if (layout === "split") return <div className="nv-wrap nv-hero nv-hero--split" data-hero-layout={layout}>{message}<div className="nv-hero-split-visual">{photo}{renderPeople()}</div></div>;
  return <div className="nv-wrap nv-hero nv-hero--bento" data-hero-layout="bento">{message}<div className={`nv-hero-bento${people.length ? "" : " nv-hero-bento--solo"}`}>{photo}{renderPeople()}{office}</div></div>;
}

function NavyStatement({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-statement"><div className="nv-statement-head">{b.heading("nv-statement-heading")}{b.text("subheading", "p", "nv-subheading")}</div><div className="nv-statement-copy">{b.text("text", "p", "nv-statement-text")}{b.items.map((item, index) => <div key={item.id} data-item-id={item.id} className="nv-statement-point">{b.icon(item, "Check")}{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nv-copy")}</div>)}{b.actions()}</div></div>;
}

function NavyServices({ section, b, editable, sceneImage }: InnerProps) {
  const [active, setActive] = useState(0); const tablist = useRef<HTMLDivElement>(null); const current = Math.min(active, Math.max(0, b.items.length - 1));
  return <div className="nv-wrap nv-scene nv-services">{b.intro()}{b.items.length > 0 && <><div className="nv-service-tabs" role={editable ? "group" : "tablist"} aria-label={b.c.heading || "Rechtsgebiete"} ref={tablist}>{b.items.map((item, index) => <div key={item.id} data-item-id={item.id} role="presentation"><EditableChoice editable={editable} type="button" role="tab" id={`${section.id}-tab-${index}`} aria-controls={`${section.id}-panel-${index}`} aria-selected={index === current} tabIndex={index === current ? 0 : -1} onChoose={() => setActive(index)} onKeyDown={event => {
    if ((event.target as HTMLElement).closest("[contenteditable]")) return;
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault(); const next = event.key === "Home" ? 0 : event.key === "End" ? b.items.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + b.items.length) % b.items.length;
    setActive(next); const tab = tablist.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]; tab?.focus(); tab?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" });
  }}>{b.itemText(item, index, "title", "span")}</EditableChoice></div>)}</div><div className="nv-service-panels">{b.items.map((item, index) => <div key={item.id} id={`${section.id}-panel-${index}`} role={editable ? "region" : "tabpanel"} aria-labelledby={`${section.id}-tab-${index}`} hidden={index !== current} tabIndex={editable ? undefined : 0} className="nv-service-panel" data-item-id={item.id}><div className="nv-service-panel-copy"><span className="nv-service-icon">{b.icon(item, "Scale", 30)}</span>{b.itemText(item, index, "title", "h3", "nv-service-title")}{b.itemText(item, index, "meta", "p", "nv-meta")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.tags(item, index)}{b.details(item, index)}{b.itemLink(item, index)}</div>{(item.image || b.c.image || sceneImage) && <EditableImage image={item.image || b.c.image || sceneImage} editable={editable} className="nv-service-image" onChange={value => item.image ? b.updateItem(index, "image", value) : b.update("image", value)} />}</div>)}</div></>}{b.actions()}</div>;
}

function NavyPeople({ b, editable, section }: InnerProps) {
  const count = b.items.length; const requested = section.design.columns;
  const featured = count === 1 || (count > 3 && count % 2 === 1 && count % requested !== 0);
  const rest = count - Number(featured); const slots = rest || count || 1;
  const columns = [4, 3, 2, 1].find(value => value <= requested && value <= slots && slots % value === 0) || 1;
  const tabletColumns = slots % 2 === 0 ? 2 : Math.min(3, slots);
  const gridStyle = { "--nv-people-columns": columns, "--nv-people-tablet": tabletColumns, "--nv-people-small": slots % 2 === 0 ? 2 : 1 } as CSSProperties;
  return <div className="nv-wrap nv-scene nv-people">{b.intro()}<div className="nv-people-grid" style={gridStyle} data-count={count}>{b.items.map((person, index) => <article key={person.id} data-item-id={person.id} className={`nv-person${featured && index === 0 ? " nv-person--lead" : ""}`}>{b.itemImage(person, index, "nv-person-image")}<div className="nv-person-content"><div className="nv-person-name">{person.href ? <ContentLink href={person.href} editable={editable}>{b.itemText(person, index, "title", "h3")}<ArrowUpRight size={23} /></ContentLink> : b.itemText(person, index, "title", "h3")}</div>{b.itemText(person, index, "meta", "p", "nv-person-role")}{b.itemText(person, index, "text", "p", "nv-copy")}{b.tags(person, index)}{(person.email || person.phone) && <div className="nv-person-contact">{person.email && <ContentLink href={`mailto:${person.email}`} editable={editable} label={teamEmailLabel(person)}><Mail size={17} /><span>{person.label === "Sekretariat" ? "Sekretariat: " : ""}{person.email}</span></ContentLink>}{person.phone && <ContentLink href={`tel:${person.phone.replace(/[^+\d]/g, "")}`} editable={editable}><Phone size={17} /><span>{person.phone}</span></ContentLink>}</div>}{person.details?.length ? <details className="nv-person-profile"><summary>Vita und Qualifikationen<ChevronDown size={18} /></summary>{b.details(person, index)}</details> : null}</div></article>)}</div>{b.actions()}</div>;
}

function NavySplit({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-split">{b.image("nv-split-image")}<div className="nv-split-copy">{b.heading()}{b.text("subheading", "p", "nv-subheading")}{b.text("text", "p", "nv-copy")}{b.items.length > 0 && <ul className="nv-split-points">{b.items.map((item, index) => <li key={item.id} data-item-id={item.id}>{b.icon(item, "Check")}<div>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nv-copy")}</div></li>)}</ul>}{b.actions()}</div></div>;
}

function NavyContact({ b, site, editable }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-contact">{b.intro()}<div className="nv-contact-grid"><div className="nv-contact-card"><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} className="nv-contact-phone"><Phone size={24} /><span>{site.phone}</span><ArrowUpRight size={22} /></ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable} className="nv-contact-email"><Mail size={22} /><span>{site.email}</span></ContentLink><div className="nv-contact-address"><MapPin size={22} /><address><strong>{site.legalName}</strong>{site.address}<br />{site.postalCode} {site.city}</address></div><div className="nv-contact-hours"><Clock3 size={22} /><div>{site.openingHours.map((entry, index) => <p key={index}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div></div>{b.actions()}</div><div className="nv-contact-form"><ContactForm editable={editable} /></div></div></div>;
}

function NavyFaq({ b, editable }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-faq"><header>{b.heading()}{b.text("subheading", "p", "nv-subheading")}{b.text("text", "p", "nv-copy")}{b.actions()}</header><div className="nv-faq-list">{b.items.map((item, index) => <ContentDisclosure editable={editable} key={item.id} data-item-id={item.id} className="nv-faq-item" summary={<>{b.itemText(item, index, "title", "h3")}<ChevronDown size={21} aria-hidden="true" /></>}><div className="nv-faq-answer">{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div></ContentDisclosure>)}</div></div>;
}

function NavyProcess({ section, b, editable }: InnerProps) {
  const [active, setActive] = useState(0); const list = useRef<HTMLOListElement>(null); const current = Math.min(active, Math.max(0, b.items.length - 1));
  return <div className="nv-wrap nv-scene nv-process">{b.intro()}<ol className="nv-process-flow" ref={list} style={{ "--nv-steps": Math.max(1, b.items.length) } as CSSProperties}>{b.items.map((item, index) => <li key={item.id} data-item-id={item.id} className={current === index ? "is-active" : ""}><EditableChoice editable={editable} type="button" aria-expanded={current === index} aria-controls={`${section.id}-step-${index}`} onChoose={() => setActive(index)} onKeyDown={event => {
    if ((event.target as HTMLElement).closest("[contenteditable]")) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault(); const next = (index + (event.key === "ArrowRight" ? 1 : -1) + b.items.length) % b.items.length;
    setActive(next); list.current?.querySelectorAll("button")[next]?.focus();
  }}><span className="nv-step-node">{index + 1}</span>{b.itemText(item, index, "title", "span", "nv-step-label")}</EditableChoice></li>)}</ol><div className="nv-process-panels">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} id={`${section.id}-step-${index}`} hidden={index !== current} className="nv-process-panel"><div><span className="nv-process-symbol">{b.icon(item, "Route", 34)}</span>{b.itemText(item, index, "title", "h3", "nv-process-title")}{b.itemText(item, index, "meta", "p", "nv-meta")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div>{item.image && b.itemImage(item, index, "nv-process-image")}</article>)}</div>{b.actions()}</div>;
}

function NavyStats({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-stats">{b.intro()}<dl className="nv-stat-board">{b.items.map((item, index) => <div key={item.id} data-item-id={item.id} className="nv-stat"><dt>{b.itemText(item, index, "text", "span")}</dt><dd>{b.itemText(item, index, "title", "span")}{item.meta && b.itemText(item, index, "meta", "p", "nv-meta")}</dd></div>)}</dl>{b.actions()}</div>;
}

function NavyGallery({ b, editable }: InnerProps) {
  const images = b.c.images || []; const [active, setActive] = useState<number | null>(null); const dialogRef = useRef<HTMLDialogElement>(null); const opener = useRef<HTMLButtonElement | null>(null);
  const index = active === null ? null : Math.min(active, Math.max(0, images.length - 1)); const image = index === null ? undefined : images[index];
  useEffect(() => { const dialog = dialogRef.current; if (active !== null && dialog && !dialog.open) dialog.showModal(); if (active === null && dialog?.open) { dialog.close(); opener.current?.focus(); } }, [active]);
  return <div className="nv-wrap nv-scene nv-gallery">{b.intro()}<div className="nv-gallery-grid">{images.map((entry, imageIndex) => <figure key={imageIndex} className="nv-gallery-tile"><EditableImage image={entry} editable={editable} className="nv-gallery-image" onChange={value => b.update("images", images.map((current, position) => position === imageIndex ? value : current))} />{!editable && <button type="button" className="nv-gallery-enlarge" aria-label={`${entry.alt || "Bild"} vergrößern`} onClick={event => { opener.current = event.currentTarget; setActive(imageIndex); }}><Maximize2 size={20} /></button>}{(entry.caption || editable) && <figcaption><EditableText as="span" value={entry.caption} editable={editable} onChange={value => b.update("images", images.map((current, position) => position === imageIndex ? { ...current, caption: value } : current))} /></figcaption>}</figure>)}</div>{b.actions()}
    <dialog ref={dialogRef} className="nv-lightbox" aria-label="Bildergalerie" onCancel={() => setActive(null)} onClick={event => { if (event.target === event.currentTarget) setActive(null); }} onKeyDown={event => { if (!images.length || active === null) return; if (event.key === "ArrowRight") setActive((active + 1) % images.length); if (event.key === "ArrowLeft") setActive((active - 1 + images.length) % images.length); }}><button type="button" className="nv-lightbox-close" aria-label="Bildergalerie schließen" onClick={() => setActive(null)}><X size={26} /></button>{image && <div className="nv-lightbox-body"><img src={image.src} alt={image.alt} />{image.caption && <p>{image.caption}</p>}</div>}{images.length > 1 && <div className="nv-lightbox-controls"><button type="button" aria-label="Vorheriges Bild" onClick={() => setActive(((active || 0) - 1 + images.length) % images.length)}><ArrowLeft size={23} /></button><span>{(index || 0) + 1} / {images.length}</span><button type="button" aria-label="Nächstes Bild" onClick={() => setActive(((active || 0) + 1) % images.length)}><ArrowRight size={23} /></button></div>}</dialog>
  </div>;
}

function NavyRichtext({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-richtext">{b.heading()}{b.text("subheading", "p", "nv-subheading")}{b.c.image && b.image("nv-richtext-image")}{b.text("text", "div", "nv-richtext-body")}{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="nv-richtext-passage">{b.itemText(item, index, "title", "h3", "nv-item-heading")}{b.itemText(item, index, "text", "p", "nv-copy")}{item.image && b.itemImage(item, index, "nv-richtext-image")}{b.details(item, index)}{b.itemLink(item, index)}</article>)}{b.actions()}</div>;
}

function NavyCta({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene"><div className="nv-cta"><div>{b.heading("nv-cta-heading")}{b.text("subheading", "p", "nv-subheading")}{b.text("text", "p", "nv-copy")}</div>{b.actions()}</div></div>;
}

function NavyBento({ b, section }: InnerProps) {
  const count = b.items.length; const columns = Math.min(count || 1, section.design.columns); const remainder = count % columns;
  return <div className="nv-wrap nv-scene nv-bento">{b.intro()}<div className="nv-bento-grid" data-count={count}>{b.items.map((item, index) => {
    const span = remainder && index >= count - remainder ? 12 / remainder : 12 / columns;
    const style = { "--nv-card-span": span, "--nv-card-tablet": count % 2 === 1 && index === count - 1 ? 12 : 6 } as CSSProperties;
    return <article key={item.id} data-item-id={item.id} style={style} className={`nv-bento-tile${item.image ? " nv-bento-tile--image" : ""}${span >= 6 ? " nv-bento-tile--wide" : ""}`}>{item.image && b.itemImage(item, index, "nv-bento-image")}<div className="nv-bento-content"><div className="nv-bento-top"><span className="nv-bento-icon">{b.icon(item, "ArrowUpRight", 28)}</span>{b.itemText(item, index, "meta", "span", "nv-meta")}</div>{b.itemText(item, index, "title", "h3", "nv-bento-title")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.tags(item, index)}{b.details(item, index)}{b.itemLink(item, index)}</div></article>;
  })}</div>{b.actions()}</div>;
}

function NavyList({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-checklist">{b.intro()}<ul className="nv-checklist-grid">{b.items.map((item, index) => <li key={item.id} data-item-id={item.id}><span className="nv-checklist-icon">{b.icon(item, "Check", 22)}</span><div>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div></li>)}</ul>{b.actions()}</div>;
}

function NavyDownloads({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-downloads">{b.intro()}<div className="nv-download-grid">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="nv-file-card"><div className="nv-file-top"><span>{b.icon(item, "FileText", 31)}</span>{b.itemText(item, index, "meta", "span", "nv-meta")}</div>{b.itemText(item, index, "title", "h3", "nv-file-title")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}<div className="nv-file-action">{b.itemLink(item, index, "Herunterladen", "nv-text-link", true)}</div></article>)}</div>{b.actions()}</div>;
}

function NavyQuote({ b, editable }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-quotation">{(b.c.heading || editable) && b.heading("nv-quote-heading")}<figure className={`nv-quote-layout${b.c.image ? " nv-quote-layout--image" : ""}`}><div className="nv-quote-content"><Quote size={36} strokeWidth={1.5} aria-hidden="true" />{b.text("quote", "blockquote", "nv-quote-text")}</div>{b.c.image && b.image("nv-quote-image")}<figcaption className="nv-quote-credit">{b.text("attribution", "span", "nv-quote-name")}{b.text("text", "span", "nv-copy")}</figcaption></figure>{b.actions()}</div>;
}

function NavyLogos({ b, editable }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-affiliations">{b.intro()}<div className="nv-logo-grid">{(b.c.images || []).map((entry, index) => <div key={index} className="nv-logo-cell"><EditableImage image={entry} editable={editable} className="nv-logo-image" onChange={value => b.update("images", b.c.images!.map((image, position) => index === position ? value : image))} /></div>)}{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="nv-logo-cell">{item.image ? b.itemImage(item, index, "nv-logo-image") : b.icon(item, "BadgeCheck", 30)}{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.itemLink(item, index, "Zur Website")}</article>)}</div>{b.actions()}</div>;
}

function NavyVideo({ b, editable }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-video">{b.intro()}<div className="nv-video-stage"><div className="nv-media"><ExternalMedia kind="video" url={b.c.videoUrl} title={b.c.heading} editable={editable} /></div></div>{b.text("caption", "p", "nv-media-caption")}{b.actions()}</div>;
}

function NavyMap({ b, site, editable }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-map"><header>{b.heading()}{b.text("subheading", "p", "nv-subheading")}{b.text("text", "p", "nv-copy")}</header><div className="nv-map-board"><div className="nv-map-address"><span className="nv-map-pin"><MapPin size={27} /></span><address><strong>{site.name}</strong>{site.address}<br />{site.postalCode} {site.city}</address><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} className="nv-text-link"><Phone size={18} />{site.phone}</ContentLink>{b.actions()}</div><div className="nv-media nv-map-media"><ExternalMedia kind="map" address={b.c.mapAddress || `${site.legalName}, ${site.address}, ${site.postalCode} ${site.city}`} url={b.c.videoUrl} title={b.c.heading} editable={editable} /></div></div></div>;
}

function NavyTimeline({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-timeline-scene">{b.intro()}<ol className="nv-timeline">{b.items.map((item, index) => <li key={item.id} data-item-id={item.id}><div className="nv-timeline-date">{b.itemText(item, index, item.meta ? "meta" : "title", "span")}</div><div className="nv-timeline-point" aria-hidden="true" /><article className="nv-timeline-card">{item.image && b.itemImage(item, index, "nv-timeline-image")}<div>{item.meta && b.itemText(item, index, "title", "h3", "nv-item-heading")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div></article></li>)}</ol>{b.actions()}</div>;
}

function NavyNotice({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene"><aside className="nv-notice"><span className="nv-notice-icon"><Info size={27} /></span><div>{b.heading("nv-notice-heading")}{b.text("subheading", "p", "nv-subheading")}{b.text("text", "p", "nv-copy")}{b.items.map((item, index) => <div key={item.id} data-item-id={item.id} className="nv-notice-item">{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div>)}{b.actions()}</div></aside></div>;
}

function NavyComparison({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-comparison">{b.intro()}<div className="nv-comparison-grid">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id} className="nv-comparison-option"><header>{b.icon(item, "Columns3", 28)}{b.itemText(item, index, "title", "h3", "nv-comparison-title")}{b.itemText(item, index, "meta", "p", "nv-meta")}</header>{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}<div className="nv-comparison-action">{b.itemLink(item, index)}</div></article>)}</div>{b.actions()}</div>;
}

function NavyColumns({ b }: InnerProps) {
  return <div className="nv-wrap nv-scene nv-columns">{b.intro()}<div className="nv-column-grid">{b.items.map((item, index) => <article key={item.id} data-item-id={item.id}>{item.image && b.itemImage(item, index, "nv-column-image")}<div className="nv-column-title">{b.icon(item, "BookOpen", 24)}{b.itemText(item, index, "title", "h3", "nv-item-heading")}</div>{b.itemText(item, index, "text", "p", "nv-copy")}{b.details(item, index)}{b.itemLink(item, index)}</article>)}</div>{b.actions()}</div>;
}

function NavyHours({ b, section, site, editable }: InnerProps) {
  const items: ContentItem[] = b.items.length ? b.items : site.openingHours.map((entry, index) => ({ id: `${section.id}-hours-${index}`, title: entry.day, text: entry.hours }));
  const change = (index: number, key: "title" | "text", value: string) => b.update("items", items.map((item, position) => position === index ? { ...item, [key]: value } : item));
  return <div className="nv-wrap nv-scene nv-hours"><header><span className="nv-hours-symbol"><Clock3 size={29} /></span>{b.heading()}{b.text("subheading", "p", "nv-subheading")}{b.text("text", "p", "nv-copy")}{b.actions()}</header><div className="nv-hours-schedule">{items.map((item, index) => <div key={item.id} data-item-id={item.id} className="nv-hours-entry"><EditableText as="h3" value={item.title} editable={editable} onChange={value => change(index, "title", value)} /><EditableText as="p" value={item.text} editable={editable} onChange={value => change(index, "text", value)} />{item.meta && b.itemText(item, index, "meta", "span", "nv-meta")}</div>)}</div></div>;
}
