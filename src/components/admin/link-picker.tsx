"use client";

import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check, ChevronDown, FileText, Globe, Hash, Link2, Mail, Phone, Unlink } from "lucide-react";
import type { ImageValue, Section, WebsiteContent } from "@/lib/types";
import { defaultBlog } from "@/lib/site-config";
import { Button, Field, Input, Modal, Notice, SearchField, Select } from "./admin-ui";

type LinkPage = { id: string; title: string; href: string; sections: Section[]; image?: ImageValue; warning?: string; blog?: boolean };
type LinkSources = { pages: LinkPage[]; email: string; phone: string };
type LinkKind = "page" | "section" | "address" | "email" | "phone" | "none";
const SourcesContext = createContext<LinkSources>({ pages: [], email: "", phone: "" });
const CurrentPageContext = createContext<string | undefined>(undefined);
const pageHref = (slug: string) => `/${slug.replace(/^\/+|\/+$/g, "")}`;
const anchorFor = (section: Section) => section.anchor || section.id;
const sectionLabel = (section: Section) => section.content.heading.replace(/\u00ad/g, "").trim() || section.name;

/** Every editor uses the same already-loaded draft; choosing a link never fetches. */
export function AdminLinkProvider({ content, children }: { content: WebsiteContent; children: ReactNode }) {
  const sources = useMemo<LinkSources>(() => {
    const pages: LinkPage[] = content.pages.map(page => ({ id: page.id, title: page.title, href: pageHref(page.slug), sections: page.sections, image: page.sections.find(section => section.content.image)?.content.image }));
    const blog = content.config.blog || defaultBlog;
    const blogWarning = blog.enabled ? undefined : "Der Blog ist zurzeit ausgeblendet. Dieser Link wird erreichbar, sobald Sie den Blog freigeben.";
    if (blog.slug) pages.push({ id: "blog-index", title: blog.title || "Beitragsübersicht", href: pageHref(blog.slug), sections: [], blog: true, warning: blogWarning });
    for (const post of content.posts || []) {
      if (!post.slug.trim()) continue;
      pages.push({ id: `post-${post.id}`, title: post.title || "Beitrag ohne Titel", href: pageHref(`${blog.slug}/${post.slug}`), sections: post.sections, image: post.cover, blog: true, warning: post.status !== "published" ? "Dieser Beitrag ist ein Entwurf. Veröffentlichen Sie ihn, bevor Sie den Link auf der Website verwenden." : blogWarning });
    }
    return { pages, email: content.config.email, phone: content.config.phone };
  }, [content]);
  return <SourcesContext.Provider value={sources}>{children}</SourcesContext.Provider>;
}

export function CurrentLinkPageProvider({ pageId, children }: { pageId?: string; children: ReactNode }) {
  return <CurrentPageContext.Provider value={pageId}>{children}</CurrentPageContext.Provider>;
}

function findTarget(value: string, pages: LinkPage[], currentPageId?: string) {
  const hash = value.indexOf("#");
  const path = hash < 0 ? value : value.slice(0, hash);
  const anchor = hash < 0 ? "" : value.slice(hash + 1);
  const page = path ? pages.find(page => page.href.replace(/\/$/, "") === path.replace(/\/$/, "")) : pages.find(page => page.id === currentPageId) || pages.find(page => page.sections.some(section => anchorFor(section) === anchor));
  const section = page?.sections.find(section => anchorFor(section) === anchor);
  return { page, section, anchor };
}

function describeLink(value: string, sources: LinkSources, currentPageId?: string) {
  if (!value || value === "#") return { title: "Linkziel auswählen", detail: "Seite, Abschnitt oder andere Adresse", icon: Link2 };
  const target = findTarget(value, sources.pages, currentPageId);
  if (target.page) return { title: target.anchor ? target.section ? sectionLabel(target.section) : target.anchor : target.page.title, detail: target.anchor ? `Abschnitt auf „${target.page.title}“` : target.page.blog ? "Blogseite" : "Seite Ihrer Website", icon: target.anchor ? Hash : FileText };
  if (value.startsWith("mailto:")) return { title: value.slice(7), detail: "E-Mail schreiben", icon: Mail };
  if (value.startsWith("tel:")) return { title: value.slice(4), detail: "Anrufen", icon: Phone };
  if (value.startsWith("#")) return { title: value.slice(1), detail: "Abschnitt auf dieser Seite", icon: Hash };
  return { title: value, detail: "Andere Adresse", icon: Globe };
}

