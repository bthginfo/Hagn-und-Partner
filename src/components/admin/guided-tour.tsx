"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { sectionLibrary } from "@/lib/section-library";
import type { AdminView } from "./admin-app";

type EditorArea = "preview" | "outline" | "properties";
type SettingsArea = "design" | "navigation" | "email";
type TourStep = {
  view: AdminView;
  area: string;
  title: string;
  text: string;
  hint: string;
  selectors: string[];
  editor?: EditorArea;
  settings?: SettingsArea;
};
type Rect = { left: number; top: number; width: number; height: number };
type Viewport = { width: number; height: number };

export const guidedTourStorageKey = "hp-admin-guided-tour-v2";
export function browserTourComplete() { try { return window.localStorage.getItem(guidedTourStorageKey) === "complete"; } catch { return false; } }
export function markBrowserTourComplete() { try { window.localStorage.setItem(guidedTourStorageKey, "complete"); } catch { /* The tour remains closed for this visit when storage is unavailable. */ } }

const steps: TourStep[] = [
  {
    view: "dashboard", area: "Übersicht", title: "Ihre Website selbst pflegen.",
    text: "Hier sehen Sie den Stand Ihrer Website und neue Kontaktanfragen. In dieser Einführung lernen Sie die wichtigsten Bereiche kennen.",
    hint: "Die Einführung verändert keine Inhalte. Sie können sie jederzeit beenden.",
    selectors: [".cms-dashboard-publication", ".cms-dashboard-main", ".cms-dashboard"],
  },
  {
    view: "editor", editor: "preview", area: "Seiten bearbeiten", title: "Texte direkt auf der Seite ändern.",
    text: "Wählen Sie oben eine Seite aus. Klicken Sie in der Vorschau auf einen Text und schreiben Sie Ihre Änderung direkt hinein.",
    hint: "Die Symbole für Bildschirm und Smartphone wechseln die Vorschaugröße.",
    selectors: [".cms-editor .cms-preview", ".cms-editor"],
  },
  {
    view: "editor", editor: "outline", area: "Seitenaufbau", title: "Seiten aus Abschnitten aufbauen.",
    text: `Links sehen Sie den Aufbau Ihrer Seite. Über „Abschnitt hinzufügen“ wählen Sie aus ${sectionLibrary.length} Bausteinen – etwa Karten, Bilder, Listen oder Galerien.`,
    hint: "Pfeile ändern die Reihenfolge. Das Auge blendet einen Abschnitt aus. Hier öffnen Sie auch die SEO- und Seiteneinstellungen.",
    selectors: [".cms-editor .cms-outline", ".cms-editor .cms-add-section"],
  },
  {
    view: "editor", editor: "properties", area: "Inhalt und Gestaltung", title: "Jeden Abschnitt passend gestalten.",
    text: "Rechts ändern Sie Bilder, Links und weitere Angaben. Unter „Gestaltung“ wählen Sie Farben, Schrift, Abstände und Formen für diesen Abschnitt.",
    hint: "Ein Klick auf ein Symbol in der Vorschau öffnet die durchsuchbare Symbolauswahl.",
    selectors: [".cms-editor .cms-inspector", ".cms-editor"],
  },
  {
    view: "editor", editor: "preview", area: "Speichern und veröffentlichen", title: "Erst speichern, dann veröffentlichen.",
    text: "„Entwurf speichern“ sichert Ihre Arbeit. Prüfen Sie die Vorschau für Bildschirm und Smartphone. „Veröffentlichen“ macht den gespeicherten Entwurf auf der Website sichtbar.",
    hint: "Mit „Rückgängig“ nehmen Sie eine Änderung in dieser Sitzung zurück. Gespeicherte Fassungen finden Sie unter „Versionen“.",
    selectors: [".cms-editor .cms-editor-actions", ".cms-editor .cms-editor-toolbar"],
  },
  {
    view: "media", area: "Medien", title: "Bilder an einem Ort verwalten.",
    text: "Hier laden Sie Bilder hoch und finden vorhandene Dateien. Eine Bildbeschreibung hilft Menschen, die sich Inhalte vorlesen lassen.",
    hint: "Mit dem Raster aus neun Punkten richten Sie den Bildausschnitt aus. Bei Porträts sollte das Gesicht gut sichtbar bleiben.",
    selectors: [".cms-media-page"],
  },
  {
    view: "blog", area: "Beiträge", title: "Beiträge in Ruhe vorbereiten.",
    text: "Legen Sie einen Beitrag mit Texten, Bildern und Abschnitten an. Jeder Beitrag wird einzeln veröffentlicht.",
    hint: "Der Blog bleibt ausgeblendet, bis Sie ihn in den Blog-Einstellungen freigeben. Dort wählen Sie auch die Darstellung der Übersicht.",
    selectors: [".cms-blog-feature-status", ".cms-blog-manager", ".cms-blog-workbench"],
  },
  {
    view: "inquiries", area: "Anfragen", title: "Kontaktanfragen im Blick behalten.",
    text: "Nachrichten aus dem Kontaktformular erscheinen hier. Öffnen Sie eine Anfrage, wählen Sie den Bearbeitungsstatus und ergänzen Sie bei Bedarf eine interne Notiz.",
    hint: "Die Nachrichten werden auch gespeichert, wenn der E-Mail-Versand noch nicht eingerichtet ist.",
    selectors: [".cms-inbox", ".cms-inquiries-page"],
  },
  {
    view: "settings", settings: "design", area: "Globale Gestaltung", title: "Farben für die ganze Website.",
    text: "Diese Farben und Grundeinstellungen gelten für den gewählten Website-Entwurf. Die Vorschau zeigt, wie Texte, Flächen und Schaltflächen zusammenwirken.",
    hint: "Einzelne Abschnitte können eigene Farben erhalten. Abschnitte ohne eigene Farben übernehmen die globalen Einstellungen.",
    selectors: [".cms-theme-editor"],
  },
  {
    view: "settings", settings: "navigation", area: "Navigation und Fußbereich", title: "Menü und Seitenende pflegen.",
    text: "Hier ändern Sie Bezeichnungen, Ziele und Reihenfolge Ihrer Menülinks. Über „Linkziel“ wählen Sie Seiten und Abschnitte aus einer Liste aus.",
    hint: "Darunter bearbeiten Sie die Texte und Linkspalten im Fußbereich sowie die Anzeige von Kontaktdaten und Bürozeiten.",
    selectors: [".cms-settings-main"],
  },
  {
    view: "settings", settings: "email", area: "Einstellungen", title: "E-Mail und weitere Einstellungen.",
    text: "Mit den Zugangsdaten Ihres E-Mail-Anbieters richten Sie Benachrichtigungen zu neuen Anfragen ein. Speichern Sie die Verbindung, bevor Sie eine Test-E-Mail senden.",
    hint: "Weitere Bereiche enthalten Kontaktdaten, Cookie-Hinweis, Statistikdienste und das Passwort für die Verwaltung.",
    selectors: [".cms-settings-main"],
  },
  {
    view: "help", area: "Hilfe", title: "Die Anleitungen bleiben hier.",
    text: "Suchen Sie nach einem Thema oder öffnen Sie eine der kurzen Anleitungen. Hier finden Sie auch die Übersicht aller Abschnitte.",
    hint: "Über „Einführung wiederholen“ starten Sie diesen Rundgang jederzeit von vorn.",
    selectors: [".cms-help-guides", ".cms-help-page"],
  },
];

