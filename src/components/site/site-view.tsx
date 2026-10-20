"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, BriefcaseBusiness, Building2, CalendarDays, Check, ChevronDown, Clock3, FileText, HeartHandshake, House, Info, Mail, MapPin, Menu, Minus, Phone, Plus, ShieldCheck, UsersRound, X } from "lucide-react";
import type { ContentItem, ImageValue, MediaAsset, PageContent, Section, SectionContent, SiteConfig } from "@/lib/types";
import { ContactForm } from "./contact-form";
import { ConsentManager, consentEvent, ExternalMedia } from "./consent";
import { ContentDisclosure, ContentLink, EditableImage, EditableText, safeHref, SiteMediaContext, teamEmailLabel } from "./editable";
import { footerConfig, copyrightText } from "@/lib/site-config";
import { FooterLegalLinks, FooterNavigation } from "./footer-navigation";
import { EditorialSection, EditorialSite } from "./variants/editorial";
import { ImmersiveSection, ImmersiveSite } from "./variants/immersive";
import { PanoramaHero, PanoramaServices } from "./variants/panorama";
import { BlogFeed } from "./blog-feed";
import { NoirSection, NoirSite } from "./variants/noir";
import { NavySection, NavySite } from "./variants/navy";
import { ContentIcon } from "./content-icon";
import { PageHeadingProvider, SectionHeadingProvider, useSectionHeadingLevel } from "./heading-level";
import { DesignReviewSwitcher, useDesignVariant, type DesignVariant } from "./preview-switcher";
import { paletteFor } from "@/lib/theme";
import { useSmartHeader } from "./smart-header";
import { HeroComposition } from "./variants/hero-compositions";

export interface SiteViewProps {
  page: PageContent;
  site: SiteConfig;
  editable?: boolean;
  variant?: DesignVariant;
  media?: MediaAsset[];
  selectedSectionId?: string;
  onSectionSelect?: (id: string) => void;
  onSectionChange?: (section: Section) => void;
}