function normalizeAddress(value: string) {
  const trimmed = value.trim();
  return /^[\w-]+(?:\.[\w-]+)+(?:[/:?#]|$)/i.test(trimmed) ? `https://${trimmed}` : trimmed;
}
function validAddress(value: string) {
  if (/^\/(?!\/)/.test(value)) return !/[\s<>]/.test(value);
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && Boolean(url.hostname); } catch { return false; }
}
function mailAddress(value: string) { const address = value.startsWith("mailto:") ? value.slice(7).split("?")[0] : ""; try { return decodeURIComponent(address); } catch { return address; } }

export function LinkPicker({ value = "", onChange, label = "Linkziel", disabled = false, allowEmpty = true }: { value?: string; onChange: (value: string) => void; label?: string; disabled?: boolean; allowEmpty?: boolean }) {
  const sources = useContext(SourcesContext); const pageId = useContext(CurrentPageContext);
  const [open, setOpen] = useState(false); const description = describeLink(value, sources, pageId); const Icon = description.icon;
  return <div className="cms-link-picker"><button type="button" className="cms-link-picker-trigger" disabled={disabled} title={`${label} auswählen`} aria-haspopup="dialog" onClick={() => setOpen(true)}><Icon size={18} aria-hidden="true" /><span><strong>{description.title}</strong>{" "}<small>{description.detail}</small></span><ChevronDown size={16} aria-hidden="true" /></button>{open && <LinkTargetDialog value={value} sources={sources} currentPageId={pageId} allowEmpty={allowEmpty} onClose={() => setOpen(false)} onSelect={href => { onChange(href); setOpen(false); }} />}</div>;
}

function LinkTargetDialog({ value, sources, currentPageId, allowEmpty, onClose, onSelect }: { value: string; sources: LinkSources; currentPageId?: string; allowEmpty: boolean; onClose: () => void; onSelect: (value: string) => void }) {
  const initial = findTarget(value, sources.pages, currentPageId);
  const initialKind: LinkKind = !value || value === "#" ? "page" : initial.page || value.startsWith("#") ? value.includes("#") ? "section" : "page" : value.startsWith("mailto:") ? "email" : value.startsWith("tel:") ? "phone" : "address";
  const [kind, setKind] = useState<LinkKind>(initialKind);
  const [selectedPageId, setSelectedPageId] = useState(initial.page?.id || currentPageId || "");
  const [anchor, setAnchor] = useState(initial.anchor);
  const [search, setSearch] = useState("");
  const [address, setAddress] = useState(initialKind === "address" ? value : "");
  const [email, setEmail] = useState(value.startsWith("mailto:") ? mailAddress(value) : sources.email);
  const [phone, setPhone] = useState(value.startsWith("tel:") ? value.slice(4) : sources.phone);
  const [error, setError] = useState(""); const id = useId();
  const pageList = useRef<HTMLDivElement>(null);
  const selectedPage = sources.pages.find(page => page.id === selectedPageId);
  const sections = selectedPage?.sections.filter(section => section.visible) || [];
  const query = search.toLocaleLowerCase("de").trim();
  const pages = sources.pages.filter(page => `${page.title} ${page.href}`.toLocaleLowerCase("de").includes(query));
  const selectedSection = sections.find(section => anchorFor(section) === anchor);
  useEffect(() => {
    if (kind !== "page" || query) return;
    const list = pageList.current; const selected = list?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (list && selected) list.scrollTop += selected.getBoundingClientRect().top - list.getBoundingClientRect().top - (list.clientHeight - selected.offsetHeight) / 2;
  }, [kind, selectedPageId, query]);
  const unchangedSection = initial.page?.id === selectedPageId && initial.anchor === anchor;
  const mailSuffix = value.startsWith("mailto:") && value.includes("?") ? value.slice(value.indexOf("?")) : "";
  const target = kind === "page" ? selectedPage?.href || "" : kind === "section" ? selectedPage && selectedSection ? unchangedSection && value.includes("#") ? value : `${selectedPage.href}#${anchorFor(selectedSection)}` : "" : kind === "address" ? normalizeAddress(address) : kind === "email" ? value.startsWith("mailto:") && email.trim() === mailAddress(value) ? value : `mailto:${email.trim()}${mailSuffix}` : kind === "phone" ? value.startsWith("tel:") && phone === value.slice(4) ? value : `tel:${phone.replace(/[^+\d]/g, "")}` : "";
  const valid = kind === "none" || (kind === "page" || kind === "section") && Boolean(target) || kind === "address" && validAddress(target) || kind === "email" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || kind === "phone" && phone.replace(/\D/g, "").length >= 3;
  function changeKind(next: LinkKind) { setKind(next); setSearch(""); setError(""); }
  const modes = [{ value: "page", label: "Seite", icon: FileText }, { value: "section", label: "Abschnitt", icon: Hash }, { value: "address", label: "Adresse", icon: Globe }, { value: "email", label: "E-Mail", icon: Mail }, { value: "phone", label: "Telefon", icon: Phone }, { value: "none", label: "Kein Link", icon: Unlink }] as const;

  return <Modal title="Linkziel auswählen" description="Wählen Sie eine Seite oder einen Abschnitt Ihrer Website. Eine andere Adresse können Sie selbst eingeben." onClose={onClose} footer={<><Button onClick={onClose}>Abbrechen</Button><Button variant="primary" disabled={!valid} onClick={() => { if (valid) onSelect(target); else setError("Wählen Sie ein Ziel aus oder prüfen Sie die eingegebene Adresse."); }}><Check size={16} />{kind === "none" ? "Link entfernen" : "Link übernehmen"}</Button></>}>
    <div className="cms-link-target-modes" role="group" aria-label="Art des Linkziels">{modes.filter(mode => allowEmpty || mode.value !== "none").map(mode => <button type="button" key={mode.value} aria-pressed={kind === mode.value} onClick={() => changeKind(mode.value)}><mode.icon size={17} aria-hidden="true" />{mode.label}</button>)}</div>
    <div className="cms-link-target-content">
      {kind === "page" && <><SearchField value={search} onChange={setSearch} placeholder="Seite oder Beitrag suchen …" label="Linkziele durchsuchen" /><div ref={pageList} className="cms-link-target-pages" role="group" aria-label="Seite auswählen">{pages.map(page => <button type="button" key={page.id} aria-pressed={selectedPageId === page.id} onClick={() => { setSelectedPageId(page.id); setAnchor(""); setError(""); }}><span className="cms-link-page-image">{page.image ? <img src={page.image.src} alt="" style={{ objectPosition: page.image.position }} /> : <FileText size={22} aria-hidden="true" />}</span><span><strong>{page.title}</strong><small>{page.href}{page.warning ? " · noch nicht öffentlich erreichbar" : ""}</small></span>{selectedPageId === page.id ? <Check size={18} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}</button>)}</div>{!pages.length && <p className="cms-link-empty">Keine passende Seite gefunden. Versuchen Sie einen anderen Suchbegriff.</p>}{selectedPage && sections.length > 0 && <Button className="cms-link-choose-section" onClick={() => changeKind("section")}><Hash size={16} />Optional: Abschnitt auf dieser Seite wählen</Button>}</>}
      {kind === "section" && <><Field label="Seite mit dem gewünschten Abschnitt"><Select value={selectedPageId} onChange={event => { setSelectedPageId(event.target.value); setAnchor(""); }}><option value="">Seite auswählen …</option>{sources.pages.map(page => <option key={page.id} value={page.id}>{page.title}</option>)}</Select></Field>{selectedPage && <div className="cms-link-target-sections" role="group" aria-label="Abschnitt auswählen">{sections.map((section, index) => <button type="button" key={section.id} aria-pressed={anchor === anchorFor(section)} onClick={() => setAnchor(anchorFor(section))}><span className="cms-link-section-number">{index + 1}</span><span><strong>{sectionLabel(section)}</strong><small>{section.name}</small></span>{anchor === anchorFor(section) ? <Check size={18} aria-hidden="true" /> : <Hash size={17} aria-hidden="true" />}</button>)}{!sections.length && <p className="cms-link-empty">Diese Seite enthält noch keine sichtbaren Abschnitte. Sie können die ganze Seite verlinken.</p>}</div>}</>}
      {kind === "address" && <Field label="Internet- oder Dateiadresse" hint="Zum Beispiel https://www.beispiel.de oder /downloads/formular.pdf."><Input type="text" inputMode="url" autoComplete="url" placeholder="https://…" value={address} onChange={event => { setAddress(event.target.value); setError(""); }} /></Field>}
      {kind === "email" && <Field label="E-Mail-Adresse" hint="Beim Anklicken öffnet sich das E-Mail-Programm."><Input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /></Field>}
      {kind === "phone" && <Field label="Telefonnummer" hint="Beim Anklicken kann die Nummer angerufen werden."><Input type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} /></Field>}
      {kind === "none" && <div className="cms-link-none"><Unlink size={28} aria-hidden="true" /><p>Dieser Inhalt erhält kein Linkziel. Seine Beschriftung und übrigen Angaben bleiben erhalten.</p></div>}
      {(kind === "page" || kind === "section") && selectedPage?.warning && <Notice>{selectedPage.warning}</Notice>}
      {target && <div className="cms-link-target-preview" aria-live="polite" aria-atomic="true"><span id={`${id}-preview`}>Gewähltes Ziel</span><strong>{target}</strong></div>}
      {error && <Notice tone="error">{error}</Notice>}
    </div>
  </Modal>;
}