function visibleElement(selectors: string[]) {
  for (const selector of selectors) {
    for (const element of document.querySelectorAll<HTMLElement>(selector)) {
      const rect = element.getBoundingClientRect();
      if (rect.width > 2 && rect.height > 2 && window.getComputedStyle(element).visibility !== "hidden") return element;
    }
  }
  return null;
}

/** Keep the opening inside both the viewport and any scrolling editor panes. */
function visibleRect(element: HTMLElement, viewport: Viewport): Rect | null {
  const measured = element.getBoundingClientRect();
  let left = Math.max(8, measured.left - 6);
  let top = Math.max(8, measured.top - 6);
  let right = Math.min(viewport.width - 8, measured.right + 6);
  let bottom = Math.min(viewport.height - 8, measured.bottom + 6);
  let ancestor = element.parentElement;
  while (ancestor && ancestor !== document.body) {
    const style = window.getComputedStyle(ancestor);
    const bounds = ancestor.getBoundingClientRect();
    if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { left = Math.max(left, bounds.left); right = Math.min(right, bounds.right); }
    if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) { top = Math.max(top, bounds.top); bottom = Math.min(bottom, bounds.bottom); }
    ancestor = ancestor.parentElement;
  }
  return right - left > 2 && bottom - top > 2 ? { left, top, width: right - left, height: bottom - top } : null;
}

function clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), Math.max(min, max)); }

function cardPosition(target: Rect | null, viewport: Viewport, card: { width: number; height: number }) {
  const margin = viewport.width < 600 ? 12 : 20;
  const gap = 18;
  const maxLeft = viewport.width - card.width - margin;
  const maxTop = viewport.height - card.height - margin;
  if (!target) return { left: clamp((viewport.width - card.width) / 2, margin, maxLeft), top: clamp((viewport.height - card.height) / 2, margin, maxTop) };
  const centerX = target.left + target.width / 2;
  const centerY = target.top + target.height / 2;
  const candidates = [
    { left: target.left + target.width + gap, top: centerY - card.height / 2 },
    { left: target.left - card.width - gap, top: centerY - card.height / 2 },
    { left: centerX - card.width / 2, top: target.top + target.height + gap },
    { left: centerX - card.width / 2, top: target.top - card.height - gap },
  ];
  return candidates.map(candidate => {
    const left = clamp(candidate.left, margin, maxLeft);
    const top = clamp(candidate.top, margin, maxTop);
    const overlapX = Math.max(0, Math.min(left + card.width, target.left + target.width) - Math.max(left, target.left));
    const overlapY = Math.max(0, Math.min(top + card.height, target.top + target.height) - Math.max(top, target.top));
    return { left, top, score: overlapX * overlapY * 100 + Math.abs(left - candidate.left) + Math.abs(top - candidate.top) };
  }).sort((a, b) => a.score - b.score)[0];
}

function sameRect(first: Rect | null, second: Rect | null) {
  return first === second || Boolean(first && second && Math.abs(first.left - second.left) < .5 && Math.abs(first.top - second.top) < .5 && Math.abs(first.width - second.width) < .5 && Math.abs(first.height - second.height) < .5);
}

function restoreFocus(opener: HTMLElement | null) {
  const target = opener?.isConnected && !opener.closest("[inert]") ? opener : document.querySelector<HTMLElement>("#cms-main h1, #cms-main h2, #cms-main");
  if (!target || target.closest("[inert]")) return;
  const previousTabIndex = target.getAttribute("tabindex");
  if (previousTabIndex === null) target.tabIndex = -1;
  target.focus({ preventScroll: true });
  if (previousTabIndex === null) target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
}

