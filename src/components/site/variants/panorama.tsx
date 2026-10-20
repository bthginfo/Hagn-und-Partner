"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowDownRight, ArrowUpRight, Check, MapPin } from "lucide-react";
import type { ContentItem, ImageValue, SectionContent } from "@/lib/types";
import { EditableChoice, ContentLink, EditableImage, EditableText } from "../editable";
import type { VariantSectionProps } from "./types";
import { ContentIcon } from "../content-icon";
import { useSectionHeadingLevel } from "../heading-level";
import { textWithBreaks } from "../text-wrap";

function usePanoramaBindings({ section, onChange, editable }: VariantSectionProps) {
  const content = section.content;
  const headingLevel = useSectionHeadingLevel(section.id);
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...content, [key]: value } });
  const updateItem = <K extends keyof ContentItem>(index: number, key: K, value: ContentItem[K]) => update("items", (content.items ?? []).map((item, i) => i === index ? { ...item, [key]: value } : item));
  const text = (key: "heading" | "text" | "subheading" | "caption", as: "h1" | "h2" | "h3" | "p" | "span" = "p", className = "") => <EditableText as={key === "heading" ? headingLevel : as} value={content[key]} editable={editable} className={className} onChange={(value) => update(key, value)} />;
  const itemText = (item: ContentItem, index: number, key: "title" | "text", as: "h3" | "p" | "span" = "p", className = "") => <EditableText as={as} value={item[key]} editable={editable} className={className} onChange={(value) => updateItem(index, key, value)} />;
  const actions = () => <div className="hp-panorama-actions">{(content.primaryLabel || editable) && <ContentLink href={content.primaryHref} editable={editable} className="hp-panorama-appointment"><EditableText as="span" value={content.primaryLabel} editable={editable} onChange={(value) => update("primaryLabel", value)} /><ArrowUpRight size={24} /></ContentLink>}{content.secondaryLabel && <ContentLink href={content.secondaryHref} editable={editable} className="hp-panorama-secondary"><EditableText as="span" value={content.secondaryLabel} editable={editable} onChange={(value) => update("secondaryLabel", value)} /><ArrowUpRight size={17} /></ContentLink>}</div>;
  return { content, update, updateItem, text, itemText, actions };
}

export function PanoramaHero(props: VariantSectionProps) {
  const { section, editable, site, portraits = [] } = props;
  const b = usePanoramaBindings(props);
  const ownPortraits = (b.content.items ?? []).filter((item) => item.image);
  const portrait = b.content.items === undefined ? portraits.find((item) => item.image) : ownPortraits[0];
  return <div className={`hp-panorama-hero${portrait ? " hp-panorama-has-person" : ""}`}>
    <div className="hp-panorama-frame" id={`${section.id}-fotografie`}><EditableImage image={b.content.image} editable={editable} onChange={(image) => b.update("image", image)} priority className="hp-panorama-image" /><div className="hp-panorama-image-shade" aria-hidden="true" /></div>
    <div className="hp-panorama-title">{b.text("heading", "h1", "hp-panorama-heading")}<span className="hp-panorama-heading hp-panorama-heading-cut" aria-hidden="true">{editable ? b.content.heading : textWithBreaks(b.content.heading)}</span></div>
    {b.content.primaryLabel && <ContentLink href={b.content.primaryHref} editable={editable} className="hp-panorama-mobile-appointment"><EditableText as="span" value={b.content.primaryLabel} editable={editable} onChange={value => b.update("primaryLabel", value)} /><ArrowUpRight size={21} /></ContentLink>}
    <div className="hp-panorama-side-note"><MapPin size={15} /><span>{site.city}</span>{b.content.caption && b.text("caption", "span")}</div>
    <div className="hp-panorama-intro">{b.content.subheading && b.text("subheading", "p", "hp-panorama-subheading")}{b.text("text", "p", "hp-panorama-copy")}{b.actions()}</div>
    {portrait?.image && <div className="hp-panorama-person" data-item-id={portrait.id}><EditableImage image={portrait.image} editable={editable} className="hp-panorama-person-photo" onChange={(image) => {
      const index = (b.content.items ?? []).findIndex((item) => item.id === portrait.id);
      if (index >= 0) b.updateItem(index, "image", image);
      else b.update("items", [{ ...portrait, image }]);
    }} /><ContentLink href={portrait.href || "/anwaelte"} editable={editable} className="hp-panorama-person-label"><EditableText as="span" value={portrait.title} editable={editable} onChange={(title) => {
      const index = (b.content.items ?? []).findIndex((item) => item.id === portrait.id);
      if (index >= 0) b.updateItem(index, "title", title); else b.update("items", [{ ...portrait, title }]);
    }} /><ArrowUpRight size={22} /></ContentLink></div>}
    <a className="hp-panorama-down" href={`#${section.id}-fotografie`} aria-label="Weiter zum Bild"><ArrowDown size={25} /></a>
  </div>;
}

