"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, Mail, MapPin, Menu, Minus, Phone, Plus, Search, X } from "lucide-react";
import type { ContentItem, ImageValue, SectionContent } from "@/lib/types";
import { ContentDisclosure, EditableChoice, ContentLink, EditableImage, EditableText, teamEmailLabel } from "../editable";
import { copyrightText, footerConfig } from "@/lib/site-config";
import { FooterLegalLinks, FooterNavigation } from "../footer-navigation";
import { ContentIcon } from "../content-icon";
import { ContactForm } from "../contact-form";
import { consentEvent } from "../consent";
import type { VariantSectionProps, VariantSiteProps } from "./types";
import { SectionHeadingProvider, useSectionHeadingLevel } from "../heading-level";
import { EditorialInnerSection, editorialInnerTypes } from "./editorial-inner";
import { useSmartHeader } from "../smart-header";
import { textWithBreaks } from "../text-wrap";
import { HeroComposition } from "./hero-compositions";

const editorialTypes = new Set(["hero", "editorial-hero", "statement", "editorial-statement", "services", "service-explorer", "team", "portrait-mosaic", "cta", "contact-poster", "gallery", "editorial-gallery", "split", "steps", "faq", "accordion", "contact"]);

export function EditorialSite({ page, site, editable, selectedSectionId, onSectionSelect, onSectionChange, fallback }: VariantSiteProps) {
  const Main = editable ? "div" : "main";
  const [menuOpen, setMenuOpen] = useState(false);
  const smartHeader = useSmartHeader({ open: menuOpen, disabled: editable });
  const menuRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const footer = footerConfig(site);
  const portraits = page.sections.filter(section => section.visible || editable).flatMap(section => ["team", "portrait-mosaic", "portrait-rail", "people-index", "navy-people"].includes(section.type) ? section.content.items ?? [] : []);
  const topics = page.sections.find((section) => ["services", "service-explorer", "focus-finder", "case-deck", "navy-service-tabs"].includes(section.type))?.content.items ?? [];
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); menuRef.current?.focus(); } };
    if (menuOpen) window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  return <div className="ed-website">
    <header {...smartHeader} className="ed-header"><ContentLink href="/" editable={editable} className="ed-wordmark"><span>{site.name}</span><small>{site.tagline}</small></ContentLink>
      <div className="ed-header-right"><span className="ed-header-city">{site.city}</span><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} className="ed-header-phone">{site.phone}<ArrowUpRight size={15} /></ContentLink>
        <button type="button" ref={menuRef} className="ed-menu-toggle" aria-controls={menuId} aria-expanded={menuOpen} aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={25} /> : <Menu size={25} />}</button></div>
      <nav className="ed-navigation" aria-label="Hauptnavigation">{site.navigation.map((item) => <ContentLink key={item.href} editable={editable} href={item.href} className={item.href === `/${page.slug}` ? "is-current" : ""}>{item.label}<ArrowUpRight size={14} /></ContentLink>)}</nav>
      <nav id={menuId} className={`ed-mobile-navigation${menuOpen ? " is-open" : ""}`} aria-label="Mobile Hauptnavigation" inert={!menuOpen}>{site.navigation.map((item) => <ContentLink key={item.href} editable={editable} href={item.href}>{item.label}<ArrowUpRight size={23} /></ContentLink>)}</nav>
    </header>
    <Main data-site-main={editable ? "" : undefined} role={editable ? "region" : undefined} aria-label={editable ? `Seitenvorschau: ${page.title}` : undefined} id="hauptinhalt" tabIndex={editable ? undefined : -1}>{page.sections.filter((section) => section.visible || editable).map((section) => <SectionHeadingProvider key={section.id} sectionId={section.id}>{editorialTypes.has(section.type) || editorialInnerTypes.has(section.type)
      ? <EditorialSection section={section} site={site} editable={editable} selected={selectedSectionId === section.id} onSelect={() => onSectionSelect?.(section.id)} onChange={onSectionChange} portraits={portraits} topics={topics} />
      : <div className="ed-fallback">{fallback(section)}</div>}</SectionHeadingProvider>)}</Main>
    <footer className="ed-footer"><div className="ed-footer-invitation">{footer.ctaLabel && <ContentLink href={footer.ctaHref} editable={editable}>{footer.ctaLabel}<ArrowUpRight size={48} /></ContentLink>}<p>{site.footerText}</p></div>
      <div className="ed-footer-grid" style={{ "--footer-area-count": Math.max(1, Number(footer.showAddress) + Number(footer.showContact || footer.showHours) + Number(footer.columns.length > 0)) } as CSSProperties}>{footer.showAddress && <div>{footer.addressHeading && <h2>{footer.addressHeading}</h2>}<address>{site.address}<br />{site.postalCode} {site.city}</address><p className="ed-legal-name">{site.legalName}</p></div>}
        {(footer.showContact || footer.showHours) && <div>{footer.contactHeading && <h2>{footer.contactHeading}</h2>}{footer.showContact && <><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} className="ed-footer-phone">{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}>{site.email}</ContentLink></>}{footer.showHours && site.openingHours.map((entry) => <p className="ed-footer-hours" key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>}
        <FooterNavigation site={site} editable={editable} arrows /></div>
      {footer.brandText && <ContentLink href="/" editable={editable} className="ed-footer-masthead">{footer.brandText}</ContentLink>}
      <div className="ed-footer-bottom"><span>{copyrightText(site)}</span><FooterLegalLinks site={site} editable={editable} />{site.consent.enabled && footer.showCookieSettings && <button type="button" onClick={() => !editable && window.dispatchEvent(new Event(consentEvent))}>Cookie-Einstellungen</button>}{footer.showBackToTop && <a href="#hauptinhalt" className="ed-back-top" aria-label="Zum Seitenanfang"><ArrowUp size={18} /></a>}</div>
    </footer>
  </div>;
}