export function SiteView({ page, site, editable = false, selectedSectionId, onSectionSelect, onSectionChange, variant, media }: SiteViewProps) {
  const Main = editable ? "div" : "main";
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeVariant, changeVariant] = useDesignVariant(variant, editable, site.designVariant);
  useEffect(() => {
    if (editable) return;
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("hp-in-view"); observer.unobserve(entry.target); } });
    }, { threshold: .12 });
    root.querySelectorAll("[data-hp-reveal]").forEach((node) => observer.observe(node));
    const scrollToAnchor = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link || link.hash.length < 2) return;
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      if (!target || !root.contains(target)) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
    };
    root.addEventListener("click", scrollToAnchor);
    return () => { observer.disconnect(); root.removeEventListener("click", scrollToAnchor); };
  }, [page.id, editable, activeVariant]);
  const palette = paletteFor(site, activeVariant);
  const paletteOverride = Boolean(site.theme.palettes?.[activeVariant]);
  const siteStyle = {
    "--hp-ink": activeVariant === 1 ? palette.primary : site.theme.primary, "--hp-accent": activeVariant === 1 ? palette.accent : site.theme.accent,
    "--hp-paper": activeVariant === 1 ? palette.background : site.theme.background, "--hp-radius": `${site.theme.radius}px`,
    "--font-body": site.theme.font === "manrope" ? "'Manrope Variable', 'Manrope', sans-serif" : "'DM Sans Variable', 'DM Sans', sans-serif",
    "--hp-display": site.theme.font === "dm-sans" ? "var(--font-body)" : "var(--font-display)",
    ...(paletteOverride ? { "--hp-palette-primary": palette.primary, "--hp-palette-accent": palette.accent, "--hp-palette-background": palette.background, "--hp-palette-text": palette.text, "--hp-palette-surface": palette.surface, "--hp-palette-border": palette.border } : {}),
  } as CSSProperties;
  const portraits = page.sections.filter((section) => section.visible && ["team", "portrait-mosaic", "portrait-rail", "people-index", "navy-people"].includes(section.type)).flatMap((section) => section.content.items ?? []);
  const sceneImage = page.sections.find((section) => section.visible && section.type === "split" && section.content.image)?.content.image ?? page.sections.find((section) => section.visible && section.content.image)?.content.image;
  const firstHeadingId = page.sections.find((section) => section.visible && section.content.heading.trim() && (!section.type.startsWith("blog-") || (site.blog?.enabled && section.content.items?.length)))?.id ?? null;
  const fallback = (section: Section) => <SectionHeadingProvider key={section.id} sectionId={section.id}><SectionRenderer section={section} site={site} editable={editable} selected={selectedSectionId === section.id} onSelect={() => onSectionSelect?.(section.id)} onChange={onSectionChange} portraits={portraits} sceneImage={sceneImage} /></SectionHeadingProvider>;
  const variantProps = { page, site, editable, selectedSectionId, onSectionSelect, onSectionChange, fallback };
  return <SiteMediaContext.Provider value={media}><PageHeadingProvider firstSectionId={firstHeadingId}><div ref={rootRef} className={`hp-site hp-design-${activeVariant}${editable ? " hp-site-editable" : ""}`} data-design-version={activeVariant} style={siteStyle}>
    {!editable && <a className="hp-skip-link" href="#hauptinhalt">Zum Inhalt springen</a>}
    {activeVariant === 2 ? <EditorialSite {...variantProps} /> : activeVariant === 3 ? <ImmersiveSite {...variantProps} /> : activeVariant === 4 ? <NoirSite {...variantProps} /> : activeVariant === 5 ? <NavySite {...variantProps} /> : <>
    <SiteHeader site={site} editable={editable} currentSlug={page.slug} />
    <Main data-site-main={editable ? "" : undefined} role={editable ? "region" : undefined} aria-label={editable ? `Seitenvorschau: ${page.title}` : undefined} id="hauptinhalt" tabIndex={editable ? undefined : -1}>
      {page.sections.filter((section) => section.visible || editable).map(fallback)}
      {editable && page.sections.length === 0 && <div className="hp-empty-page"><Plus size={32} /><p>Diese Seite wartet auf ihren ersten Abschnitt.</p><span>Wählen Sie einen Abschnitt aus der Bibliothek.</span></div>}
    </Main>
    <SiteFooter site={site} editable={editable} />
    </>}
    {!editable && <ConsentManager site={site} />}
    {!editable && process.env.NEXT_PUBLIC_DESIGN_REVIEW !== "false" && <DesignReviewSwitcher variant={activeVariant} onChange={changeVariant} />}
  </div></PageHeadingProvider></SiteMediaContext.Provider>;
}

function SiteHeader({ site, editable, currentSlug }: { site: SiteConfig; editable?: boolean; currentSlug: string }) {
  const [open, setOpen] = useState(false);
  const smartHeader = useSmartHeader({ open, disabled: editable });
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const contact = site.navigation.find((item) => /kontakt/.test(item.href));
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (!menuRef.current?.contains(event.target as Node) && !toggleRef.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("keydown", handleKey); window.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", handleKey); window.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <header {...smartHeader} className="hp-header">
    <div className="hp-header-inner"><ContentLink href="/" editable={editable} className="hp-brand"><span className="hp-brand-name">{site.name}</span><span className="hp-brand-subline">{site.tagline}</span></ContentLink>
      <nav className="hp-desktop-nav" aria-label="Hauptnavigation">{site.navigation.filter((item) => item !== contact).map((item) => <ContentLink key={item.href} href={item.href} editable={editable} className={currentSlug && item.href === `/${currentSlug}` ? "is-current" : ""}>{item.label}</ContentLink>)}</nav>
      <div className="hp-header-actions">{contact && <ContentLink href={contact.href} editable={editable} className="hp-header-contact">{contact.label}<ArrowUpRight size={18} /></ContentLink>}
        <button ref={toggleRef} className="hp-menu-toggle" type="button" aria-label={open ? "Menü schließen" : "Menü öffnen"} aria-expanded={open} aria-controls="hp-mobile-menu" onClick={() => setOpen(!open)}>{open ? <X size={25} /> : <Menu size={25} />}</button></div>
    </div>
    <div ref={menuRef} id="hp-mobile-menu" className={`hp-mobile-menu${open ? " is-open" : ""}`} inert={!open}>
      <nav aria-label="Mobile Hauptnavigation">{site.navigation.map((item) => <a key={item.href} href={safeHref(item.href)} aria-current={item.href === `/${currentSlug}` ? "page" : undefined} onClick={(event) => { if (editable) event.preventDefault(); setOpen(false); }}>{item.label}<ArrowUpRight size={23} /></a>)}</nav>
      <a className="hp-mobile-phone" href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} onClick={editable ? (event) => event.preventDefault() : undefined}><Phone size={18} />{site.phone}</a>
    </div>
  </header>;
}

