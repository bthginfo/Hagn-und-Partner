"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, Mail, MapPin, Minus, Phone, Plus, Search, X } from "lucide-react";
import type { ContentItem, Section, SectionContent } from "@/lib/types";
import { ContentDisclosure, ContentLink, EditableImage, EditableText, safeHref, teamEmailLabel } from "../editable";
import { copyrightText, footerConfig } from "@/lib/site-config";
import { FooterLegalLinks, FooterNavigation } from "../footer-navigation";
import { ContactForm } from "../contact-form";
import { consentEvent } from "../consent";
import type { VariantSectionProps, VariantSiteProps } from "./types";
import { CinematicContactDock, CinematicScene, CinematicTopicViewport } from "./cinematic-scenes";
import { SectionHeadingProvider, useSectionHeadingLevel } from "../heading-level";
import { CinematicInnerSection, cinematicInnerTypes } from "./cinematic-inner";
import { useSmartHeader } from "../smart-header";
import { HeroComposition } from "./hero-compositions";

const cinematicTypes = new Set(["hero", "cinematic-hero", "statement", "kinetic-statement", "services", "focus-finder", "team", "portrait-rail", "steps", "stacked-panels", "cta", "contact-dock", "contact", "faq", "accordion", "split", "gallery"]);
const heroTypes = new Set(["hero", "cinematic-hero", "editorial-hero"]);

export function ImmersiveSite({ page, site, editable, selectedSectionId, onSectionSelect, onSectionChange, fallback }: VariantSiteProps) {
  const Main = editable ? "div" : "main";
  const portraits = page.sections.filter(section => (section.visible || editable) && (section.type === "team" || section.type === "portrait-rail" || section.type === "portrait-mosaic")).flatMap(section => section.content.items || []).filter(item => item.image);
  const first = page.sections.find(section => section.visible || editable);
  const sceneImage = page.sections.find(section => section.visible && section.type === "split" && section.content.image)?.content.image ?? first?.content.image;
  return <>
    <ImmersiveHeader site={site} page={page} editable={editable} overlay={Boolean(first && heroTypes.has(first.type) && (!first.design.heroLayout || first.design.heroLayout === "auto"))} fallback={fallback} />
    <Main data-site-main={editable ? "" : undefined} role={editable ? "region" : undefined} aria-label={editable ? `Seitenvorschau: ${page.title}` : undefined} id="hauptinhalt" tabIndex={editable ? undefined : -1} className="iv-main">
      {page.sections.filter(section => section.visible || editable).map(section => <SectionHeadingProvider key={section.id} sectionId={section.id}>{cinematicTypes.has(section.type) || cinematicInnerTypes.has(section.type) ? <ImmersiveSection section={section} site={site} editable={editable} selected={selectedSectionId === section.id} onSelect={() => onSectionSelect?.(section.id)} onChange={onSectionChange} portraits={portraits} sceneImage={sceneImage} /> : <div className="iv-fallback">{fallback(section)}</div>}</SectionHeadingProvider>)}
      {!page.sections.length && editable && <div className="iv-empty-page"><Plus size={32} /><p>Fügen Sie einen Abschnitt aus der Bibliothek hinzu.</p></div>}
    </Main>
    <ImmersiveFooter site={site} editable={editable} />
    {!editable && <CinematicContactDock site={site} />}
  </>;
}

