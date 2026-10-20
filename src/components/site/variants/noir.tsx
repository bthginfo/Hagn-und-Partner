"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { ArrowDown, ArrowDownToLine, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, Check, ChevronDown, Info, Mail, Minus, Phone, Plus, X } from "lucide-react";
import type { ContentItem, ImageValue, SectionContent } from "@/lib/types";
import { copyrightText, footerConfig } from "@/lib/site-config";
import { ContentDisclosure, EditableChoice, ContentLink, EditableImage, EditableText, safeHref, teamEmailLabel } from "../editable";
import { FooterLegalLinks, FooterNavigation } from "../footer-navigation";
import { ContactForm } from "../contact-form";
import { ContentIcon } from "../content-icon";
import { consentEvent, ExternalMedia } from "../consent";
import type { VariantSectionProps, VariantSiteProps } from "./types";
import { NoirSculpture, type SpatialMotion } from "./noir-sculpture";
import { useSmartHeader } from "../smart-header";
import { SectionHeadingProvider, useSectionHeadingLevel } from "../heading-level";

const aliases: Record<string, string> = {
  "noir-hero": "hero", "editorial-hero": "hero", "cinematic-hero": "hero",
  "case-deck": "services", "service-explorer": "services", "focus-finder": "services",
  "people-index": "team", "portrait-mosaic": "team", "portrait-rail": "team",
  "image-curtain": "gallery", "editorial-gallery": "gallery",
  "noir-manifesto": "statement", "editorial-statement": "statement", "kinetic-statement": "statement",
  "noir-contact": "cta", "contact-poster": "cta", "contact-dock": "cta", "stacked-panels": "steps", "accordion": "faq",
};
const knownTypes = new Set(["hero", "statement", "services", "team", "gallery", "cta", "contact", "steps", "faq", "split", "richtext", "cards", "list", "downloads", "quote", "logos", "video", "map", "divider", "timeline", "notice", "comparison", "columns", "opening-hours", "stats"]);
const phoneHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;
const serial = (value: number) => String(value).padStart(2, "0");

export function NoirSite({ page, site, editable, selectedSectionId, onSectionSelect, onSectionChange, fallback }: VariantSiteProps) {
  const Main = editable ? "div" : "main";
  const sections = page.sections.filter(section => section.visible || editable);
  const portraits = sections.filter(section => (aliases[section.type] || section.type) === "team").flatMap(section => section.content.items || []).filter(person => person.image);
  return <div className="nr-website">
    <NoirHeader site={site} page={page} editable={editable} />
    <Main data-site-main={editable ? "" : undefined} role={editable ? "region" : undefined} aria-label={editable ? `Seitenvorschau: ${page.title}` : undefined} id="hauptinhalt" tabIndex={editable ? undefined : -1} className="nr-main">
      {sections.map((section) => <SectionHeadingProvider sectionId={section.id} key={section.id}>
        {knownTypes.has(aliases[section.type] || section.type)
          ? <NoirSection section={section} site={site} editable={editable} selected={selectedSectionId === section.id} onSelect={() => onSectionSelect?.(section.id)} onChange={onSectionChange} portraits={portraits} />
          : <div className="nr-fallback">{fallback(section)}</div>}
      </SectionHeadingProvider>)}
      {!sections.length && editable && <div className="nr-empty-page"><Plus size={30} /><p>Fügen Sie einen Abschnitt aus der Bibliothek hinzu.</p></div>}
    </Main>
    <NoirFooter site={site} editable={editable} />
  </div>;
}