function SiteFooter({ site, editable }: { site: SiteConfig; editable?: boolean }) {
  const footer = footerConfig(site);
  return <footer className="hp-footer">
    {(footer.brandText || footer.ctaLabel) && <div className="hp-footer-top">{footer.brandText && <ContentLink href="/" editable={editable} className="hp-footer-brand">{footer.brandText}</ContentLink>}{footer.ctaLabel && <ContentLink href={footer.ctaHref} editable={editable} className="hp-footer-contact-link">{footer.ctaLabel}<ArrowUpRight size={32} /></ContentLink>}</div>}
    <div className="hp-footer-grid" style={{ "--footer-area-count": 1 + Number(footer.showAddress) + Number(footer.showContact || footer.showHours) + Number(footer.columns.length > 0) } as CSSProperties}><div className="hp-footer-intro"><p>{site.footerText}</p><p className="hp-footer-legal-name">{site.legalName}</p></div>
      {footer.showAddress && <div>{footer.addressHeading && <h2>{footer.addressHeading}</h2>}<address>{site.address}<br />{site.postalCode} {site.city}</address></div>}
      {(footer.showContact || footer.showHours) && <div>{footer.contactHeading && <h2>{footer.contactHeading}</h2>}{footer.showContact && <><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable}>{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}>{site.email}</ContentLink></>}{footer.showHours && site.openingHours.map((entry) => <p className="hp-footer-hours" key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>}
      <FooterNavigation site={site} editable={editable} />
    </div>
    <div className="hp-footer-bottom"><span>{copyrightText(site)}</span><div><FooterLegalLinks site={site} editable={editable} />{site.consent.enabled && footer.showCookieSettings && <button type="button" onClick={() => { if (!editable) window.dispatchEvent(new Event(consentEvent)); }}>Cookie-Einstellungen</button>}</div>{footer.showBackToTop && <a href="#hauptinhalt" className="hp-back-top" aria-label="Zum Seitenanfang"><ArrowUp size={18} /></a>}</div>
  </footer>;
}

type RendererProps = { section: Section; site: SiteConfig; editable?: boolean; selected?: boolean; onSelect?: () => void; onChange?: (section: Section) => void; portraits?: ContentItem[]; sceneImage?: ImageValue };
type SectionStyle = CSSProperties & Record<`--${string}`, string | number>;

export function SectionRenderer({ section, site, editable = false, selected, onSelect, onChange, portraits, sceneImage }: RendererProps) {
  const { content: c, design: d } = section;
  const teamGridRef = useRef<HTMLDivElement>(null);
  const [teamIndex, setTeamIndex] = useState(0);
  const headingLevel = useSectionHeadingLevel(section.id);
  if (["blog-cards", "blog-editorial", "blog-list"].includes(section.type)) return <BlogFeed section={section} site={site} editable={editable} selected={selected} onSelect={onSelect} onChange={onChange} />;
  if (["navy-hero", "navy-bento", "navy-service-tabs", "navy-people", "navy-process", "navy-contact"].includes(section.type)) return <NavySection section={section} site={site} editable={editable} selected={selected} onSelect={onSelect} onChange={onChange} portraits={portraits} sceneImage={sceneImage} />;
  if (["noir-hero", "case-deck", "people-index", "image-curtain", "noir-manifesto", "noir-contact"].includes(section.type)) return <NoirSection section={section} site={site} editable={editable} selected={selected} onSelect={onSelect} onChange={onChange} portraits={portraits} />;
  if (["editorial-hero", "portrait-mosaic", "service-explorer", "editorial-statement", "contact-poster", "editorial-gallery"].includes(section.type)) return <EditorialSection section={section} site={site} editable={editable} selected={selected} onSelect={onSelect} onChange={onChange} />;
  if (["cinematic-hero", "focus-finder", "portrait-rail", "stacked-panels", "kinetic-statement", "contact-dock"].includes(section.type)) return <ImmersiveSection section={section} site={site} editable={editable} selected={selected} onSelect={onSelect} onChange={onChange} />;
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (c.items ?? []).map((item, i) => i === index ? { ...item, [key]: value } : item));
  const text = (key: "heading" | "subheading" | "text" | "quote" | "attribution" | "caption", as: "h1" | "h2" | "h3" | "p" | "div" | "span" | "blockquote" = "p", className = "") => <EditableText as={key === "heading" ? headingLevel : as} value={c[key]} editable={editable} className={className} onChange={(value) => update(key, value)} label={`${key === "heading" ? "Überschrift" : "Text"} bearbeiten`} />;
  const heading = (className = "hp-section-heading") => text("heading", section.type === "hero" ? "h1" : "h2", className);
  const itemText = (item: ContentItem, index: number, key: "title" | "text" | "label" | "meta", as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} onChange={(value) => updateItem(index, key, value)} className={className} />;
  const image = (className = "", priority = false) => <EditableImage image={c.image} editable={editable} onChange={(value) => update("image", value)} className={className} priority={priority} />;
  const itemImage = (item: ContentItem, index: number, className = "") => <EditableImage image={item.image} editable={editable} onChange={(value) => updateItem(index, "image", value)} className={className} />;
  const actions = (className = "") => c.primaryLabel || c.secondaryLabel || editable ? <div className={`hp-actions ${className}`}>
    {(c.primaryLabel || editable) && <ContentLink href={c.primaryHref} editable={editable} className="hp-button hp-button-primary"><EditableText as="span" value={c.primaryLabel} editable={editable} onChange={(value) => update("primaryLabel", value)} /><ArrowUpRight size={20} /></ContentLink>}
    {c.secondaryLabel && <ContentLink href={c.secondaryHref} editable={editable} className="hp-text-button"><EditableText as="span" value={c.secondaryLabel} editable={editable} onChange={(value) => update("secondaryLabel", value)} /><ArrowRight size={18} /></ContentLink>}
  </div> : null;
  const intro = (className = "") => <div className={`hp-section-intro ${className}`}><div>{heading()}{c.subheading && text("subheading", "p", "hp-section-subheading")}</div>{c.text && text("text", "p", "hp-section-text")}</div>;
  const items = c.items ?? [];
  const details = (item: ContentItem, index: number) => item.details?.length ? <ul className="hp-detail-list">{item.details.map((detail, detailIndex) => <li key={detailIndex}><Check size={16} /><EditableText as="span" value={detail} editable={editable} onChange={(value) => updateItem(index, "details", item.details!.map((entry, entryIndex) => entryIndex === detailIndex ? value : entry))} /></li>)}</ul> : null;
  const themeDefaults = d.theme === "dark" ? { background: "var(--hp-ink)", color: "var(--hp-paper)" } : d.theme === "accent" ? { background: "var(--hp-accent)", color: "var(--hp-ink)" } : d.theme === "soft" ? { background: "var(--hp-palette-surface, #e8ece4)", color: "var(--hp-palette-text, var(--hp-ink))" } : { background: "var(--hp-paper)", color: "var(--hp-palette-text, var(--hp-ink))" };
  const style: SectionStyle = {
    "--section-bg": d.background || themeDefaults.background, "--section-fg": d.textColor || themeDefaults.color,
    "--section-accent": d.accentColor || "var(--hp-accent)", "--section-scale": d.fontScale,
    "--section-radius": `${d.radius}px`, "--section-columns": d.columns,
    "--section-heading-font": d.headingFont === "sans" ? "var(--font-body)" : "var(--hp-display)",
    borderWidth: d.border ? `${d.border}px` : undefined,
  };
  let body: ReactNode;
  switch (section.type) {
    case "hero": body = d.heroLayout && d.heroLayout !== "auto" ? <HeroComposition world={1} layout={d.heroLayout} section={section} site={site} editable={editable} onChange={onChange} portraits={portraits} /> : d.theme === "dark" ? <div className="hp-hero-immersed">{image("hp-hero-immersed-image", true)}<div className="hp-hero-overlay"><span className="hp-hero-location"><MapPin size={15} />{site.city}</span><div>{heading("hp-hero-heading")}{c.subheading && text("subheading", "p", "hp-hero-subheading")}</div><div className="hp-hero-overlay-bottom">{c.text && text("text", "p", "hp-hero-text")}{actions()}</div></div></div>
      : d.imageSide === "left" ? <div className="hp-hero-portrait-layout"><div className="hp-hero-portrait-media">{image("hp-hero-portrait-image", true)}{c.caption && text("caption", "p", "hp-hero-portrait-caption")}</div><div className="hp-hero-portrait-copy">{heading("hp-hero-heading")}{c.subheading && text("subheading", "p", "hp-hero-subheading")}<div className="hp-hero-portrait-note">{text("text", "p", "hp-hero-text")}{actions()}</div></div></div>
      : <PanoramaHero section={section} site={site} editable={editable} onChange={onChange} portraits={portraits} />; break;
    case "statement": body = <div className="hp-statement-layout">{heading("hp-statement-heading")}<div className="hp-statement-aside">{text("text", "p", "hp-statement-text")}{actions()}</div></div>; break;
    case "services": body = <PanoramaServices section={section} site={site} editable={editable} onChange={onChange} sceneImage={sceneImage} />; break;
    case "team": body = <>{intro()}{items.length === 3 && <div className="hp-team-controls" aria-label="Team durchblättern"><span aria-live="polite">{teamIndex + 1} / {items.length}</span><button type="button" aria-label="Vorherige Person" disabled={teamIndex === 0} onClick={() => teamGridRef.current?.scrollBy({ left: -(teamGridRef.current.clientWidth * .83 + 18), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}><ArrowLeft size={18} /></button><button type="button" aria-label="Nächste Person" disabled={teamIndex === items.length - 1} onClick={() => teamGridRef.current?.scrollBy({ left: teamGridRef.current.clientWidth * .83 + 18, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}><ArrowRight size={18} /></button></div>}<div className="hp-team-grid" data-count={items.length} ref={teamGridRef} onScroll={(event) => {
      const grid = event.currentTarget;
      const card = grid.firstElementChild;
      if (card) setTeamIndex(Math.min(items.length - 1, Math.max(0, Math.round(grid.scrollLeft / (card.clientWidth + 18)))));
    }}>{items.map((item, index) => <article className="hp-person" key={item.id} data-item-id={item.id} data-hp-reveal>
      {itemImage(item, index, "hp-person-photo")}<div className="hp-person-name">{item.href ? <ContentLink href={item.href} editable={editable}>{itemText(item, index, "title", "h3")}<ArrowUpRight size={22} /></ContentLink> : itemText(item, index, "title", "h3")}</div>
      {itemText(item, index, "meta", "p", "hp-person-role")}{itemText(item, index, "text", "p", "hp-person-text")}
      {item.tags?.length ? <div className="hp-person-tags">{item.tags.map((tag, i) => <EditableText as="span" value={tag} editable={editable} key={i} onChange={(value) => updateItem(index, "tags", item.tags!.map((entry, n) => n === i ? value : entry))} />)}</div> : null}
      {(item.email || item.phone) && <div className="hp-person-contact">{item.email && <ContentLink href={`mailto:${item.email}`} editable={editable} label={teamEmailLabel(item)}><Mail size={17} /><span>{item.label === "Sekretariat" ? "Sekretariat: " : ""}{item.email}</span></ContentLink>}{item.phone && <ContentLink href={`tel:${item.phone.replace(/[^+\d]/g, "")}`} editable={editable}><Phone size={16} />{item.phone}</ContentLink>}</div>}
    </article>)}</div>{actions("hp-section-bottom-actions")}</>; break;
    case "split": body = <div className={`hp-split-layout hp-image-${d.imageSide}`}>{image("hp-split-image")}<div className="hp-split-copy">{heading()}{c.subheading && text("subheading", "p", "hp-section-subheading")}{text("text", "p", "hp-split-text")}{items.length > 0 && <ul className="hp-split-facts">{items.map((item, index) => <li key={item.id} data-item-id={item.id}><ContentIcon name={item.icon} editable={editable} itemId={item.id} sectionId={section.id} /><div>{itemText(item, index, "title", "h3")}{itemText(item, index, "text")}</div></li>)}</ul>}{actions()}</div></div>; break;
    case "contact": body = <>{intro("hp-contact-intro")}<div className="hp-contact-layout"><div className="hp-contact-info">
      <ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} className="hp-contact-phone"><Phone size={23} /><span>{site.phone}</span><ArrowUpRight size={22} /></ContentLink>
      <ContentLink href={`mailto:${site.email}`} editable={editable} className="hp-contact-email"><Mail size={21} /><span>{site.email}</span><ArrowUpRight size={20} /></ContentLink>
      <div className="hp-contact-address"><MapPin size={21} /><div><strong>{site.name}</strong><address>{site.address}<br />{site.postalCode} {site.city}</address><ContentLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.postalCode} ${site.city}`)}`} editable={editable} className="hp-inline-link" target="_blank">Anfahrt planen<ArrowUpRight size={15} /></ContentLink></div></div>
      <div className="hp-contact-hours"><Clock3 size={21} /><div><h3>Unsere Bürozeiten</h3>{site.openingHours.map((entry) => <p key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div></div>
      {site.fax && <p className="hp-contact-fax">Fax {site.fax}</p>}
    </div><ContactForm editable={editable} /></div></>; break;
    case "faq": case "accordion": body = <div className="hp-faq-layout"><div>{heading()}{text("text", "p", "hp-section-text")}{actions()}</div><div className="hp-faq-list">{items.map((item, index) => <ContentDisclosure editable={editable} key={item.id} data-item-id={item.id} className="hp-faq-item" summary={<>{itemText(item, index, "title", "h3")}<span className="hp-disclosure-icon"><Plus size={21} /><Minus size={21} /></span></>}><div className="hp-faq-answer">{itemText(item, index, "text")}{details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="hp-inline-link">{item.label || "Mehr erfahren"}<ArrowUpRight size={15} /></ContentLink>}</div></ContentDisclosure>)}</div></div>; break;
    case "steps": body = <>{intro()}<ol className="hp-steps">{items.map((item, index) => <li key={item.id} data-item-id={item.id}><span className="hp-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div>{itemText(item, index, "title", "h3")}{itemText(item, index, "text")}{details(item, index)}</div></li>)}</ol>{actions("hp-section-bottom-actions")}</>; break;
    case "stats": body = <>{intro()}<dl className="hp-stats">{items.map((item, index) => <div key={item.id} data-item-id={item.id}><dt>{itemText(item, index, "text", "span")}</dt><dd>{itemText(item, index, "title", "span")}</dd>{item.meta && itemText(item, index, "meta", "p")}</div>)}</dl></>; break;
    case "gallery": body = <>{intro()}<div className="hp-gallery">{(c.images ?? []).map((entry, index) => <EditableImage key={index} image={entry} editable={editable} className="hp-gallery-image" caption onChange={(value) => update("images", c.images!.map((current, i) => index === i ? value : current))} />)}</div>{actions()}</>; break;
    case "richtext": body = <div className="hp-richtext"><header className="hp-richtext-header">{heading()}{c.subheading && text("subheading", "p", "hp-section-subheading")}{c.image && image("hp-richtext-image")}{actions()}</header><div className="hp-richtext-reading">{text("text", "div", "hp-richtext-body")}{items.map((item, index) => <article key={item.id} data-item-id={item.id} className="hp-richtext-block">{itemText(item, index, "title", "h3")}{itemText(item, index, "text", "p")}{details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="hp-inline-link">{item.label || item.href}<ArrowUpRight size={16} /></ContentLink>}</article>)}</div></div>; break;
    case "cta": body = <div className="hp-cta-layout"><div>{heading("hp-cta-heading")}{text("text", "p", "hp-cta-text")}</div>{actions("hp-cta-actions")}</div>; break;
    case "cards": body = <>{intro()}<div className="hp-editorial-cards">{items.map((item, index) => <article key={item.id} data-item-id={item.id} className="hp-editorial-card">{item.image ? itemImage(item, index) : <span className="hp-editorial-card-icon"><ContentIcon name={item.icon} size={29} editable={editable} itemId={item.id} sectionId={section.id} /></span>}{itemText(item, index, "meta", "span", "hp-card-meta")}{itemText(item, index, "title", "h3")}{itemText(item, index, "text")}{details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="hp-inline-link">{item.label || "Weiterlesen"}<ArrowUpRight size={18} /></ContentLink>}</article>)}</div>{actions()}</>; break;
    case "list": body = <>{intro()}<ul className="hp-content-list">{items.map((item, index) => <li key={item.id} data-item-id={item.id}><span className="hp-list-check"><ContentIcon name={item.icon || "check"} size={21} editable={editable} itemId={item.id} sectionId={section.id} /></span><div>{itemText(item, index, "title", "h3")}{itemText(item, index, "text")}{details(item, index)}</div>{item.href && <ContentLink href={item.href} editable={editable} label={item.label || `${item.title} öffnen`} className="hp-list-arrow"><ArrowUpRight size={24} /></ContentLink>}</li>)}</ul>{actions()}</>; break;
    case "downloads": body = <>{intro()}<div className="hp-downloads">{items.map((item, index) => <article key={item.id} data-item-id={item.id}><span className="hp-download-file"><FileText size={28} /></span><div>{itemText(item, index, "title", "h3")}{itemText(item, index, "text")}{itemText(item, index, "meta", "span", "hp-download-meta")}</div><ContentLink href={item.href} editable={editable} className="hp-download-button" label={`${item.label || "Herunterladen"} – ${item.title}`} download><ArrowDownToLine size={22} /><span>{item.label || "Herunterladen"}</span></ContentLink></article>)}</div></>; break;
    case "quote": body = <figure className="hp-quote">{c.image && image("hp-quote-portrait")}<div>{c.heading && heading("hp-quote-heading")}{text("quote", "blockquote", "hp-quote-text")}<figcaption>{text("attribution", "span", "hp-quote-attribution")}{c.text && text("text", "span", "hp-quote-caption")}</figcaption></div></figure>; break;
    case "logos": body = <>{intro()}<div className="hp-logos">{(c.images ?? []).map((entry, index) => <EditableImage key={`image-${index}`} image={entry} editable={editable} className="hp-logo-image" onChange={(value) => update("images", c.images!.map((current, i) => index === i ? value : current))} />)}{items.map((item, index) => <div key={item.id} data-item-id={item.id}>{item.image ? itemImage(item, index, "hp-logo-image") : itemText(item, index, "title", "h3")}{item.image && itemText(item, index, "title", "p")}{itemText(item, index, "text", "p")}{item.href && <ContentLink href={item.href} editable={editable} label={`${item.label || "Zur Website"} – ${item.title}`} className="hp-inline-link">{item.label || "Zur Website"}<ArrowUpRight size={15} /></ContentLink>}</div>)}</div></>; break;
    case "video": body = <>{intro()}<ExternalMedia kind="video" url={c.videoUrl} title={c.heading} editable={editable} />{text("caption", "p", "hp-media-caption")}</>; break;
    case "map": body = <div className="hp-map-layout"><div>{heading()}{text("text", "p", "hp-section-text")}<address className="hp-map-address">{site.address}<br />{site.postalCode} {site.city}</address>{actions()}</div><ExternalMedia kind="map" address={c.mapAddress || `${site.legalName}, ${site.address}, ${site.postalCode} ${site.city}`} url={c.videoUrl} title={c.heading} editable={editable} /></div>; break;
    case "divider": body = <div className="hp-divider">{c.heading && heading("hp-divider-heading")}<hr />{text("text", "p")}</div>; break;
    case "timeline": body = <>{intro()}<ol className="hp-timeline">{items.map((item, index) => <li key={item.id} data-item-id={item.id}><div className="hp-timeline-date">{itemText(item, index, item.meta ? "meta" : "title", "span")}</div><span className="hp-timeline-dot" aria-hidden="true" /><div className="hp-timeline-content">{item.meta && itemText(item, index, "title", "h3")}{itemText(item, index, "text")}{(item.image || editable) && itemImage(item, index, "hp-timeline-image")}{details(item, index)}</div></li>)}</ol>{actions("hp-section-bottom-actions")}</>; break;
    case "notice": body = <aside className="hp-notice"><Info size={27} /><div>{heading("hp-notice-heading")}{text("text", "p", "hp-notice-text")}{actions()}</div></aside>; break;
    case "comparison": body = <>{intro()}<div className="hp-comparison">{items.map((item, index) => <article key={item.id} data-item-id={item.id}>{itemText(item, index, "title", "h3")}{itemText(item, index, "meta", "p", "hp-comparison-meta")}{itemText(item, index, "text")}{details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="hp-button hp-button-outline">{item.label || "Mehr erfahren"}<ArrowUpRight size={17} /></ContentLink>}</article>)}</div></>; break;
    case "columns": body = <>{intro()}<div className="hp-content-columns">{items.map((item, index) => <article key={item.id} data-item-id={item.id}>{item.image && itemImage(item, index)}{itemText(item, index, "title", "h3")}{itemText(item, index, "text")}{details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="hp-inline-link">{item.label || "Mehr erfahren"}<ArrowUpRight size={16} /></ContentLink>}</article>)}</div></>; break;
    case "opening-hours": body = <div className="hp-hours-layout"><div>{heading()}{text("text", "p", "hp-section-text")}{actions()}</div><div className="hp-hours-table">{items.length ? items.map((item, index) => <div key={item.id} data-item-id={item.id}>{itemText(item, index, "title", "h3")}{itemText(item, index, "text")}</div>) : site.openingHours.map((entry) => <div key={entry.day}><h3>{entry.day}</h3><p>{entry.hours}</p></div>)}</div></div>; break;
    default: body = <>{intro()}{actions()}</>;
  }
  return <section id={section.anchor || section.id} data-section-id={section.id} data-section-type={section.type} data-theme={d.theme}
    className={`hp-section hp-section-${section.type} hp-width-${d.width} hp-spacing-${d.spacing} hp-align-${d.align} hp-animation-${d.animation}${editable ? " hp-editable-section" : ""}${selected ? " hp-section-selected" : ""}${!section.visible ? " hp-section-hidden" : ""}`}
    style={style} onClick={editable ? (event) => {
      if ((event.target as HTMLElement).closest("[contenteditable]")) event.preventDefault();
      onSelect?.();
    } : undefined}>
    {editable && <button className="hp-section-select" type="button" onClick={(event) => { event.stopPropagation(); onSelect?.(); }} aria-label={`${section.name} auswählen`}>{section.name}{!section.visible && <span> · ausgeblendet</span>}</button>}
    <div className="hp-section-inner">{body}</div>
  </section>;
}