function ImmersiveHeader({ site, page, editable, overlay }: VariantSiteProps & { overlay: boolean }) {
  const [open, setOpen] = useState(false); const menu = useRef<HTMLDialogElement>(null); const toggle = useRef<HTMLButtonElement>(null); const id = useId();
  const smartHeader = useSmartHeader({ open, disabled: editable });
  const contact = site.navigation.find(item => /kontakt/.test(item.href));
  useEffect(() => { const dialog = menu.current; if (open && dialog && !dialog.open) dialog.showModal(); if (!open && dialog?.open) { dialog.close(); toggle.current?.focus(); } }, [open]);
  return <header {...smartHeader} className={`iv-header ${overlay ? "iv-header--overlay" : ""}`}>
    <div className="iv-reading-progress" aria-hidden="true"><span /></div>
    <ContentLink href="/" editable={editable} className="iv-brand"><strong>{site.name}</strong><span>{site.tagline}</span></ContentLink>
    <div className="iv-header-right">{contact && <ContentLink href={contact.href} editable={editable} className="iv-header-appointment">{contact.label}<ArrowUpRight size={17} /></ContentLink>}<button type="button" ref={toggle} aria-expanded={open} aria-controls={id} aria-label="Menü öffnen" className="iv-menu-toggle" onClick={() => setOpen(true)}><span>Menü</span><i /><i /></button></div>
    <dialog ref={menu} id={id} className="iv-menu" aria-label="Hauptnavigation" onCancel={() => setOpen(false)}>
      <div className="iv-menu-top"><ContentLink href="/" editable={editable} className="iv-brand"><strong>{site.name}</strong><span>{site.tagline}</span></ContentLink><button type="button" aria-label="Menü schließen" onClick={() => setOpen(false)}>Schließen<X size={23} /></button></div>
      <div className="iv-menu-body"><nav aria-label="Hauptnavigation">{site.navigation.map(item => <a href={safeHref(item.href)} aria-current={item.href.replace(/^\//, "") === page.slug.replace(/^\//, "") ? "page" : undefined} key={item.href} onClick={event => { if (editable) event.preventDefault(); setOpen(false); }}><span>{item.label}</span><ArrowUpRight strokeWidth={1} /></a>)}</nav><div className="iv-menu-contact"><p>{site.legalName}</p><address>{site.address}<br />{site.postalCode} {site.city}</address><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable}>{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}>{site.email}</ContentLink></div></div>
      <div className="iv-menu-bottom"><span>{site.tagline}</span><div><FooterLegalLinks site={site} editable={editable} /></div></div>
    </dialog>
  </header>;
}

function ImmersiveFooter({ site, editable }: Pick<VariantSiteProps, "site" | "editable">) {
  const footer = footerConfig(site);
  return <footer className="iv-footer"><div className="iv-footer-top"><p>{site.footerText}</p>{footer.ctaLabel && <ContentLink href={footer.ctaHref} editable={editable} className="iv-footer-connect">{footer.ctaLabel}<ArrowUpRight size={35} strokeWidth={1.2} /></ContentLink>}</div>
    <div className="iv-footer-grid" style={{ "--footer-area-count": Math.max(1, Number(footer.showAddress) + Number(footer.showContact || footer.showHours) + Number(footer.columns.length > 0)) } as CSSProperties}>
      {footer.showAddress && <div className="iv-footer-address">{footer.addressHeading && <h2>{footer.addressHeading}</h2>}<p>{site.legalName}</p><address>{site.address}<br />{site.postalCode} {site.city}</address></div>}
      {(footer.showContact || footer.showHours) && <div className="iv-footer-contact">{footer.contactHeading && <h2>{footer.contactHeading}</h2>}{footer.showContact && <><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable}>{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}>{site.email}</ContentLink></>}{footer.showHours && <div className="iv-footer-hours-group">{site.openingHours.map(entry => <p className="iv-footer-hours" key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>}</div>}
      <FooterNavigation site={site} editable={editable} />
    </div>
    {footer.brandText && <ContentLink href="/" editable={editable} className="iv-footer-wordmark" label={`${footer.brandText} – Startseite`}>{footer.brandText}</ContentLink>}
    <div className="iv-footer-bottom"><span>{copyrightText(site)}</span><div><FooterLegalLinks site={site} editable={editable} />{site.consent.enabled && footer.showCookieSettings && <button type="button" onClick={() => { if (!editable) window.dispatchEvent(new Event(consentEvent)); }}>Cookie-Einstellungen</button>}</div>{footer.showBackToTop && <a href="#hauptinhalt" aria-label="Zum Seitenanfang" className="iv-back-top"><ArrowUp size={18} /></a>}</div>
  </footer>;
}

type Bindings = ReturnType<typeof useBindings>;
function useBindings({ section, onChange, editable }: VariantSectionProps) {
  const content = section.content;
  const headingLevel = useSectionHeadingLevel(section.id);
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...content, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (content.items || []).map((item, position) => position === index ? { ...item, [key]: value } : item));
  const text = (key: "heading" | "subheading" | "text" | "quote" | "attribution" | "caption", as: "h1" | "h2" | "h3" | "p" | "span" | "div" | "blockquote" = "p", className = "") => <EditableText as={key === "heading" ? headingLevel : as} value={content[key]} editable={editable} className={className} onChange={value => update(key, value)} />;
  const itemText = (item: ContentItem, index: number, key: "title" | "text" | "meta" | "label", as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} className={className} onChange={value => updateItem(index, key, value)} />;
  const actions = (className = "") => <div className={`iv-actions ${className}`}>{(content.primaryLabel || editable) && <ContentLink href={content.primaryHref} editable={editable} className="iv-button"><EditableText as="span" value={content.primaryLabel} editable={editable} onChange={value => update("primaryLabel", value)} /><ArrowUpRight size={21} strokeWidth={1.5} /></ContentLink>}{content.secondaryLabel && <ContentLink href={content.secondaryHref} editable={editable} className="iv-secondary-link"><EditableText as="span" value={content.secondaryLabel} editable={editable} onChange={value => update("secondaryLabel", value)} /><ArrowUpRight size={17} /></ContentLink>}</div>;
  const details = (item: ContentItem, index: number) => item.details?.length ? <ul className="iv-item-details">{item.details.map((entry, detailIndex) => <li key={detailIndex}><Check size={15} aria-hidden="true" /><EditableText as="span" value={entry} editable={editable} onChange={value => updateItem(index, "details", item.details!.map((text, position) => position === detailIndex ? value : text))} /></li>)}</ul> : null;
  return { content, update, updateItem, text, itemText, actions, details };
}

const palettes: Record<string, { theme: string; bg: string; fg: string }> = {
  hero: { theme: "light", bg: "var(--hp-palette-primary, #1d1c58)", fg: "var(--hp-palette-background, #fff9ff)" }, statement: { theme: "light", bg: "var(--hp-palette-accent, #fbd8ee)", fg: "var(--hp-palette-primary, #1d1c58)" }, services: { theme: "soft", bg: "var(--hp-palette-background, #f4f2fa)", fg: "var(--hp-palette-primary, #1d1c58)" }, team: { theme: "dark", bg: "var(--hp-palette-primary, #1d1c58)", fg: "var(--hp-palette-background, #fff9ff)" }, steps: { theme: "light", bg: "#272364", fg: "var(--hp-palette-background, #fff9ff)" }, cta: { theme: "accent", bg: "var(--hp-palette-accent, #fbd8ee)", fg: "var(--hp-palette-primary, #1d1c58)" }, contact: { theme: "light", bg: "var(--hp-palette-primary, #1d1c58)", fg: "var(--hp-palette-background, #fff9ff)" }, faq: { theme: "soft", bg: "var(--hp-palette-background, #f4f2fa)", fg: "var(--hp-palette-primary, #1d1c58)" }, split: { theme: "light", bg: "var(--hp-palette-surface, #ede9f7)", fg: "var(--hp-palette-primary, #1d1c58)" }, gallery: { theme: "light", bg: "var(--hp-palette-primary, #1d1c58)", fg: "var(--hp-palette-background, #fff9ff)" },
};
const baseType = (type: string) => ({ "cinematic-hero": "hero", "kinetic-statement": "statement", "focus-finder": "services", "portrait-rail": "team", "stacked-panels": "steps", "contact-dock": "cta", "accordion": "faq" }[type] || type);

export function ImmersiveSection(props: VariantSectionProps) {
  const { section, editable, selected, onSelect } = props; const binding = useBindings(props); const type = baseType(section.type); const { design } = section; const defaultPalette = palettes[type] || palettes.statement;
  if (cinematicInnerTypes.has(section.type)) return <CinematicInnerSection {...props} />;
  const palette = design.theme === defaultPalette.theme ? defaultPalette : design.theme === "dark" ? { bg: "var(--hp-palette-primary, #1d1c58)", fg: "var(--hp-palette-background, #fff9ff)" } : design.theme === "accent" ? { bg: "var(--hp-palette-accent, #fbd8ee)", fg: "var(--hp-palette-primary, #1d1c58)" } : design.theme === "soft" ? { bg: "var(--hp-palette-surface, #ded9f0)", fg: "var(--hp-palette-primary, #1d1c58)" } : { bg: "var(--hp-palette-background, #f4f2fa)", fg: "var(--hp-palette-primary, #1d1c58)" };
  const style = { "--iv-section-bg": design.background || palette.bg, "--iv-section-fg": design.textColor || (palette.fg === "var(--hp-palette-primary, #1d1c58)" ? "var(--hp-palette-text, #1d1c58)" : palette.fg), "--iv-section-accent": design.accentColor || "var(--hp-palette-accent, #fbd8ee)", "--iv-scale": design.fontScale, "--iv-radius": `${design.radius}px`, "--iv-columns": design.columns, "--iv-heading-font": design.headingFont === "sans" ? "var(--font-body)" : "var(--font-cinematic)", borderWidth: design.border ? `${design.border}px` : undefined } as CSSProperties;
  let body: ReactNode;
  if (type === "hero") body = design.heroLayout && design.heroLayout !== "auto" ? <div className="iv-container iv-composed-hero"><HeroComposition {...props} world={3} layout={design.heroLayout} /></div> : <CinematicScene {...props} />;
  else if (type === "statement") body = <KineticStatement {...props} binding={binding} />;
  else if (type === "services") body = <CinematicTopicViewport {...props} />;
  else if (type === "team") body = <PortraitRail {...props} binding={binding} />;
  else if (type === "steps") body = <StackedPanels {...props} binding={binding} />;
  else if (type === "cta") body = <ContactDock {...props} binding={binding} />;
  else if (type === "contact") body = <ContactSection {...props} binding={binding} />;
  else if (type === "faq") body = <CinematicFaq {...props} binding={binding} />;
  else if (type === "split") body = <CinematicSplit {...props} binding={binding} />;
  else if (type === "gallery") body = <CinematicGallery {...props} binding={binding} />;
  else body = <div className="iv-container">{binding.text("heading", "h2", "iv-heading")}{binding.text("text", "p", "iv-body-copy")}{binding.actions()}</div>;
  return <section id={section.anchor || section.id} data-section-id={section.id} data-section-type={section.type} data-theme={design.theme} className={`iv-section iv-section--${type} iv-width--${design.width} iv-spacing--${design.spacing} iv-align--${design.align} iv-animation--${design.animation}${editable ? " hp-editable-section" : ""}${selected ? " hp-section-selected" : ""}${!section.visible ? " hp-section-hidden" : ""}`} style={style} onClick={editable ? event => { if ((event.target as HTMLElement).closest("[contenteditable]")) event.preventDefault(); onSelect?.(); } : undefined}>
    {editable && <button type="button" className="hp-section-select" onClick={event => { event.stopPropagation(); onSelect?.(); }} aria-label={`${section.name} auswählen`}>{section.name}{!section.visible && " · ausgeblendet"}</button>}{body}
  </section>;
}

type InnerProps = VariantSectionProps & { binding: Bindings };

function KineticStatement({ binding: b }: InnerProps) {
  return <div className="iv-statement iv-container"><div className="iv-statement-mark" aria-hidden="true"><svg viewBox="0 0 100 100" fill="none"><path d="M15 15h70v70M84 16 16 84" stroke="currentColor" strokeWidth="1.4" /></svg></div>{b.text("heading", "h2", "iv-statement-heading")}<div className="iv-statement-bottom">{b.content.subheading && b.text("subheading", "p", "iv-statement-subheading")}<div>{b.text("text", "p", "iv-body-copy")}{b.actions()}</div></div></div>;
}

function PortraitRail({ editable, binding: b }: InnerProps) {
  const rail = useRef<HTMLDivElement>(null); const [active, setActive] = useState(0); const items = b.content.items || [];
  function scrollTo(index: number) { const viewport = rail.current; if (!viewport) return; const next = Math.max(0, Math.min(index, items.length - 1)); const panel = viewport.children[next] as HTMLElement | undefined; if (!panel) return; viewport.scrollTo({ left: panel.offsetLeft - (viewport.children[0] as HTMLElement).offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }
  return <div className="iv-portraits"><div className="iv-portrait-intro iv-container"><div>{b.text("heading", "h2", "iv-heading")}{b.content.subheading && b.text("subheading", "p", "iv-subheading")}</div><div>{b.text("text", "p", "iv-body-copy")}<div className="iv-rail-controls"><span aria-live="polite">{items.length ? String(active + 1).padStart(2, "0") : "00"}<i />{String(items.length).padStart(2, "0")}</span><button type="button" aria-label="Vorherige Person" disabled={active <= 0} onClick={() => scrollTo(active - 1)}><ArrowLeft size={22} strokeWidth={1.4} /></button><button type="button" aria-label="Nächste Person" disabled={active >= items.length - 1} onClick={() => scrollTo(active + 1)}><ArrowRight size={22} strokeWidth={1.4} /></button></div></div></div><div className="iv-portrait-rail" ref={rail} tabIndex={0} role="region" aria-label="Unsere Rechtsanwältinnen und Rechtsanwälte" onKeyDown={event => { if ((event.target as HTMLElement).closest("[contenteditable]")) return; if (event.key === "ArrowRight") { event.preventDefault(); scrollTo(active + 1); } if (event.key === "ArrowLeft") { event.preventDefault(); scrollTo(active - 1); } }} onScroll={event => { const viewport = event.currentTarget; const panels = Array.from(viewport.children) as HTMLElement[]; if (!panels.length) return; const start = panels[0].offsetLeft; let nearest = 0; let distance = Infinity; panels.forEach((panel, index) => { const next = Math.abs(panel.offsetLeft - start - viewport.scrollLeft); if (next < distance) { nearest = index; distance = next; } }); setActive(nearest); }}>{items.map((item, index) => <article className={`iv-portrait-panel ${index === active ? "iv-portrait-panel--active" : ""}`} key={item.id} data-item-id={item.id} aria-label={item.title}><div className="iv-portrait-photo"><EditableImage image={item.image} editable={editable} onChange={image => b.updateItem(index, "image", image)} className="iv-portrait-image" /><div className="iv-portrait-name">{item.href ? <ContentLink href={item.href} editable={editable}>{b.itemText(item, index, "title", "h3")}<ArrowUpRight size={37} strokeWidth={1.2} /></ContentLink> : b.itemText(item, index, "title", "h3")}</div></div><div className="iv-portrait-info"><div>{b.itemText(item, index, "meta", "p", "iv-portrait-role")}{b.itemText(item, index, "text", "p", "iv-portrait-description")}</div><div className="iv-portrait-right">{item.tags?.length ? <div className="iv-portrait-tags">{item.tags.map((tag, tagIndex) => <EditableText as="span" value={tag} key={tagIndex} editable={editable} onChange={value => b.updateItem(index, "tags", item.tags!.map((entry, position) => position === tagIndex ? value : entry))} />)}</div> : null}{(item.email || item.phone) && <div className="iv-portrait-contact">{item.email && <ContentLink href={`mailto:${item.email}`} editable={editable} label={teamEmailLabel(item)}><Mail size={15} /><span>{item.label === "Sekretariat" ? "Sekretariat: " : ""}{item.email}</span></ContentLink>}{item.phone && <ContentLink href={`tel:${item.phone.replace(/[^+\d]/g, "")}`} editable={editable}><Phone size={15} />{item.phone}</ContentLink>}</div>}{item.details?.length ? <details className="iv-portrait-profile"><summary>Vita und Qualifikationen<ChevronDown size={14} /></summary>{b.details(item, index)}</details> : null}</div></div></article>)}</div><div className="iv-container">{b.actions("iv-portrait-actions")}</div></div>;
}

function StackedPanels({ editable, binding: b }: InnerProps) {
  return <div className="iv-process iv-container"><div className="iv-process-intro">{b.text("heading", "h2", "iv-heading")}{b.text("text", "p", "iv-body-copy")}{b.content.subheading && b.text("subheading", "p", "iv-subheading")}</div><ol className={`iv-process-stack ${editable ? "iv-process-stack--editing" : ""}`}>{(b.content.items || []).map((item, index) => <li key={item.id} data-item-id={item.id} className="iv-process-panel" style={{ "--iv-step": index } as CSSProperties}><span className="iv-process-number" aria-label={`Schritt ${index + 1}`}>{String(index + 1).padStart(2, "0")}</span><div>{b.itemText(item, index, "title", "h3")}<div>{b.itemText(item, index, "text", "p")}{b.details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="iv-underline-link">{item.label || "Mehr erfahren"}<ArrowUpRight size={16} /></ContentLink>}</div></div><ArrowUpRight className="iv-process-arrow" size={42} strokeWidth={1} aria-hidden="true" /></li>)}</ol>{b.actions()}</div>;
}

function ContactDock({ site, binding: b }: InnerProps) {
  return <div className="iv-dock iv-container"><div>{b.text("heading", "h2", "iv-dock-heading")}{b.content.subheading && b.text("subheading", "p", "iv-subheading")}</div><div className="iv-dock-bottom"><p className="iv-dock-location"><MapPin size={17} />{site.address}<br />{site.postalCode} {site.city}</p><div>{b.text("text", "p", "iv-body-copy")}{b.actions()}</div><ArrowUpRight className="iv-dock-arrow" strokeWidth={.65} aria-hidden="true" /></div></div>;
}

function ContactSection({ site, editable, binding: b }: InnerProps) {
  return <div className="iv-contact iv-container"><div className="iv-contact-header">{b.text("heading", "h2", "iv-heading")}{b.content.subheading && b.text("subheading", "p", "iv-subheading")}{b.text("text", "p", "iv-body-copy")}</div><div className="iv-contact-layout"><div className="iv-contact-information"><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} className="iv-contact-phone">{site.phone}<ArrowUpRight size={27} strokeWidth={1.2} /></ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable} className="iv-contact-email">{site.email}<ArrowUpRight size={19} /></ContentLink><address>{site.legalName}<br />{site.address}<br />{site.postalCode} {site.city}</address><ContentLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.postalCode} ${site.city}`)}`} editable={editable} target="_blank" className="iv-underline-link">Anfahrt planen<ArrowUpRight size={17} /></ContentLink><div className="iv-contact-hours">{site.openingHours.map(entry => <p key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>{site.fax && <p className="iv-contact-fax">Fax {site.fax}</p>}{b.actions()}</div><div className="iv-contact-form"><ContactForm editable={editable} /></div></div></div>;
}

function CinematicFaq({ editable, binding: b }: InnerProps) {
  return <div className="iv-faq iv-container"><div className="iv-faq-header">{b.text("heading", "h2", "iv-heading")}<div>{b.text("text", "p", "iv-body-copy")}{b.content.subheading && b.text("subheading", "p", "iv-subheading")}{b.actions()}</div></div><div className="iv-faq-list">{(b.content.items || []).map((item, index) => <ContentDisclosure editable={editable} key={item.id} data-item-id={item.id} className="iv-faq-item" summary={<>{b.itemText(item, index, "title", "h3")}<span><Plus size={25} strokeWidth={1.2} /><Minus size={25} strokeWidth={1.2} /></span></>}><div className="iv-faq-answer">{b.itemText(item, index, "text", "p")}{b.details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="iv-underline-link">{item.label || "Mehr erfahren"}<ArrowUpRight size={17} /></ContentLink>}</div></ContentDisclosure>)}</div></div>;
}

function CinematicSplit({ editable, section, binding: b }: InnerProps) {
  return <div className={`iv-split iv-split--${section.design.imageSide}`}><div className="iv-split-image-wrap"><EditableImage image={b.content.image} editable={editable} onChange={image => b.update("image", image)} className="iv-split-image" />{b.content.caption && b.text("caption", "span", "iv-split-caption")}</div><div className="iv-split-copy">{b.text("heading", "h2", "iv-heading")}{b.content.subheading && b.text("subheading", "p", "iv-subheading")}{b.text("text", "p", "iv-body-copy")}{(b.content.items || []).map((item, index) => <div key={item.id} data-item-id={item.id} className="iv-split-item">{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p")}{b.details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="iv-underline-link">{item.label || "Mehr erfahren"}<ArrowUpRight size={16} /></ContentLink>}</div>)}{b.actions()}</div></div>;
}

function CinematicGallery({ editable, binding: b }: InnerProps) {
  return <div className="iv-gallery iv-container"><div className="iv-gallery-intro">{b.text("heading", "h2", "iv-heading")}<div>{b.text("text", "p", "iv-body-copy")}{b.content.subheading && b.text("subheading", "p", "iv-subheading")}</div></div><div className="iv-gallery-images">{(b.content.images || []).map((image, index) => <EditableImage key={index} image={image} editable={editable} caption onChange={value => b.update("images", b.content.images!.map((entry, position) => position === index ? value : entry))} className="iv-gallery-image" />)}</div>{b.actions()}</div>;
}
