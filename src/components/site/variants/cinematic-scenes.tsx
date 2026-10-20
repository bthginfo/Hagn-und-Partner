"use client";

import { useSectionHeadingLevel } from "../heading-level";

import { useId, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Check, Mail, MapPin, Phone, Search, X } from "lucide-react";
import type { ContentItem, SectionContent } from "@/lib/types";
import { EditableChoice, ContentLink, EditableImage, EditableText } from "../editable";
import { ContentIcon } from "../content-icon";
import { textWithBreaks } from "../text-wrap";
import type { VariantSectionProps } from "./types";

function useSceneBindings({ section, onChange, editable }: VariantSectionProps) {
  const c = section.content;
  const headingLevel = useSectionHeadingLevel(section.id);
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (c.items ?? []).map((item, i) => i === index ? { ...item, [key]: value } : item));
  const text = (key: "heading" | "text" | "subheading" | "caption", as: "h1" | "h2" | "h3" | "p" | "span" = "p", className = "") => <EditableText as={key === "heading" ? headingLevel : as} value={c[key]} editable={editable} className={className} onChange={(value) => update(key, value)} />;
  const itemText = (item: ContentItem, index: number, key: "title" | "text", as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} className={className} onChange={(value) => updateItem(index, key, value)} />;
  const actions = (className = "") => <div className={`iv-actions ${className}`}>{(c.primaryLabel || editable) && <ContentLink href={c.primaryHref} editable={editable} className="iv-button"><EditableText as="span" value={c.primaryLabel} editable={editable} onChange={(value) => update("primaryLabel", value)} /><ArrowUpRight size={23} /></ContentLink>}{c.secondaryLabel && <ContentLink href={c.secondaryHref} editable={editable} className="iv-secondary-link"><EditableText as="span" value={c.secondaryLabel} editable={editable} onChange={(value) => update("secondaryLabel", value)} /><ArrowUpRight size={18} /></ContentLink>}</div>;
  return { c, update, updateItem, text, itemText, actions };
}

export function CinematicScene(props: VariantSectionProps) {
  const { section, editable, site, portraits = [] } = props;
  const b = useSceneBindings(props);
  const person = (b.c.items === undefined ? portraits : b.c.items).find((item) => item.image);
  const isPortrait = /rechtsanw[aä]lt|portr[aä]t/i.test(b.c.image?.alt ?? "");
  return <div className={`iv-cinema${isPortrait ? " iv-cinema--portrait" : ""}`}>
    <div className="iv-cinema-image-plane"><EditableImage image={b.c.image} editable={editable} onChange={(image) => b.update("image", image)} priority className="iv-cinema-image" /></div>
    <div className="iv-cinema-vignette" aria-hidden="true" />
    <div className="iv-cinema-type-plane">{b.text("heading", "h1", "iv-cinema-heading")}<span className="iv-cinema-heading iv-cinema-heading-outline" aria-hidden="true">{editable ? b.c.heading : textWithBreaks(b.c.heading)}</span></div>
    <div className="iv-cinema-coordinate"><MapPin size={14} /><span>{site.city}</span><span>{site.address}</span></div>
    <div className="iv-cinema-brief">{b.c.subheading && b.text("subheading", "p", "iv-cinema-subheading")}{b.text("text", "p", "iv-cinema-copy")}{b.actions("iv-cinema-actions")}</div>
    {person?.image && !isPortrait && <div className="iv-cinema-person" data-item-id={person.id}><EditableImage image={person.image} editable={editable} className="iv-cinema-person-photo" onChange={(image) => {
      const index = (b.c.items ?? []).findIndex((item) => item.id === person.id);
      if (index >= 0) b.updateItem(index, "image", image); else b.update("items", [{ ...person, image }]);
    }} /><ContentLink href={person.href || "/anwaelte"} editable={editable} className="iv-cinema-person-label"><EditableText as="span" value={person.title} editable={editable} onChange={(title) => {
      const index = (b.c.items ?? []).findIndex((item) => item.id === person.id);
      if (index >= 0) b.updateItem(index, "title", title); else b.update("items", [{ ...person, title }]);
    }} /><ArrowUpRight size={18} /></ContentLink></div>}
    <a href={`#${section.id}-filmende`} className="iv-cinema-down" aria-label="Weiter zum Inhalt"><ArrowDown size={27} strokeWidth={1.2} /></a>
    <div className="iv-cinema-baseline"><span>{site.name}</span><span>{site.tagline}</span>{b.c.caption && b.text("caption", "span")}</div><span className="iv-scroll-target" id={`${section.id}-filmende`} />
  </div>;
}