function NoirHeader({ site, page, editable }: Pick<VariantSiteProps, "site" | "page" | "editable">) {
  const [open, setOpen] = useState(false);
  const smartHeader = useSmartHeader({ open, disabled: editable, maxWidth: 760 });
  const dialog = useRef<HTMLDialogElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const contact = site.navigation.find(item => /kontakt/.test(item.href));
  useEffect(() => {
    if (open && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!open && dialog.current?.open) { dialog.current.close(); toggle.current?.focus(); }
  }, [open]);
  return <>
    <aside className="nr-spine" aria-label="Seitennavigation">
      <ContentLink href="/" editable={editable} className="nr-spine-mark" label={`${site.name} – Startseite`}><span aria-hidden="true">&amp;</span></ContentLink>
      <nav aria-label="Schnellnavigation">{site.navigation.slice(0, 3).map((link, index) => <ContentLink href={link.href} editable={editable} key={link.href} label={`${serial(index + 1)} ${link.label}`}><span>{serial(index + 1)}</span><small>{link.label}</small></ContentLink>)}</nav>
      <span className="nr-spine-city">{site.city}</span>
      <div className="nr-reading-progress" aria-hidden="true"><i /></div>
    </aside>
    <header {...smartHeader} className="nr-header">
      <ContentLink href="/" editable={editable} className="nr-brand"><strong>{site.name}</strong><span>{site.tagline}</span></ContentLink>
      <nav className="nr-header-navigation" aria-label="Hauptnavigation">{site.navigation.map(link => <ContentLink key={link.href} href={link.href} editable={editable} className={link.href.replace(/^\//, "") === page.slug ? "is-current" : ""}>{link.label}</ContentLink>)}</nav>
      <div className="nr-header-controls">{contact && <ContentLink href={contact.href} editable={editable} className="nr-header-contact" label={contact.label}><ArrowUpRight size={20} /></ContentLink>}<button type="button" className="nr-menu-toggle" ref={toggle} aria-expanded={open} aria-controls={id} onClick={() => setOpen(true)}><span>Menü</span><i /><i /></button></div>
    </header>
    <dialog ref={dialog} id={id} className="nr-menu" aria-label="Hauptnavigation" onCancel={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="nr-menu-head"><ContentLink href="/" editable={editable} className="nr-brand"><strong>{site.name}</strong><span>{site.tagline}</span></ContentLink><button type="button" onClick={() => setOpen(false)}>Schließen <X size={23} /></button></div>
      <div className="nr-menu-layout"><nav aria-label="Alle Seiten">{site.navigation.map((link, index) => <a href={safeHref(link.href)} key={link.href} aria-current={link.href.replace(/^\//, "") === page.slug ? "page" : undefined} onClick={event => { if (editable) event.preventDefault(); setOpen(false); }}><span className="nr-menu-number">{serial(index + 1)}</span><span>{link.label}</span><ArrowUpRight size={40} strokeWidth={1} /></a>)}</nav><div className="nr-menu-details"><p>{site.legalName}</p><address>{site.address}<br />{site.postalCode} {site.city}</address><ContentLink href={phoneHref(site.phone)} editable={editable}>{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}>{site.email}</ContentLink><div><FooterLegalLinks site={site} editable={editable} /></div></div></div>
      <span className="nr-menu-sculpture" aria-hidden="true">§</span>
    </dialog>
  </>;
}

function NoirFooter({ site, editable }: Pick<VariantSiteProps, "site" | "editable">) {
  const footer = footerConfig(site);
  return <footer className="nr-footer">
    <div className="nr-footer-invitation"><p>{site.footerText}</p>{footer.ctaLabel && <ContentLink href={footer.ctaHref} editable={editable}>{footer.ctaLabel}<ArrowUpRight size={52} strokeWidth={1.2} /></ContentLink>}</div>
    <div className="nr-footer-index" style={{ "--nr-footer-columns": Math.max(1, Number(footer.showAddress) + Number(footer.showContact || footer.showHours) + Number(Boolean(footer.columns.length))) } as CSSProperties}>
      {footer.showAddress && <div>{footer.addressHeading && <h2>{footer.addressHeading}</h2>}<p>{site.legalName}</p><address>{site.address}<br />{site.postalCode} {site.city}</address></div>}
      {(footer.showContact || footer.showHours) && <div>{footer.contactHeading && <h2>{footer.contactHeading}</h2>}{footer.showContact && <div className="nr-footer-contact"><ContentLink href={phoneHref(site.phone)} editable={editable}>{site.phone}</ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable}>{site.email}</ContentLink>{site.fax && <span>Fax {site.fax}</span>}</div>}{footer.showHours && <div className="nr-footer-hours">{site.openingHours.map(entry => <p key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>}</div>}
      <FooterNavigation site={site} editable={editable} arrows />
    </div>
    {footer.brandText && <ContentLink href="/" editable={editable} className="nr-footer-brand">{footer.brandText}</ContentLink>}
    <div className="nr-footer-bottom"><span>{copyrightText(site)}</span><div><FooterLegalLinks site={site} editable={editable} />{site.consent.enabled && footer.showCookieSettings && <button type="button" onClick={() => { if (!editable) window.dispatchEvent(new Event(consentEvent)); }}>Cookie-Einstellungen</button>}</div>{footer.showBackToTop && <a href="#hauptinhalt" className="nr-back-top" aria-label="Zum Seitenanfang"><ArrowUp size={20} /></a>}</div>
  </footer>;
}

function useBindings({ section, onChange, editable }: VariantSectionProps) {
  const content = section.content;
  const level = useSectionHeadingLevel(section.id);
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...content, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (content.items || []).map((item, position) => position === index ? { ...item, [key]: value } : item));
  const text = (key: "heading" | "subheading" | "text" | "quote" | "attribution" | "caption", as: "h1" | "h2" | "h3" | "p" | "span" | "div" | "blockquote" = "p", className = "") => <EditableText as={as} value={content[key]} editable={editable} className={className} onChange={value => update(key, value)} />;
  const heading = (className = "nr-heading") => text("heading", level, className);
  const itemText = (item: ContentItem, index: number, key: "title" | "text" | "meta" | "label" | "email" | "phone", as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} className={className} onChange={value => updateItem(index, key, value)} />;
  const image = (value: ImageValue | undefined, className = "", priority = false, change = (next: ImageValue) => update("image", next)) => <EditableImage image={value} editable={editable} className={className} priority={priority} onChange={change} />;
  const itemImage = (item: ContentItem, index: number, className = "", priority = false) => image(item.image, className, priority, next => updateItem(index, "image", next));
  const itemIcon = (item: ContentItem, size = 23, fallback = "ArrowUpRight") => <ContentIcon name={item.icon || fallback} size={size} editable={editable} itemId={item.id} sectionId={section.id} />;
  const details = (item: ContentItem, index: number) => item.details?.length ? <ul className="nr-details">{item.details.map((detail, detailIndex) => <li key={detailIndex}><Check size={14} aria-hidden="true" /><EditableText as="span" value={detail} editable={editable} onChange={value => updateItem(index, "details", item.details!.map((entry, position) => position === detailIndex ? value : entry))} /></li>)}</ul> : null;
  const tags = (item: ContentItem, index: number) => item.tags?.length ? <div className="nr-tags">{item.tags.map((tag, tagIndex) => <EditableText as="span" value={tag} key={tagIndex} editable={editable} onChange={value => updateItem(index, "tags", item.tags!.map((entry, position) => position === tagIndex ? value : entry))} />)}</div> : null;
  const itemLink = (item: ContentItem, index: number, label = "Mehr erfahren", className = "nr-link", download = false) => item.href ? <ContentLink href={item.href} editable={editable} className={className} download={download}>{item.label || editable ? itemText(item, index, "label", "span") : label}{download ? <ArrowDownToLine size={18} /> : <ArrowUpRight size={18} />}</ContentLink> : null;
  const actions = (className = "") => (content.primaryLabel || content.secondaryLabel || editable) ? <div className={`nr-actions ${className}`}>{(content.primaryLabel || editable) && <ContentLink href={content.primaryHref} editable={editable} className="nr-button"><EditableText as="span" value={content.primaryLabel} editable={editable} onChange={value => update("primaryLabel", value)} /><ArrowUpRight size={22} strokeWidth={1.5} /></ContentLink>}{content.secondaryLabel && <ContentLink href={content.secondaryHref} editable={editable} className="nr-link"><EditableText as="span" value={content.secondaryLabel} editable={editable} onChange={value => update("secondaryLabel", value)} /><ArrowUpRight size={18} /></ContentLink>}</div> : null;
  const intro = (className = "") => <div className={`nr-intro ${className}`}><div>{heading()}{content.subheading && text("subheading", "p", "nr-subheading")}</div>{text("text", "p", "nr-copy")}</div>;
  return { content, update, updateItem, text, heading, itemText, image, itemImage, itemIcon, details, tags, itemLink, actions, intro };
}
type Bindings = ReturnType<typeof useBindings>;
type InnerProps = VariantSectionProps & { binding: Bindings };

const defaultPalettes: Record<string, { bg: string; fg: string }> = { steps: { bg: "var(--hp-palette-text, #eef0e8)", fg: "var(--hp-palette-primary, #101415)" }, team: { bg: "var(--hp-palette-surface, #111617)", fg: "var(--hp-palette-text, #eef0e8)" }, gallery: { bg: "var(--hp-palette-primary, #101415)", fg: "var(--hp-palette-text, #eef0e8)" } };

export function NoirSection(props: VariantSectionProps) {
  const { section, editable, selected, onSelect } = props;
  const b = useBindings(props);
  const type = aliases[section.type] || section.type;
  if (!knownTypes.has(type)) return null;
  const d = section.design;
  const base = defaultPalettes[type] || { bg: "var(--hp-palette-background, #080b0d)", fg: "var(--hp-palette-text, #eef0e8)" };
  const palette = d.theme === "soft" ? { bg: "var(--hp-palette-surface, #15191a)", fg: "var(--hp-palette-text, #eef0e8)" } : d.theme === "accent" ? { bg: "#191713", fg: "var(--hp-palette-text, #eef0e8)" } : d.theme === "dark" ? { bg: "#050708", fg: "var(--hp-palette-text, #eef0e8)" } : base;
  const style = { "--nr-section-bg": d.background || palette.bg, "--nr-section-fg": d.textColor || palette.fg, "--nr-section-accent": d.accentColor || "var(--hp-palette-accent, #d7a877)", "--nr-scale": d.fontScale, "--nr-radius": `${d.radius}px`, "--nr-columns": d.columns, "--nr-heading-font": d.headingFont === "sans" ? "var(--font-body)" : "var(--font-display)", borderWidth: d.border ? `${d.border}px` : undefined } as CSSProperties;
  let body: ReactNode;
  if (type === "hero") body = <SpatialHero {...props} binding={b} />;
  else if (type === "services") body = <CaseDeck {...props} binding={b} />;
  else if (type === "team") body = <PeopleIndex {...props} binding={b} />;
  else if (type === "gallery") body = <ImageCurtain {...props} binding={b} />;
  else if (type === "statement") body = <Manifesto {...props} binding={b} />;
  else if (type === "steps") body = <MeasuredProcess {...props} binding={b} />;
  else if (type === "cta") body = <ContactPoster {...props} binding={b} />;
  else if (type === "contact") body = <NoirContact {...props} binding={b} />;
  else if (type === "faq") body = <NoirFaq {...props} binding={b} />;
  else if (type === "split") body = <NoirSplit {...props} binding={b} />;
  else body = <QuietContent {...props} binding={b} type={type} />;
  return <section id={section.anchor || section.id} data-section-id={section.id} data-section-type={section.type} data-theme={d.theme} style={style} className={`nr-section nr-section--${type} nr-width--${d.width} nr-spacing--${d.spacing} nr-align--${d.align} nr-animation--${d.animation}${editable ? " hp-editable-section" : ""}${selected ? " hp-section-selected" : ""}${!section.visible ? " hp-section-hidden" : ""}`} onClick={editable ? () => onSelect?.() : undefined}>
    {editable && <button type="button" className="hp-section-select" onClick={event => { event.stopPropagation(); onSelect?.(); }} aria-label={`${section.name} auswählen`}>{section.name}{!section.visible && " · ausgeblendet"}</button>}
    {body}
  </section>;
}

function useSpatialDepth(ref: RefObject<HTMLDivElement | null>, enabled: boolean, motionRef: RefObject<SpatialMotion>) {
  useEffect(() => {
    const element=ref.current;
    if(!element||!enabled)return;
    const preference=window.matchMedia("(prefers-reduced-motion: reduce), (max-width: 900px), (pointer: coarse)");
    let visible=true,frame=0,previous=0,x=0,y=0,scroll=0;
    const target={x:0,y:0,scroll:0};
    let bounds=element.getBoundingClientRect();
    const reset=()=>{x=y=scroll=target.x=target.y=target.scroll=0;motionRef.current.x=motionRef.current.y=0;element.style.setProperty("--nr-pointer-x","0");element.style.setProperty("--nr-pointer-y","0");element.style.setProperty("--nr-depth-scroll","0");motionRef.current.render?.();};
    function update(now:number){
      frame=0;if(!visible||document.hidden||preference.matches){previous=0;return;}
      const dt=previous?Math.min(64,now-previous):16.7;previous=now;
      const ease=1-Math.exp(-dt/125);
      x+=(target.x-x)*ease;y+=(target.y-y)*ease;scroll+=(target.scroll-scroll)*ease;
      const unsettled=Math.abs(target.x-x)+Math.abs(target.y-y)+Math.abs(target.scroll-scroll)>.001;
      if(!unsettled){x=target.x;y=target.y;scroll=target.scroll;previous=0;}
      motionRef.current.x=x;motionRef.current.y=y;
      element!.style.setProperty("--nr-pointer-x",x.toFixed(5));element!.style.setProperty("--nr-pointer-y",y.toFixed(5));element!.style.setProperty("--nr-depth-scroll",scroll.toFixed(5));
      motionRef.current.render?.();if(unsettled)request();
    }
    function request(){if(!frame&&visible&&!document.hidden&&!preference.matches)frame=requestAnimationFrame(update);}
    function measure(){bounds=element!.getBoundingClientRect();target.scroll=Math.max(-1,Math.min(1,-bounds.top/Math.max(1,bounds.height)));request();}
    function pointer(event:PointerEvent){if(event.pointerType==='touch'||preference.matches)return;target.x=Math.max(-.7,Math.min(.7,(event.clientX-bounds.left)/bounds.width*2-1));target.y=Math.max(-.7,Math.min(.7,(event.clientY-bounds.top)/bounds.height*2-1));request();}
    function leave(){target.x=target.y=0;request();}
    function changed(){if(preference.matches){if(frame)cancelAnimationFrame(frame);frame=0;reset();}else measure();}
    const observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??false;if(!visible&&frame){cancelAnimationFrame(frame);frame=0;previous=0;}else measure();},{rootMargin:"80px"});observer.observe(element);
    element.addEventListener("pointermove",pointer,{passive:true});element.addEventListener("pointerleave",leave);
    window.addEventListener("scroll",measure,{passive:true});window.addEventListener("resize",measure,{passive:true});document.addEventListener("visibilitychange",measure);preference.addEventListener("change",changed);changed();
    return()=>{if(frame)cancelAnimationFrame(frame);observer.disconnect();element.removeEventListener("pointermove",pointer);element.removeEventListener("pointerleave",leave);window.removeEventListener("scroll",measure);window.removeEventListener("resize",measure);document.removeEventListener("visibilitychange",measure);preference.removeEventListener("change",changed);reset();};
  },[enabled,ref,motionRef]);
}

function SpatialHero({ site, section, editable, portraits = [], binding: b }: InnerProps) {
  const scene = useRef<HTMLDivElement>(null);
  const [personIndex, setPersonIndex] = useState(0);
  const motionRef=useRef<SpatialMotion>({x:0,y:0});
  useSpatialDepth(scene, !editable && section.design.animation !== "none", motionRef);
  const ownPeople = (b.content.items || []).filter(item => item.image || editable);
  const people = b.content.items === undefined ? portraits : ownPeople;
  const currentPerson = Math.min(personIndex, Math.max(0, people.length - 1));
  const person = people[currentPerson];
  const changePerson = (image: ImageValue) => {
    const index = (b.content.items || []).findIndex(item => item.id === person?.id);
    if (index >= 0) b.updateItem(index, "image", image);
    else if (person) b.update("items", [...(b.content.items || []), { ...person, image }]);
  };
  const changePersonTitle = (title: string) => {
    const index = (b.content.items || []).findIndex(item => item.id === person?.id);
    if (index >= 0) b.updateItem(index, "title", title);
    else if (person) b.update("items", [...(b.content.items || []), { ...person, title }]);
  };
  return <div className={`nr-hero nr-hero-layout--${section.design.heroLayout || "auto"}${person ? " nr-hero--people" : ""}`} ref={scene}>
    <div className="nr-hero-far-plane" aria-hidden="true"><div className="nr-architecture-line nr-architecture-line--one" /><div className="nr-architecture-line nr-architecture-line--two" /><span className="nr-floor-grid" /></div>
    <div className="nr-hero-sculpture"><NoirSculpture staticMode={editable || section.design.animation === "none"} motionRef={motionRef} /></div>
    <div className="nr-hero-coordinate"><span>{site.city}</span><span>{site.tagline}</span><i aria-hidden="true" /></div>
    <div className="nr-hero-foreground">{b.heading("nr-hero-heading")}{b.content.subheading && b.text("subheading", "p", "nr-hero-subheading")}</div>
    <div className="nr-hero-copy"><div>{b.text("text", "p", "nr-copy")}{b.actions()}</div>{!b.content.secondaryHref?.startsWith("tel:") && <ContentLink href={phoneHref(site.phone)} editable={editable} className="nr-hero-phone"><Phone size={14} />{site.phone}<ArrowUpRight size={15} /></ContentLink>}</div>
    {(b.content.image || editable) && <div className="nr-hero-office">{b.image(b.content.image, "nr-hero-office-image", true)}{b.content.caption && b.text("caption", "span", "nr-hero-photo-caption")}</div>}
    {person && (person.image || editable) && <div className="nr-hero-person" data-item-id={person.id}>{b.image(person.image, "nr-hero-person-image", true, changePerson)}{person.href ? <ContentLink href={person.href} editable={editable} className="nr-hero-person-link"><EditableText as="span" value={person.title} editable={editable} onChange={changePersonTitle} /><ArrowUpRight size={17} /></ContentLink> : <EditableText as="p" value={person.title} editable={editable} onChange={changePersonTitle} className="nr-hero-person-link" />}{people.length > 1 && <div className="nr-hero-person-controls"><span aria-live="polite">{serial(currentPerson + 1)} / {serial(people.length)}</span><button type="button" aria-label="Vorheriges Porträt" onClick={() => setPersonIndex((currentPerson + people.length - 1) % people.length)}><ArrowLeft size={13} /></button><button type="button" aria-label="Nächstes Porträt" onClick={() => setPersonIndex((currentPerson + 1) % people.length)}><ArrowRight size={13} /></button></div>}</div>}
    <div className="nr-hero-baseline"><span>{site.name}</span><span>{site.address} · {site.city}</span><a href={`#${section.id}-weiter`} aria-label="Weiter zum Inhalt"><ArrowDown size={18} /><span>Weiter</span></a></div>
    <span id={`${section.id}-weiter`} className="nr-scroll-target" />
  </div>;
}

function Manifesto({ editable, binding: b }: InnerProps) {
  const root = useRef<HTMLDivElement>(null);
  const words = (b.content.text || "").split(/\s+/).filter(Boolean);
  useEffect(() => {
    const element = root.current;
    if (!element || editable || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0, visible = false;
    const paint = () => { frame = 0; if (!visible || document.hidden) return; const rect = element.getBoundingClientRect(); const value = Math.max(0, Math.min(1, (window.innerHeight * 0.88 - rect.top) / (rect.height + window.innerHeight * 0.15))); element.style.setProperty("--nr-reading", String(value * (words.length + 4))); };
    const request = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(paint); };
    const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; request(); }); observer.observe(element);
    window.addEventListener("scroll", request, { passive: true }); document.addEventListener("visibilitychange", request);
    return () => { observer.disconnect(); if (frame) cancelAnimationFrame(frame); window.removeEventListener("scroll", request); document.removeEventListener("visibilitychange", request); };
  }, [editable, words.length]);
  return <div className="nr-manifesto nr-container" ref={root}><div className="nr-manifesto-signature" aria-hidden="true">§</div><div className="nr-manifesto-title">{b.heading()}{b.content.subheading && b.text("subheading", "p", "nr-subheading")}</div><div className="nr-manifesto-main">{editable ? b.text("text", "p", "nr-manifesto-prose") : <p className="nr-manifesto-prose">{words.map((word, index) => <span key={index} style={{ "--nr-word": index } as CSSProperties}>{word}{" "}</span>)}</p>}{b.actions()}</div></div>;
}

function CaseDeck({ editable, section, binding: b }: InnerProps) {
  const items = b.content.items || [];
  const [active, setActive] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLElement | null)[]>([]);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const id = useId();
  const current = Math.min(active, Math.max(0, items.length - 1));
  const item = items[current];
  function choose(index: number, focus = false) {
    const next = Math.max(0, Math.min(index, items.length - 1)); setActive(next);
    const button = tabs.current[next];
    if (button && track.current) { track.current.scrollTo({ left: button.offsetLeft - track.current.offsetLeft - 16, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); if (focus) button.focus({ preventScroll: true }); }
  }
  return <div className="nr-cases nr-container">{b.intro()}<div className="nr-case-topline"><div className="nr-counter" aria-live="polite"><strong>{item ? serial(current + 1) : "00"}</strong><span>/ {serial(items.length)}</span></div><div className="nr-round-controls"><button type="button" aria-label="Vorheriges Rechtsgebiet" disabled={!current} onClick={() => choose(current - 1)}><ArrowLeft size={20} /></button><button type="button" aria-label="Nächstes Rechtsgebiet" disabled={!items.length || current === items.length - 1} onClick={() => choose(current + 1)}><ArrowRight size={20} /></button></div></div>
    {item && <div id={`${id}-panel`} role={editable ? "region" : "tabpanel"} aria-labelledby={`${id}-tab-${current}`} className="nr-case-preview" data-item-id={item.id} key={item.id}><div className="nr-case-preview-title"><span className="nr-case-watermark" aria-hidden="true" data-mark={serial(current + 1)} /><ContentIcon name={item.icon} size={30} editable={editable} itemId={item.id} sectionId={section.id} className="nr-case-content-icon" />{b.itemText(item, current, "title", "h3")}{b.itemText(item, current, "meta", "p", "nr-case-meta")}</div><div className="nr-case-preview-copy">{b.itemText(item, current, "text", "p", "nr-copy")}{b.details(item, current)}{b.tags(item, current)}{b.itemLink(item, current, "Zum Rechtsgebiet")}</div>{item.image && <div className="nr-case-preview-photo">{b.itemImage(item, current)}</div>}</div>}
    <div className="nr-case-track" role={editable ? "group" : "tablist"} aria-label={b.content.heading || "Rechtsgebiete"} ref={track} onPointerDown={event => { if (event.pointerType !== "mouse" || editable || event.button !== 0) return; drag.current = { x: event.clientX, left: event.currentTarget.scrollLeft, moved: false }; }} onPointerMove={event => { const start = drag.current; if (!start) return; const delta = event.clientX - start.x; if (Math.abs(delta) > 5) { start.moved = true; event.currentTarget.scrollLeft = start.left - delta; event.currentTarget.classList.add("is-dragging"); } }} onPointerUp={event => { event.currentTarget.classList.remove("is-dragging"); window.setTimeout(() => { drag.current = null; }, 0); }} onPointerLeave={event => { event.currentTarget.classList.remove("is-dragging"); if (drag.current?.moved) drag.current = null; }} onClickCapture={event => { if (drag.current?.moved) { event.preventDefault(); event.stopPropagation(); } }}>
      {items.map((entry, index) => <EditableChoice editable={editable} type="button" key={entry.id} id={`${id}-tab-${index}`} role="tab" data-item-id={entry.id} elementRef={node => { tabs.current[index] = node; }} aria-controls={`${id}-panel`} aria-selected={index === current} tabIndex={index === current ? 0 : -1} className={`nr-case-file${index === current ? " is-active" : ""}`} style={{ "--nr-file-offset": index % 3 } as CSSProperties} onChoose={() => choose(index)} onKeyDown={event => { if ((event.target as HTMLElement).closest("[contenteditable]")) return; if (event.key === "ArrowRight") { event.preventDefault(); choose((current + 1) % items.length, true); } if (event.key === "ArrowLeft") { event.preventDefault(); choose((current + items.length - 1) % items.length, true); } if (event.key === "Home") { event.preventDefault(); choose(0, true); } if (event.key === "End") { event.preventDefault(); choose(items.length - 1, true); } }}><span className="nr-case-file-top"><span>{serial(index + 1)}</span><ArrowUpRight size={21} /></span>{b.itemText(entry, index, "title", "span", "nr-case-file-title")}<span className="nr-case-file-bottom" aria-hidden="true"><i /><i /><i /></span></EditableChoice>)}
    </div>{b.actions("nr-section-actions")}
    {!items.length && editable && <p className="nr-empty-state">Fügen Sie ein Rechtsgebiet hinzu.</p>}
  </div>;
}

function PeopleIndex({ editable, binding: b }: InnerProps) {
  const items = b.content.items || [];
  const [active, setActive] = useState(0);
  const start = useRef<number | null>(null);
  const current = Math.min(active, Math.max(0, items.length - 1));
  const item = items[current];
  const id = useId();
  const buttons = useRef<(HTMLElement | null)[]>([]);
  const directory = useRef<HTMLDivElement>(null);
  function choose(index: number, focus = false) { const next = Math.max(0, Math.min(items.length - 1, index)); setActive(next); const button = buttons.current[next]; const row = button?.parentElement; if (row && directory.current) directory.current.scrollTo({ left: row.offsetLeft - directory.current.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); if (focus) button?.focus({ preventScroll: true }); }
  return <div className="nr-people nr-container">{b.intro()}<div className="nr-people-layout"><div className="nr-people-directory" ref={directory} role={editable ? "group" : "tablist"} aria-label={b.content.heading || "Unser Team"} aria-orientation={editable ? undefined : "vertical"}>{items.map((person, index) => <div className={`nr-person-row${index === current ? " is-active" : ""}`} data-item-id={person.id} key={person.id}><EditableChoice editable={editable} type="button" role="tab" elementRef={node => { buttons.current[index] = node; }} id={`${id}-person-${index}`} aria-controls={`${id}-portrait`} aria-selected={current === index} tabIndex={index === current ? 0 : -1} onChoose={() => choose(index)} onKeyDown={event => { if ((event.target as HTMLElement).closest("[contenteditable]")) return; if (event.key === "ArrowDown" || event.key === "ArrowRight") { event.preventDefault(); choose((current + 1) % items.length, true); } if (event.key === "ArrowUp" || event.key === "ArrowLeft") { event.preventDefault(); choose((current + items.length - 1) % items.length, true); } if (event.key === "Home") { event.preventDefault(); choose(0, true); } if (event.key === "End") { event.preventDefault(); choose(items.length - 1, true); } }}><span className="nr-person-number">{serial(index + 1)}</span>{b.itemText(person, index, "title", "span")}<ArrowUpRight size={22} /></EditableChoice>{person.meta && b.itemText(person, index, "meta", "p", "nr-person-index-role")}</div>)}</div>
      {item && <div id={`${id}-portrait`} role={editable ? "region" : "tabpanel"} aria-labelledby={`${id}-person-${current}`} className="nr-person-feature" data-item-id={item.id}><div className="nr-person-photo-stage" onTouchStart={event => { start.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={event => { if (start.current === null || editable) return; const delta = (event.changedTouches[0]?.clientX ?? start.current) - start.current; if (Math.abs(delta) > 50) choose(current + (delta < 0 ? 1 : -1)); start.current = null; }}><div className="nr-person-photo-key" key={item.id}>{b.itemImage(item, current, "nr-person-photo")}</div><span className="nr-person-photo-index" aria-hidden="true">{serial(current + 1)}</span><div className="nr-portrait-controls"><span aria-live="polite">{serial(current + 1)} / {serial(items.length)}</span><button type="button" aria-label="Vorherige Person" disabled={!current} onClick={() => choose(current - 1)}><ArrowLeft size={19} /></button><button type="button" aria-label="Nächste Person" disabled={current === items.length - 1} onClick={() => choose(current + 1)}><ArrowRight size={19} /></button></div></div><div className="nr-person-feature-info"><div>{item.href ? <ContentLink href={item.href} editable={editable} className="nr-person-profile-link">{b.itemText(item, current, "title", "h3")}<ArrowUpRight size={29} /></ContentLink> : b.itemText(item, current, "title", "h3")}{b.itemText(item, current, "meta", "p", "nr-person-role")}{b.itemText(item, current, "text", "p", "nr-copy")}{b.tags(item, current)}</div><div className="nr-person-direct">{item.email && <ContentLink href={`mailto:${item.email}`} editable={editable} label={teamEmailLabel(item)}><Mail size={15} /><span>{item.label === "Sekretariat" ? "Sekretariat: " : ""}{b.itemText(item, current, "email", "span")}</span></ContentLink>}{item.phone && <ContentLink href={phoneHref(item.phone)} editable={editable}><Phone size={15} />{b.itemText(item, current, "phone", "span")}</ContentLink>}{b.itemLink(item, current, "Zum Profil")}</div></div>{item.details?.length ? <details className="nr-person-vita"><summary>Vita und Qualifikationen<ChevronDown size={18} /></summary>{b.details(item, current)}</details> : null}</div>}
    </div>{b.actions("nr-section-actions")}{!items.length && editable && <p className="nr-empty-state">Fügen Sie eine Person hinzu.</p>}</div>;
}

function ImageCurtain({ editable, binding: b }: InnerProps) {
  const images = b.content.images?.length ? b.content.images : b.content.image ? [b.content.image] : [];
  const [frontIndex, setFrontIndex] = useState(1);
  const [reveal, setReveal] = useState(56);
  const current = Math.min(frontIndex, Math.max(0, images.length - 1));
  const behind = images.length > 1 ? (current + images.length - 1) % images.length : current;
  const id = useId();
  const changeImage = (index: number, image: ImageValue) => b.content.images?.length ? b.update("images", b.content.images.map((entry, position) => position === index ? image : entry)) : b.update("image", image);
  return <div className="nr-gallery nr-container">{b.intro()}<div className={`nr-curtain${editable ? " nr-curtain--editing" : ""}`} style={{ "--nr-curtain": `${reveal}%` } as CSSProperties}>
    {editable ? <div className="nr-curtain-edit-images">{images.length ? images.map((image, index) => <div data-image-index={index} key={index}><EditableImage image={image} editable onChange={next => changeImage(index, next)} caption /></div>) : b.image(b.content.image, "nr-curtain-photo")}</div> : images.length > 0 && <><div className="nr-curtain-back"><EditableImage image={images[behind]} className="nr-curtain-photo" /></div>{images.length > 1 && <div className="nr-curtain-front" key={current}><EditableImage image={images[current]} className="nr-curtain-photo" /></div>}{images.length > 1 && <div className="nr-curtain-seam" aria-hidden="true"><span><ArrowLeft size={16} /><ArrowRight size={16} /></span></div>}<div className="nr-curtain-captions"><span>{images[current].caption || images[current].alt}</span>{images.length > 1 && <span>{images[behind].caption || images[behind].alt}</span>}</div></>}
  </div>{!editable && images.length > 1 && <div className="nr-curtain-controls"><label htmlFor={`${id}-range`}>Bildansicht</label><input type="range" id={`${id}-range`} min={0} max={100} value={reveal} onChange={event => setReveal(Number(event.target.value))} aria-valuetext={`${images[current].alt}: ${reveal} Prozent sichtbar`} /><div className="nr-curtain-image-picker" role="group" aria-label="Fotografie auswählen">{images.map((image, index) => <button type="button" key={index} aria-label={`${serial(index + 1)} ${image.caption || image.alt || "Fotografie"}`} aria-pressed={current === index} onClick={() => { setFrontIndex(index); setReveal(56); }}>{serial(index + 1)}</button>)}</div></div>}{b.content.caption && b.text("caption", "p", "nr-gallery-caption")}{b.actions()}</div>;
}

function MeasuredProcess({ binding: b }: InnerProps) {
  return <div className="nr-process nr-container">{b.intro()}<ol className="nr-process-columns">{(b.content.items || []).map((item, index) => <li data-item-id={item.id} key={item.id}><div className="nr-process-measure"><span>{serial(index + 1)}</span><ArrowDown size={28} strokeWidth={1} /></div>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.details(item, index)}{b.itemLink(item, index)}</li>)}</ol>{b.actions("nr-section-actions")}</div>;
}

function ContactPoster({ site, binding: b }: InnerProps) {
  return <div className="nr-poster nr-container"><span className="nr-poster-mark" aria-hidden="true">§</span>{b.heading("nr-poster-heading")}<div className="nr-poster-bottom"><span>{site.address}<br />{site.postalCode} {site.city}</span><div>{b.text("subheading", "p", "nr-subheading")}{b.text("text", "p", "nr-copy")}{b.actions()}</div></div></div>;
}

function NoirContact({ site, editable, binding: b }: InnerProps) {
  return <div className="nr-contact nr-container">{b.intro()}<div className="nr-contact-layout"><div className="nr-contact-details"><ContentLink href={phoneHref(site.phone)} editable={editable} className="nr-contact-phone">{site.phone}<ArrowUpRight size={27} /></ContentLink><ContentLink href={`mailto:${site.email}`} editable={editable} className="nr-contact-email">{site.email}<ArrowUpRight size={18} /></ContentLink><address>{site.legalName}<br />{site.address}<br />{site.postalCode} {site.city}</address><ContentLink href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.address}, ${site.postalCode} ${site.city}`)}`} editable={editable} target="_blank" className="nr-link">Anfahrt planen<ArrowUpRight size={17} /></ContentLink><div className="nr-contact-hours">{site.openingHours.map(entry => <p key={entry.day}><span>{entry.day}</span><span>{entry.hours}</span></p>)}</div>{site.fax && <p className="nr-contact-fax">Fax {site.fax}</p>}{b.actions()}</div><div className="nr-form-sheet"><ContactForm editable={editable} /></div></div></div>;
}

function NoirFaq({ binding: b, editable }: InnerProps) {
  return <div className="nr-faq nr-container"><div className="nr-faq-intro">{b.heading()}{b.text("subheading", "p", "nr-subheading")}{b.text("text", "p", "nr-copy")}{b.actions()}</div><div className="nr-faq-list">{(b.content.items || []).map((item, index) => <ContentDisclosure editable={editable} className="nr-faq-item" data-item-id={item.id} key={item.id} summary={<> <span className="nr-faq-number">{serial(index + 1)}</span>{b.itemText(item, index, "title", "h3")}<span className="nr-disclosure"><Plus size={21} /><Minus size={21} /></span></>}><div className="nr-faq-answer">{b.itemText(item, index, "text", "p", "nr-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div></ContentDisclosure>)}</div></div>;
}

function NoirSplit({ section, editable, binding: b }: InnerProps) {
  return <div className={`nr-split nr-split--${section.design.imageSide}`}><div className="nr-split-photo-wrap">{b.image(b.content.image, "nr-split-photo")}{b.content.caption && b.text("caption", "span", "nr-split-caption")}</div><div className="nr-split-copy">{b.heading()}{b.text("subheading", "p", "nr-subheading")}{b.text("text", "p", "nr-copy")}{(b.content.items || []).map((item, index) => <div className="nr-split-point" data-item-id={item.id} key={item.id}><ContentIcon name={item.icon} size={21} editable={editable} itemId={item.id} sectionId={section.id} /><div>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div></div>)}{b.actions()}</div></div>;
}

function QuietContent({ site, editable, type, binding: b }: InnerProps & { type: string }) {
  const items = b.content.items || [];
  if (type === "richtext") return <div className="nr-reading nr-container">{b.heading()}{b.text("subheading", "p", "nr-subheading")}{b.text("text", "div", "nr-reading-body")}{items.map((item, index) => <div className="nr-reading-block" data-item-id={item.id} key={item.id}>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div>)}{b.actions()}</div>;
  if (type === "downloads") return <div className="nr-container">{b.intro()}<div className="nr-downloads">{items.map((item, index) => <article data-item-id={item.id} key={item.id}><span className="nr-download-index">{serial(index + 1)}{b.itemIcon(item, 20, "FileText")}</span><div>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.itemText(item, index, "meta", "span", "nr-download-meta")}</div>{b.itemLink(item, index, "Herunterladen", "nr-download-link", true)}</article>)}</div>{b.actions()}</div>;
  if (type === "list") return <div className="nr-container nr-list-layout">{b.intro()}<ul className="nr-content-list">{items.map((item, index) => <li data-item-id={item.id} key={item.id}><span className="nr-list-index">{serial(index + 1)}</span><div>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.details(item, index)}{b.itemLink(item, index)}</div></li>)}</ul>{b.actions()}</div>;
  if (type === "notice") return <aside className="nr-notice nr-container"><Info size={28} strokeWidth={1.2} /><div>{b.heading()}{b.text("text", "p", "nr-copy")}{b.actions()}</div></aside>;
  if (type === "timeline") return <div className="nr-container">{b.intro()}<ol className="nr-timeline">{items.map((item, index) => <li data-item-id={item.id} key={item.id}><span className="nr-timeline-marker" aria-hidden="true" /><div>{b.itemText(item, index, "meta", "span", "nr-timeline-meta")}{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.details(item, index)}{item.image && b.itemImage(item, index, "nr-timeline-photo")}{b.itemLink(item, index)}</div></li>)}</ol>{b.actions()}</div>;
  if (type === "quote") return <figure className="nr-quote nr-container">{b.content.image && b.image(b.content.image, "nr-quote-photo")}<div>{b.content.heading && b.heading()}<span className="nr-quote-mark" aria-hidden="true">“</span>{b.text("quote", "blockquote", "nr-quote-text")}<figcaption>{b.text("attribution", "span")}{b.text("text", "span", "nr-copy")}</figcaption></div></figure>;
  if (type === "stats") return <div className="nr-container">{b.intro()}<dl className="nr-stats">{items.map((item, index) => <div data-item-id={item.id} key={item.id}><dt>{b.itemText(item, index, "text", "span")}</dt><dd>{b.itemText(item, index, "title", "span")}</dd>{b.itemText(item, index, "meta", "p")}</div>)}</dl>{b.actions()}</div>;
  if (type === "opening-hours") return <div className="nr-container">{b.intro()}<div className="nr-opening-hours">{items.length ? items.map((item, index) => <div data-item-id={item.id} key={item.id}>{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p")}</div>) : site.openingHours.map(entry => <div key={entry.day}><h3>{entry.day}</h3><p>{entry.hours}</p></div>)}</div>{b.actions()}</div>;
  if (type === "logos") return <div className="nr-container">{b.intro()}<div className="nr-logos">{(b.content.images || []).map((image, index) => <div data-image-index={index} key={index}>{b.image(image, "nr-logo-photo", false, next => b.update("images", b.content.images!.map((entry, position) => position === index ? next : entry)))}</div>)}{items.map((item, index) => <div data-item-id={item.id} key={item.id}>{item.image && b.itemImage(item, index, "nr-logo-photo")}{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.itemLink(item, index)}</div>)}</div></div>;
  if (type === "video" || type === "map") return <div className={`nr-container nr-external nr-external--${type}`}>{b.intro()}{type === "map" && <address>{site.address}<br />{site.postalCode} {site.city}</address>}<ExternalMedia kind={type} address={type === "map" ? b.content.mapAddress || `${site.legalName}, ${site.address}, ${site.postalCode} ${site.city}` : undefined} url={b.content.videoUrl} title={b.content.heading} editable={editable} />{b.text("caption", "p", "nr-copy")}{b.actions()}</div>;
  if (type === "divider") return <div className="nr-divider nr-container">{b.content.heading && b.heading()}<hr />{b.text("text", "p", "nr-copy")}</div>;
  return <div className="nr-container">{b.intro()}<div className={`nr-topic-index nr-topic-index--${type}`}>{items.map((item, index) => <article data-item-id={item.id} key={item.id}><span className="nr-topic-index-number" aria-hidden="true">{serial(index + 1)}</span>{item.image && b.itemImage(item, index, "nr-topic-photo")}<div>{b.itemText(item, index, "meta", "p", "nr-topic-meta")}{b.itemText(item, index, "title", "h3")}{b.itemText(item, index, "text", "p", "nr-copy")}{b.details(item, index)}{b.tags(item, index)}{b.itemLink(item, index)}</div></article>)}</div>{b.actions()}</div>;
}