export function PanoramaServices(props: VariantSectionProps & { sceneImage?: ImageValue }) {
  const { editable, sceneImage, section } = props;
  const b = usePanoramaBindings(props);
  const items = b.content.items ?? [];
  const [active, setActive] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const choose = (index: number, scroll = false) => {
    setActive(index);
    const siteWidth = scene.current?.closest<HTMLElement>(".hp-site")?.clientWidth ?? window.innerWidth;
    if (!scroll || editable || siteWidth > 700) return;
    requestAnimationFrame(() => scene.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
  };
  const currentIndex = Math.min(active, Math.max(0, items.length - 1));
  const current = items[currentIndex];
  const image = current?.image ?? b.content.image ?? sceneImage;
  return <div className="hp-panorama-services"><div className="hp-panorama-services-top">{b.text("heading", "h2", "hp-section-heading")}<div>{b.text("text", "p", "hp-section-text")}{b.actions()}</div></div>
    <div className="hp-panorama-service-stage"><div className="hp-panorama-service-directory" ref={list}>{items.map((item, index) => <EditableChoice editable={editable} key={item.id} data-item-id={item.id} type="button" aria-expanded={currentIndex === index} aria-controls={`${section.id}-leistung`} className={currentIndex === index ? "is-active" : ""} onChoose={() => choose(index, true)} onKeyDown={(event) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
      event.preventDefault(); const next = (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      setActive(next); list.current?.querySelectorAll("button")[next]?.focus();
    }}>{b.itemText(item, index, "title", "span")}<ArrowUpRight size={25} /></EditableChoice>)}</div>
      <div className="hp-panorama-service-scene" ref={scene} id={`${section.id}-leistung`} aria-live={editable ? "off" : "polite"}>{image && <EditableImage image={image} editable={editable} className="hp-panorama-service-photo" onChange={(next) => current?.image ? b.updateItem(currentIndex, "image", next) : b.update("image", next)} />}
        {current && <div className="hp-panorama-service-sheet" data-item-id={current.id}><span className="hp-panorama-service-mark"><ContentIcon name={current.icon} size={32} editable={editable} itemId={current.id} sectionId={section.id} /></span>{b.itemText(current, currentIndex, "title", "h3")}{b.itemText(current, currentIndex, "text", "p")}{current.details?.length ? <ul>{current.details.map((detail, index) => <li key={index}><Check size={15} /><EditableText as="span" editable={editable} value={detail} onChange={(next) => b.updateItem(currentIndex, "details", current.details!.map((entry, i) => i === index ? next : entry))} /></li>)}</ul> : null}{current.href && <ContentLink href={current.href} editable={editable} className="hp-panorama-service-link">{current.label || "Mehr erfahren"}<ArrowUpRight size={19} /></ContentLink>}</div>}
      </div>
    </div>
  </div>;
}