export function CinematicTopicViewport(props: VariantSectionProps) {
  const { section, editable, sceneImage } = props;
  const b = useSceneBindings(props);
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [direction, setDirection] = useState(1);
  const root = useRef<HTMLDivElement>(null); const panel = useRef<HTMLElement>(null); const buttons = useRef<HTMLDivElement>(null);
  const id = useId();
  const needle = query.trim().toLocaleLowerCase("de");
  const items = (b.c.items ?? []).map((item, index) => ({ item, index })).filter(({ item }) => `${item.title} ${item.text} ${(item.tags ?? []).join(" ")} ${(item.details ?? []).join(" ")}`.toLocaleLowerCase("de").includes(needle));
  const current = items.find(({ item }) => item.id === activeId) ?? items[0];
  const currentPosition = current ? items.findIndex(({ item }) => item.id === current.item.id) : 0;
  const visual = current?.item.image ?? b.c.image ?? sceneImage;
  function choose(position: number, scroll = false) {
    const target = items[(position + items.length) % items.length];
    if (!target) return;
    setDirection(position > currentPosition ? 1 : -1); setActiveId(target.item.id);
    if (!editable && scroll && root.current && root.current.clientWidth < 700) panel.current?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  return <div className="iv-focus-viewport-section iv-container" ref={root}><div className="iv-focus-heading-row"><div>{b.text("heading", "h2", "iv-heading")}{b.c.subheading && b.text("subheading", "p", "iv-subheading")}</div><div>{b.text("text", "p", "iv-body-copy")}<label className="iv-focus-search" htmlFor={id}><Search size={20} /><input id={id} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ihr Anliegen oder Stichwort" type="search" aria-label="Rechtsgebiete nach Stichwort durchsuchen" />{query && <button type="button" aria-label="Suche löschen" onClick={() => setQuery("")}><X size={17} /></button>}</label></div></div>
    <div className="iv-focus-stage"><div className="iv-focus-topics" ref={buttons} aria-label="Rechtsgebiet auswählen">{items.map(({ item, index }, position) => <EditableChoice editable={editable} key={item.id} data-item-id={item.id} type="button" aria-expanded={current?.item.id === item.id} aria-controls={`${id}-viewport`} className={current?.item.id === item.id ? "is-active" : ""} onChoose={() => choose(position, true)} onKeyDown={(event) => {
      if ((event.target as HTMLElement).closest("[contenteditable]")) return;
      if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault(); const next = (position + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + items.length) % items.length;
      choose(next); buttons.current?.querySelectorAll<HTMLButtonElement>(":scope > button")[next]?.focus();
    }}><span className="iv-focus-topic-symbol" aria-hidden="true"><ArrowUpRight size={34} strokeWidth={1.15} /></span>{b.itemText(item, index, "title", "span")}</EditableChoice>)}{!items.length && <div className="iv-focus-empty"><Search size={35} /><h3>Kein passendes Rechtsgebiet gefunden.</h3><p>Schildern Sie uns Ihr Anliegen. Wir besprechen mit Ihnen, ob wir Sie dazu beraten können.</p><ContentLink href="/kontakt" editable={editable}>Kontakt aufnehmen<ArrowUpRight size={20} /></ContentLink><button type="button" onClick={() => setQuery("")}>Suche zurücksetzen</button></div>}</div>
      <article id={`${id}-viewport`} className="iv-focus-viewport" ref={panel} aria-live={editable ? "off" : "polite"}>
        {current && <div key={current.item.id} data-item-id={current.item.id} className={`iv-focus-scene iv-focus-direction-${direction > 0 ? "next" : "previous"}`}>
          {visual && <EditableImage image={visual} editable={editable} className="iv-focus-scene-photo" onChange={(next) => current.item.image ? b.updateItem(current.index, "image", next) : b.update("image", next)} />}
          <div className="iv-focus-scene-content"><div className="iv-focus-scene-heading">{b.itemText(current.item, current.index, "title", "h3")}<ContentIcon name={current.item.icon} size={54} editable={editable} itemId={current.item.id} sectionId={section.id} /></div>{b.itemText(current.item, current.index, "text", "p")}{current.item.details?.length ? <ul className="iv-focus-scene-details">{current.item.details.map((detail, i) => <li key={i}><Check size={15} /><EditableText as="span" value={detail} editable={editable} onChange={(next) => b.updateItem(current.index, "details", current.item.details!.map((entry, index) => index === i ? next : entry))} /></li>)}</ul> : null}<div className="iv-focus-scene-actions">{current.item.href && <ContentLink href={current.item.href} editable={editable} className="iv-button">{current.item.label || "Zum Rechtsgebiet"}<ArrowUpRight size={20} /></ContentLink>}<ContentLink href={`/kontakt?thema=${encodeURIComponent(current.item.title)}`} editable={editable} className="iv-underline-link">Anfrage stellen<ArrowUpRight size={18} /></ContentLink></div></div>
        </div>}
        {items.length > 1 && <div className="iv-focus-scene-controls"><span aria-live="polite">{currentPosition + 1} / {items.length}</span><button type="button" aria-label="Vorheriges Rechtsgebiet" onClick={() => choose(currentPosition - 1)}><ArrowLeft size={22} /></button><button type="button" aria-label="Nächstes Rechtsgebiet" onClick={() => choose(currentPosition + 1)}><ArrowRight size={22} /></button></div>}
      </article>
    </div>{b.actions("iv-focus-all-actions")}
  </div>;
}

export function CinematicContactDock({ site, editable }: Pick<VariantSectionProps, "site" | "editable">) {
  const contact = site.navigation.find((item) => /kontakt/.test(item.href));
  return <nav className="iv-live-contact-dock" aria-label="Schneller Kontakt">{contact && <ContentLink href={contact.href} editable={editable}>{contact.label}<ArrowUpRight size={18} /></ContentLink>}<ContentLink href={`tel:${site.phone.replace(/[^+\d]/g, "")}`} editable={editable} label={`${site.phone} anrufen`}><span>{site.phone}</span><Phone size={17} /></ContentLink></nav>;
}
