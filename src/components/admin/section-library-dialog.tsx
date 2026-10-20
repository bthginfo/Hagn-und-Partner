"use client";

import { useState } from "react";
import { sectionLibrary } from "@/lib/section-library";
import type { SectionType } from "@/lib/types";
import { EmptyState, Modal, Plus, SearchField } from "./admin-ui";

const previewGroups: Record<string, string> = { "editorial-hero": "hero", "cinematic-hero": "hero", "noir-hero": "hero", "portrait-mosaic": "team", "portrait-rail": "team", "people-index": "team", "service-explorer": "services", "focus-finder": "services", "case-deck": "services", "editorial-statement": "statement", "kinetic-statement": "statement", "noir-manifesto": "statement", "contact-poster": "cta", "contact-dock": "cta", "noir-contact": "cta", "editorial-gallery": "gallery", "image-curtain": "split", "stacked-panels": "steps", "blog-cards": "cards", "blog-editorial": "split", "blog-list": "list" };
export function SectionPreview({ type, mini = false }: { type: string; mini?: boolean }) { return <span aria-hidden="true" className={`cms-section-diagram cms-section-diagram--${previewGroups[type] || type}${mini ? " cms-section-diagram--mini" : ""}`}><i /><i /><i /><i /><i /><i /></span>; }

export function SectionLibraryDialog({ onSelect, onClose, title = "Abschnitt hinzufügen" }: { onSelect: (type: SectionType) => void; onClose: () => void; title?: string }) {
  const [search, setSearch] = useState(""); const [category, setCategory] = useState("Alle"); const categories = ["Alle", ...Array.from(new Set(sectionLibrary.map(item => item.category)))]; const filtered = sectionLibrary.filter(item => (category === "Alle" || item.category === category) && `${item.name} ${item.description} ${item.category}`.toLocaleLowerCase("de").includes(search.toLocaleLowerCase("de")));
  return <Modal title={title} description={`${sectionLibrary.length} Bausteine für Ihre Inhalte. Wählen Sie einen passenden Abschnitt und bearbeiten Sie ihn direkt auf der Seite.`} onClose={onClose} wide drawer><SearchField value={search} onChange={setSearch} placeholder="Zum Beispiel Bild, Ansprechpartner oder Fragen …" /><div className="cms-library-filters" role="group" aria-label="Abschnittskategorie">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>{!filtered.length ? <EmptyState title="Kein passender Abschnitt">Versuchen Sie einen anderen Begriff oder wählen Sie „Alle“.</EmptyState> : <div className="cms-library-grid">{filtered.map(item => <button type="button" className="cms-library-item" key={item.type} onClick={() => onSelect(item.type)}><SectionPreview type={item.type} /><span className="cms-library-item-heading"><strong>{item.name}</strong><Plus size={17} /></span><span>{item.description}</span></button>)}</div>}</Modal>;
}
