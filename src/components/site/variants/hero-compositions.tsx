"use client";

import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ContentItem, SectionContent } from "@/lib/types";
import { ContentLink, EditableImage, EditableText } from "../editable";
import { useSectionHeadingLevel } from "../heading-level";
import type { VariantSectionProps } from "./types";

type HeroLayout = "panorama" | "split" | "portrait" | "compact" | "bento";

/** Five content arrangements, typeset and composed separately by each design. */
export function HeroComposition({ world, layout, ...props }: VariantSectionProps & { world: 1 | 2 | 3; layout: HeroLayout }) {
  const { section, editable, onChange, portraits = [] } = props;
  const { content: c, design: d } = section;
  const Heading = useSectionHeadingLevel(section.id);
  const update = <K extends keyof SectionContent>(key: K, value: SectionContent[K]) => onChange?.({ ...section, content: { ...c, [key]: value } });
  const text = (key: "heading" | "subheading" | "text" | "caption", className = "") => <EditableText as={key === "heading" ? Heading : "p"} value={c[key]} editable={editable} className={className} onChange={value => update(key, value)} />;
  const actions = () => <div className="hc-actions">{(c.primaryLabel || editable) && <ContentLink href={c.primaryHref} editable={editable} className="hc-primary"><EditableText as="span" value={c.primaryLabel} editable={editable} onChange={value => update("primaryLabel", value)} /><ArrowUpRight size={22} /></ContentLink>}{c.secondaryLabel && <ContentLink href={c.secondaryHref} editable={editable} className="hc-secondary"><EditableText as="span" value={c.secondaryLabel} editable={editable} onChange={value => update("secondaryLabel", value)} /><ArrowUpRight size={18} /></ContentLink>}</div>;
  const title = () => <header className="hc-title">{text("heading", "hc-heading")}{(c.subheading || editable) && text("subheading", "hc-subheading")}</header>;
  const notes = () => <div className="hc-notes">{text("text", "hc-copy")}{actions()}{c.caption && text("caption", "hc-caption")}</div>;
  const picture = () => <div className="hc-image"><EditableImage image={c.image} editable={editable} onChange={image => update("image", image)} priority={Heading === "h1"} className="hc-main-photo" /></div>;
  const people = (c.items === undefined ? portraits : c.items).filter(item => item.image || editable).slice(0, 2);
  const changePerson = <K extends "image" | "title">(person: ContentItem, key: K, value: ContentItem[K]) => {
    const entries = c.items === undefined ? people.map(item => ({ ...item })) : c.items;
    update("items", entries.map(item => item.id === person.id ? { ...item, [key]: value } : item));
  };
  const peopleStrip = () => people.length ? <div className="hc-people" data-count={people.length}>{people.map(person => <article className="hc-person" key={person.id} data-item-id={person.id}><EditableImage image={person.image} editable={editable} className="hc-person-photo" onChange={image => changePerson(person, "image", image)} /><div className="hc-person-caption">{person.href ? <ContentLink href={person.href} editable={editable}><EditableText as="span" value={person.title} editable={editable} onChange={value => changePerson(person, "title", value)} /><ArrowUpRight size={17} /></ContentLink> : <EditableText as="p" value={person.title} editable={editable} onChange={value => changePerson(person, "title", value)} />}</div></article>)}</div> : null;
  const vars = world === 1 ? { bg: "var(--section-bg)", fg: "var(--section-fg)", accent: "var(--section-accent)", font: "var(--section-heading-font)", scale: "var(--section-scale)", radius: "var(--section-radius)", ink: "var(--hp-ink)", photoText: "var(--hp-paper)" } : world === 2 ? { bg: "var(--ed-section-bg)", fg: "var(--ed-section-fg)", accent: "var(--ed-yellow)", font: "var(--ed-heading)", scale: "var(--ed-scale)", radius: "var(--ed-radius)", ink: "var(--ed-blue)", photoText: "var(--ed-white)" } : { bg: "var(--iv-section-bg)", fg: "var(--iv-section-fg)", accent: "var(--iv-section-accent)", font: "var(--iv-heading-font)", scale: "var(--iv-scale)", radius: "var(--iv-radius)", ink: "var(--hp-palette-primary,#1d1c58)", photoText: "var(--hp-palette-background,#fff9ff)" };
  const style = { "--hc-bg": vars.bg, "--hc-fg": vars.fg, "--hc-accent": vars.accent, "--hc-font": vars.font, "--hc-scale": vars.scale, "--hc-radius": vars.radius, "--hc-ink": vars.ink, "--hc-photo-text": d.textColor || vars.photoText } as CSSProperties;
  return <div className={`hc-hero hc-world-${world} hc-${layout} hc-image-${d.imageSide}${c.image?.src || editable ? " hc-has-photo" : ""}${people.length ? " hc-has-people" : ""}`} style={style} data-hero-layout={layout}>
    {layout === "panorama" ? <>{picture()}<div className="hc-shade" aria-hidden="true" />{title()}{notes()}</> : layout === "bento" ? <><div className="hc-bento-copy">{title()}{notes()}</div><div className="hc-bento-art">{picture()}{peopleStrip()}</div></> : <>{title()}{picture()}{notes()}</>}
  </div>;
}