export function EditorialSection(props: VariantSectionProps) {
  const { section, site, editable = false, selected, onSelect, onChange, portraits = [], topics = [] } = props;
  const { content: c, design: d } = section;
  const Heading = useSectionHeadingLevel(section.id);
  const [activeService, setActiveService] = useState(0);
  const [query, setQuery] = useState("");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const id = useId();
  const serviceListRef = useRef<HTMLDivElement>(null);
  const servicePanelRef = useRef<HTMLDivElement>(null);
  const coverBounds = useRef<DOMRect | null>(null);
  const chooseService = (index: number, scroll = false) => {
    setActiveService(index);
    const siteWidth = servicePanelRef.current?.closest<HTMLElement>(".hp-site")?.clientWidth ?? window.innerWidth;
    if (!scroll || editable || siteWidth > 750) return;
    requestAnimationFrame(() => servicePanelRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  };
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (c.items ?? []).map((item, i) => i === index ? { ...item, [key]: value } : item));
  const text = (key: "heading" | "subheading" | "text" | "quote" | "attribution" | "caption", as: "h1" | "h2" | "h3" | "p" | "span" = "p", className = "") => <EditableText as={key === "heading" ? Heading : as} value={c[key]} editable={editable} className={className} onChange={(value) => update(key, value)} />;
  const heading = (className = "ed-section-heading") => text("heading", /hero/.test(section.type) ? "h1" : "h2", className);
  const itemText = (item: ContentItem, index: number, key: "title" | "text" | "meta" | "label", as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} className={className} onChange={(value) => updateItem(index, key, value)} />;
  const image = (value = c.image, className = "", priority = false, change = (next: ImageValue) => update("image", next)) => <EditableImage image={value} editable={editable} onChange={change} className={className} priority={priority} />;
  const actions = (className = "") => <div className={`ed-actions ${className}`}>{(c.primaryLabel || editable) && <ContentLink href={c.primaryHref} editable={editable} className="ed-button"><EditableText as="span" value={c.primaryLabel} editable={editable} onChange={(value) => update("primaryLabel", value)} /><ArrowUpRight size={22} /></ContentLink>}{c.secondaryLabel && <ContentLink href={c.secondaryHref} editable={editable} className="ed-text-link"><EditableText as="span" value={c.secondaryLabel} editable={editable} onChange={(value) => update("secondaryLabel", value)} /><ArrowUpRight size={19} /></ContentLink>}</div>;
  const items = c.items ?? [];
  const intro = () => <div className="ed-section-intro">{heading()}{text("text", "p", "ed-section-description")}</div>;
  const details = (item: ContentItem, index: number) => item.details?.length ? <ul className="ed-details">{item.details.map((detail, detailIndex) => <li key={detailIndex}><Check size={15} /><EditableText as="span" value={detail} editable={editable} onChange={(value) => updateItem(index, "details", item.details!.map((entry, i) => i === detailIndex ? value : entry))} /></li>)}</ul> : null;
  const matchedItems = items.map((item, index) => ({ item, index })).filter(({ item }) => `${item.title} ${item.text} ${(item.tags ?? []).join(" ")}`.toLocaleLowerCase("de").includes(query.toLocaleLowerCase("de")));
  const selectedService = matchedItems.find(({ index }) => index === activeService) ?? matchedItems[0];
  const galleryImages = c.images?.length ? c.images : c.image ? [c.image] : [];
  const galleryCurrent = Math.min(galleryIndex, Math.max(galleryImages.length - 1, 0));
  const isStatement = ["statement", "editorial-statement"].includes(section.type);
  const isContact = section.type === "contact";
  const defaults = (isStatement || isContact) && d.theme === "light" ? { bg: "var(--hp-palette-primary, #2545ed)", fg: "var(--hp-palette-background, #fcfcfa)" } : section.type === "steps" && d.theme === "light" ? { bg: "var(--hp-palette-accent, #ffe15b)", fg: "var(--hp-palette-primary, #2545ed)" } : d.theme === "dark" ? { bg: "var(--hp-palette-primary, #2545ed)", fg: "var(--hp-palette-background, #fcfcfa)" } : d.theme === "accent" ? { bg: "var(--hp-palette-accent, #ffe15b)", fg: "var(--hp-palette-primary, #2545ed)" } : d.theme === "soft" ? { bg: "var(--hp-palette-surface, #eef0fc)", fg: "var(--hp-palette-primary, #2545ed)" } : { bg: "var(--hp-palette-background, #fcfcfa)", fg: "var(--hp-palette-primary, #2545ed)" };
  const style = { "--ed-section-bg": d.background || (d.theme === "accent" && d.accentColor ? d.accentColor : defaults.bg), "--ed-section-fg": d.textColor || (defaults.fg === "var(--hp-palette-primary, #2545ed)" ? "var(--hp-palette-text, #2545ed)" : defaults.fg), "--ed-yellow": d.accentColor || "var(--hp-palette-accent, #ffe15b)", "--ed-scale": d.fontScale, "--ed-radius": `${d.radius}px`, "--ed-heading": d.headingFont === "sans" ? "var(--font-body)" : "var(--ed-serif)", borderWidth: d.border ? `${d.border}px` : undefined } as CSSProperties;
  if (editorialInnerTypes.has(section.type)) return <EditorialInnerSection {...props} />;
  let body: ReactNode;
  switch (section.type) {
    case "hero": case "editorial-hero": {
      if (d.heroLayout && d.heroLayout !== "auto") { body = <HeroComposition {...props} world={2} layout={d.heroLayout} />; break; }
      const people = (c.items === undefined ? portraits : items).filter((person) => person.image).slice(0, 2);
      const lines = c.heading.split("\n");
      const firstLine = lines[0]; const secondLine = lines.slice(1).join("\n");
      body = <div className={`ed-cover${secondLine ? "" : " ed-cover--single"}${people.length ? " ed-cover--people" : ""}`}><div className="ed-cover-main">
        <Heading className="ed-cover-heading"><EditableText as="span" value={firstLine} editable={editable} className="ed-cover-line ed-cover-line-first" onChange={(next) => update("heading", next + (secondLine ? `\n${secondLine}` : ""))} />{secondLine && <><span className="ed-cover-type-break" aria-hidden="true" />{" "}<EditableText as="span" value={secondLine} editable={editable} className="ed-cover-line ed-cover-line-last" onChange={(next) => update("heading", `${firstLine}\n${next}`)} /></>}</Heading>
        <div className="ed-cover-art" id={`${section.id}-fotografie`} onPointerEnter={(event) => { coverBounds.current = event.currentTarget.getBoundingClientRect(); }} onPointerMove={(event) => {
          if (editable || d.animation === "none" || !coverBounds.current || window.matchMedia("(prefers-reduced-motion: reduce), (pointer: coarse)").matches) return;
          const bounds = coverBounds.current;
          event.currentTarget.style.setProperty("--ed-px", `${((event.clientX - bounds.left) / bounds.width - .5) * 16}px`);
          event.currentTarget.style.setProperty("--ed-py", `${((event.clientY - bounds.top) / bounds.height - .5) * 12}px`);
        }} onPointerLeave={(event) => { event.currentTarget.style.setProperty("--ed-px", "0px"); event.currentTarget.style.setProperty("--ed-py", "0px"); }}>{image(c.image, "ed-cover-main-photo", true)}{people.map((person, index) => <div className={`ed-cover-person ed-cover-person-${index + 1}`} key={person.id} data-item-id={person.id}>{image(person.image, "", true, (next) => {
          const ownIndex = items.findIndex((entry) => entry.id === person.id);
          if (ownIndex >= 0) updateItem(ownIndex, "image", next);
          else update("items", people.map((entry, i) => i === index ? { ...entry, image: next } : entry));
        })}{person.href && <ContentLink href={person.href} editable={editable} label={person.title} className="ed-portrait-link"><EditableText as="span" value={person.title} editable={editable} onChange={(title) => { const ownIndex = items.findIndex((entry) => entry.id === person.id); if (ownIndex >= 0) updateItem(ownIndex, "title", title); else update("items", people.map((entry, i) => i === index ? { ...entry, title } : entry)); }} /><ArrowUpRight size={18} /></ContentLink>}</div>)}</div>
        <div className="ed-cover-mobile-action">{c.primaryLabel && <ContentLink href={c.primaryHref} editable={editable}>{c.primaryLabel}<ArrowUpRight size={21} /></ContentLink>}</div>{c.caption && text("caption", "p", "ed-cover-caption")}
        </div><aside className="ed-cover-sidebar">{c.subheading && text("subheading", "p", "ed-cover-subheading")}{text("text", "p", "ed-cover-description")}{topics.length > 0 && <nav className="ed-cover-topic-index" aria-label="Unsere Rechtsgebiete">{topics.slice(0, 6).map((topic) => <ContentLink href={topic.href || "/rechtsgebiete"} editable={editable} key={topic.id}>{editable ? topic.title : textWithBreaks(topic.title)}<ArrowUpRight size={18} /></ContentLink>)}</nav>}<div className="ed-cover-sidebar-actions">{actions()}<ContentLink href={`mailto:${site.email}`} editable={editable} className="ed-cover-email">{site.email}<ArrowUpRight size={15} /></ContentLink></div></aside>
      </div>; break;
    }
    case "statement": case "editorial-statement": body = <div className="ed-statement">{heading("ed-statement-heading")}<div className="ed-statement-tail">{text("text", "p")}{actions()}</div></div>; break;
    case "services": case "service-explorer": body = <>{intro()}<div className="ed-explorer"><div className="ed-explorer-directory"><label className="ed-service-search" htmlFor={`${id}-search`}><Search size={18} /><input id={`${id}-search`} value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Rechtsgebiet suchen" aria-label="Rechtsgebiete durchsuchen" /></label>
      <div className="ed-service-options" ref={serviceListRef}>{matchedItems.map(({ item, index }, position) => <EditableChoice editable={editable} type="button" key={item.id} data-item-id={item.id} className={selectedService?.index === index ? "is-active" : ""} aria-expanded={selectedService?.index === index} aria-controls={`${id}-service-panel`} onChoose={() => chooseService(index, true)} onKeyDown={(event) => {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
        event.preventDefault(); const next = (position + (event.key === "ArrowDown" ? 1 : -1) + matchedItems.length) % matchedItems.length;
        setActiveService(matchedItems[next].index); serviceListRef.current?.querySelectorAll("button")[next]?.focus();
      }}>{itemText(item, index, "title", "span")}<ArrowUpRight size={21} /></EditableChoice>)}</div>{matchedItems.length === 0 && <p className="ed-empty-result" role="status">Zu Ihrer Suche wurde kein Rechtsgebiet gefunden. Bitte versuchen Sie einen anderen Begriff oder sprechen Sie uns an.</p>}
      </div><div id={`${id}-service-panel`} ref={servicePanelRef} className="ed-service-panel" data-item-id={selectedService?.item.id} aria-live={editable ? "off" : "polite"}>{selectedService && <><span className="ed-active-symbol"><ContentIcon name={selectedService.item.icon} size={34} editable={editable} itemId={selectedService.item.id} sectionId={section.id} /></span>{selectedService.item.image && image(selectedService.item.image, "ed-service-photo", false, (value) => updateItem(selectedService.index, "image", value))}{itemText(selectedService.item, selectedService.index, "title", "h3")}{itemText(selectedService.item, selectedService.index, "text", "p")}{details(selectedService.item, selectedService.index)}{selectedService.item.href && <ContentLink href={selectedService.item.href} editable={editable} className="ed-button">{selectedService.item.label || "Mehr erfahren"}<ArrowUpRight size={21} /></ContentLink>}</>}</div></div>{actions()}</>; break;
    case "team": case "portrait-mosaic": body = <>{intro()}<div className="ed-team-mosaic" data-count={items.length} data-tail={items.length > 2 ? (items.length - 2) % 3 : 0}>{items.map((item, index) => <article className="ed-person" key={item.id} data-item-id={item.id}>{image(item.image, "ed-person-photo", false, (next) => updateItem(index, "image", next))}<div className="ed-person-name">{item.href ? <ContentLink href={item.href} editable={editable}>{itemText(item, index, "title", "h3")}<ArrowUpRight size={25} /></ContentLink> : itemText(item, index, "title", "h3")}</div>{itemText(item, index, "meta", "p", "ed-person-role")}{itemText(item, index, "text", "p", "ed-person-text")}{item.tags?.length ? <div className="ed-person-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div> : null}{(item.email || item.phone) && <div className="ed-person-contact">{item.email && <ContentLink href={`mailto:${item.email}`} editable={editable} label={teamEmailLabel(item)}><Mail size={14} /><span>{item.label === "Sekretariat" ? "Sekretariat: " : ""}{item.email}</span></ContentLink>}{item.phone && <ContentLink href={`tel:${item.phone.replace(/[^+\d]/g, "")}`} editable={editable}><Phone size={14} />{item.phone}</ContentLink>}</div>}</article>)}</div>{actions()}</>; break;
    case "cta": case "contact-poster": body = <div className="ed-contact-poster">{heading("ed-poster-heading")}<div className="ed-poster-bottom">{text("text", "p")}{actions()}</div></div>; break;
    case "gallery": case "editorial-gallery": body = <>{intro()}<div className="ed-gallery-frame" onKeyDown={(event) => { if (event.key === "ArrowRight") setGalleryIndex((galleryCurrent + 1) % galleryImages.length); if (event.key === "ArrowLeft") setGalleryIndex((galleryCurrent + galleryImages.length - 1) % galleryImages.length); }}>
      {(galleryImages[galleryCurrent] || editable) && image(galleryImages[galleryCurrent], "ed-gallery-photo", false, (next) => c.images?.length ? update("images", c.images.map((entry, index) => index === galleryCurrent ? next : entry)) : update("images", [next]))}
      <div className="ed-gallery-caption"><p>{galleryImages[galleryCurrent]?.caption || galleryImages[galleryCurrent]?.alt}</p><div className="ed-gallery-controls"><button type="button" aria-label="Vorheriges Bild" disabled={galleryImages.length < 2} onClick={() => setGalleryIndex((galleryCurrent + galleryImages.length - 1) % galleryImages.length)}><ArrowLeft size={22} /></button><span aria-live="polite">{galleryImages.length ? galleryCurrent + 1 : 0} / {galleryImages.length}</span><button type="button" aria-label="Nächstes Bild" disabled={galleryImages.length < 2} onClick={() => setGalleryIndex((galleryCurrent + 1) % galleryImages.length)}><ArrowRight size={22} /></button></div></div></div>{actions()}</>; break;
    case "split": body = <div className={`ed-split ed-split-${d.imageSide}`}><div className="ed-split-photo-wrap">{image(c.image, "ed-split-photo")}<span className="ed-image-corner" aria-hidden="true"><ArrowUpRight size={38} /></span></div><div className="ed-split-copy">{heading()}{text("subheading", "p", "ed-section-subheading")}{text("text", "p", "ed-section-description")}{items.map((item, index) => <div key={item.id} data-item-id={item.id} className="ed-split-point">{itemText(item, index, "title", "h3")}{itemText(item, index, "text", "p")}</div>)}{actions()}</div></div>; break;
    case "steps": body = <>{intro()}<ol className="ed-steps">{items.map((item, index) => <li key={item.id} data-item-id={item.id}><span className="ed-step-index">{String(index + 1).padStart(2, "0")}</span><div>{itemText(item, index, "title", "h3")}{itemText(item, index, "text", "p")}{details(item, index)}</div><ArrowDown size={26} aria-hidden="true" /></li>)}</ol>{actions()}</>; break;
    case "faq": case "accordion": body = <div className="ed-faq"><div>{heading()}{text("text", "p", "ed-section-description")}{actions()}</div><div className="ed-accordion">{items.map((item, index) => <ContentDisclosure editable={editable} key={item.id} data-item-id={item.id} summary={<>{itemText(item, index, "title", "h3")}<span><Plus size={24} /><Minus size={24} /></span></>}><div>{itemText(item, index, "text", "p")}{details(item, index)}{item.href && <ContentLink href={item.href} editable={editable} className="ed-text-link">{item.label || "Mehr erfahren"}<ArrowUpRight size={17} /></ContentLink>}</div></ContentDisclosure>)}</div></div>; break;
    case "contact": body = <>{intro()}<div className="ed-contact-layout"><div className="ed-contact-details"><ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} className="ed-contact-phone">{site.phone}<ArrowUpRight size={29} /></ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable} className="ed-contact-mail">{site.email}<ArrowUpRight size={21} /></ContentLink><div className="ed-contact-address"><MapPin size={20} /><address><strong>{site.name}</strong><br />{site.address}<br />{site.postalCode} {site.city}</address></div><div className="ed-contact-hours">{site.openingHours.map((entry) => <p key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>{site.fax && <p className="ed-contact-fax">Fax {site.fax}</p>}</div><ContactForm editable={editable} /></div></>; break;
    default: body = <>{intro()}{actions()}</>;
  }
  return <section id={section.anchor || section.id} data-section-id={section.id} data-section-type={section.type} data-theme={d.theme} style={style}
    className={`ed-section ed-section-${section.type} ed-spacing-${d.spacing} ed-width-${d.width} ed-align-${d.align} ed-animation-${d.animation}${editable ? " hp-editable-section" : ""}${selected ? " hp-section-selected" : ""}${!section.visible ? " hp-section-hidden" : ""}`}
    onClick={editable ? (event) => { if ((event.target as HTMLElement).closest("[contenteditable]")) event.preventDefault(); onSelect?.(); } : undefined}>
    {editable && <button type="button" className="hp-section-select" onClick={(event) => { event.stopPropagation(); onSelect?.(); }}>{section.name}{!section.visible && " · ausgeblendet"}</button>}
    <div className="ed-section-inner">{body}</div>
  </section>;
}