export function GuidedTour({ onNavigate, onClose }: { onNavigate: (view: AdminView) => void; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);
  const [viewport, setViewport] = useState<Viewport>({ width: 1024, height: 768 });
  const [cardSize, setCardSize] = useState({ width: 360, height: 340 });
  const cardRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const alive = useRef(false);
  const closing = useRef(false);
  const callbacks = useRef({ onNavigate, onClose });
  const id = useId().replace(/:/g, "");
  const step = steps[index];

  useEffect(() => { callbacks.current = { onNavigate, onClose }; }, [onNavigate, onClose]);
  const finishTour = useCallback(() => { if (!closing.current) { closing.current = true; callbacks.current.onClose(); } }, []);

  useEffect(() => {
    alive.current = true;
    openerRef.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    setMounted(true);
    return () => {
      alive.current = false;
      const app=document.querySelector<HTMLElement>(".cms-app");if(app){delete app.dataset.tourEditor;delete app.dataset.tourSettings;}
      requestAnimationFrame(() => requestAnimationFrame(() => { if (!alive.current) restoreFocus(openerRef.current); }));
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const focusFrame = requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finishTour(); return; }
      // The editor's global shortcuts must not save or undo content during an explanation.
      if ((event.ctrlKey || event.metaKey) && ["s", "z", "y"].includes(event.key.toLowerCase())) { event.preventDefault(); event.stopPropagation(); return; }
      if (event.key !== "Tab") return;
      const card = cardRef.current;
      if (!card) return;
      const focusable = Array.from(card.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], [tabindex='0']")).filter(element => element.getClientRects().length > 0);
      const first = focusable[0]; const last = focusable.at(-1);
      if (!first || !last) { event.preventDefault(); card.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement as HTMLElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !card.contains(document.activeElement) || document.activeElement === headingRef.current)) { event.preventDefault(); first.focus(); }
    }
    function keepFocus(event: FocusEvent) {
      if (event.target instanceof Node && !cardRef.current?.contains(event.target)) headingRef.current?.focus({ preventScroll: true });
    }
    function keepBackgroundStill(event: WheelEvent | TouchEvent) {
      if (event.target instanceof Node && !cardRef.current?.contains(event.target)) event.preventDefault();
    }
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", keepFocus, true);
    document.addEventListener("wheel", keepBackgroundStill, { passive: false, capture: true });
    document.addEventListener("touchmove", keepBackgroundStill, { passive: false, capture: true });
    return () => {
      cancelAnimationFrame(focusFrame); document.removeEventListener("keydown", keydown, true); document.removeEventListener("focusin", keepFocus, true);
      document.removeEventListener("wheel", keepBackgroundStill, true); document.removeEventListener("touchmove", keepBackgroundStill, true);
    };
  }, [mounted, index, finishTour]);

  useEffect(() => {
    if (!mounted) return;
    const current = steps[index];
    let frame = 0; let closed = false; let target: HTMLElement | null = null; let watchedRoot: Element | null = null;
    let scrolled: HTMLElement | null = null; let waitingFrames = 0; let initialDispatch = false;
    const started = performance.now();
    const resizeObserver = new ResizeObserver(schedule);
    setSpotlight(null); setMissing(false);
    callbacks.current.onNavigate(current.view);

    function selectArea() {
      const app=document.querySelector<HTMLElement>(".cms-app");
      if (current.editor) { if(app)app.dataset.tourEditor=current.editor; window.dispatchEvent(new CustomEvent<EditorArea>("hp:tour-editor", { detail: current.editor })); }
      if (current.settings) { if(app)app.dataset.tourSettings=current.settings; window.dispatchEvent(new CustomEvent<SettingsArea>("hp:tour-settings", { detail: current.settings })); }
    }
    function schedule() { if (!closed && !frame) frame = requestAnimationFrame(measure); }
    function measure() {
      frame = 0; if (closed) return;
      const nextViewport = { width: window.innerWidth, height: window.visualViewport?.height || window.innerHeight };
      setViewport(previous => previous.width === nextViewport.width && previous.height === nextViewport.height ? previous : nextViewport);
      const root = document.querySelector(current.view === "editor" ? ".cms-editor" : current.view === "settings" ? ".cms-settings-page" : `#cms-main`);
      if (!initialDispatch || root !== watchedRoot) { selectArea(); initialDispatch = true; watchedRoot = root; }
      const found = visibleElement(current.selectors);
      if (found !== target) { if (target) resizeObserver.unobserve(target); target = found; if (target) resizeObserver.observe(target); }
      if (target) {
        if (scrolled !== target) {
          scrolled = target;
          const bounds = target.getBoundingClientRect();
          if (bounds.top < 12 || bounds.left < 12 || bounds.bottom > nextViewport.height - 12 || bounds.right > nextViewport.width - 12) target.scrollIntoView({ block: bounds.height > nextViewport.height - 24 ? "start" : "nearest", inline: "nearest", behavior: "instant" });
        }
        const rect = visibleRect(target, nextViewport);
        setSpotlight(previous => sameRect(previous, rect) ? previous : rect);
        setMissing(!rect && performance.now() - started > 1800);
      } else {
        setSpotlight(previous => previous ? null : previous);
        setMissing(performance.now() - started > 1800);
      }
      const card = cardRef.current;
      if (card) {
        const bounds = card.getBoundingClientRect();
        setCardSize(previous => Math.abs(previous.width - bounds.width) < .5 && Math.abs(previous.height - bounds.height) < .5 ? previous : { width: bounds.width, height: bounds.height });
      }
      // React may mount the requested pane after the first animation frame.
      if ((!target || !visibleRect(target, nextViewport)) && waitingFrames++ < 120 && performance.now() - started < 2200) schedule();
    }
    const mutationObserver = new MutationObserver(schedule);
    const app = document.querySelector(".cms-app");
    if (app) mutationObserver.observe(app, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "aria-hidden"] });
    if (cardRef.current) resizeObserver.observe(cardRef.current);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    window.visualViewport?.addEventListener("resize", schedule);
    window.visualViewport?.addEventListener("scroll", schedule);
    schedule();
    return () => {
      closed = true; cancelAnimationFrame(frame); resizeObserver.disconnect(); mutationObserver.disconnect();
      window.removeEventListener("resize", schedule); window.removeEventListener("scroll", schedule, true);
      window.visualViewport?.removeEventListener("resize", schedule); window.visualViewport?.removeEventListener("scroll", schedule);
    };
  }, [mounted, index]);

  if (!mounted) return null;
  const position = cardPosition(spotlight, viewport, cardSize);
  const maskId = `cms-tour-mask-${id}`;
  const style = { left: position.left, top: position.top, "--cms-tour-max-height": `${Math.max(100, viewport.height - 24)}px` } as CSSProperties;

  return createPortal(<div className="cms-root cms-guided-tour" data-guided-tour="true">
    <svg className="cms-tour-shade" width="100%" height="100%" aria-hidden="true" focusable="false">
      <defs><mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><rect width="100%" height="100%" fill="white" />{spotlight && <rect x={spotlight.left} y={spotlight.top} width={spotlight.width} height={spotlight.height} rx="10" fill="black" />}</mask></defs>
      <rect width="100%" height="100%" fill="#10251f" fillOpacity=".68" mask={`url(#${maskId})`} />
    </svg>
    {spotlight && <div className="cms-tour-spotlight" aria-hidden="true" style={{ left: spotlight.left, top: spotlight.top, width: spotlight.width, height: spotlight.height }} />}
    <section ref={cardRef} className="cms-tour-card" style={style} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} tabIndex={-1}>
      <div className="cms-tour-topline"><span className="cms-tour-progress" aria-live="polite" aria-atomic="true">Schritt {index + 1} von {steps.length}</span><button type="button" className="cms-tour-skip" onClick={finishTour}>Überspringen<X size={15} aria-hidden="true" /></button></div>
      <div className="cms-tour-progress-track" aria-hidden="true"><span style={{ width: `${(index + 1) / steps.length * 100}%` }} /></div>
      <div className="cms-tour-copy" key={index}><p className="cms-tour-area">{step.area}</p><h2 id={`${id}-title`} ref={headingRef} tabIndex={-1}>{step.title}</h2><div id={`${id}-description`}><p>{step.text}</p><p className="cms-tour-hint">{step.hint}</p>{missing && <p className="cms-tour-missing">Dieser Bereich ist gerade nicht sichtbar. Mit „Weiter“ setzen Sie die Einführung fort.</p>}</div></div>
      <footer className="cms-tour-controls"><button type="button" className="cms-tour-back" disabled={index === 0} onClick={() => setIndex(previous => Math.max(0, previous - 1))}><ArrowLeft size={16} aria-hidden="true" />Zurück</button><button type="button" className="cms-tour-next" onClick={() => { if (index === steps.length - 1) finishTour(); else setIndex(previous => previous + 1); }}>{index === steps.length - 1 ? <>Abschließen<Check size={17} aria-hidden="true" /></> : <>Weiter<ArrowRight size={17} aria-hidden="true" /></>}</button></footer>
    </section>
  </div>, document.body);
}
