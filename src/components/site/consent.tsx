"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronLeft, Cookie, X } from "lucide-react";
import type { SiteConfig } from "@/lib/types";

type Consent = { version: 1; necessary: true; analytics: boolean; external: boolean; savedAt: string };
const storageKey = "hp-consent-v1";
export const consentEvent = "hp:consent-settings";
export const consentChangedEvent = "hp:consent-changed";

export function readConsent(): Consent | null {
  try { const value = JSON.parse(localStorage.getItem(storageKey) ?? "null"); return value?.version === 1 && value.necessary === true ? value : null; }
  catch { return null; }
}

export function ConsentManager({ site }: { site: SiteConfig }) {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [external, setExternal] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const settingsButton = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const titleId = useId();
  useEffect(() => {
    const consent = readConsent();
    if (consent) { setAnalytics(consent.analytics); setExternal(consent.external); }
    else if (site.consent.enabled) setVisible(true);
    const open = () => { previousFocus.current = document.activeElement as HTMLElement; setCustom(true); setVisible(true); };
    window.addEventListener(consentEvent, open);
    return () => window.removeEventListener(consentEvent, open);
  }, [site.consent.enabled]);
  useEffect(() => {
    if (!visible) return;
    // A non-blocking banner keeps all page content reachable. Settings are an actual modal.
    if (custom) dialogRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [visible, custom]);
  function restoreFocus() {
    requestAnimationFrame(() => {
      if (previousFocus.current?.isConnected) previousFocus.current.focus();
      else settingsButton.current?.focus();
    });
  }
  function closeSettings() {
    setCustom(false);
    setVisible(!readConsent());
    restoreFocus();
  }
  function save(allowAnalytics: boolean, allowExternal: boolean) {
    const consent: Consent = { version: 1, necessary: true, analytics: allowAnalytics, external: allowExternal, savedAt: new Date().toISOString() };
    try { localStorage.setItem(storageKey, JSON.stringify(consent)); } catch { /* Choice still applies in this session. */ }
    setAnalytics(allowAnalytics); setExternal(allowExternal); setVisible(false); setCustom(false);
    window.dispatchEvent(new CustomEvent(consentChangedEvent, { detail: consent }));
    restoreFocus();
  }
  if (!visible) return <Analytics site={site} />;
  return <><Analytics site={site} /><div className={custom ? "hp-consent-backdrop" : "hp-consent-wrap"}>
    <div className={`hp-consent ${custom ? "hp-consent-custom" : ""}`} ref={dialogRef}
      role={custom ? "dialog" : "region"} aria-modal={custom || undefined} aria-labelledby={titleId}
      onKeyDown={(event) => {
        if (!custom) return;
        if (event.key === "Escape") { event.preventDefault(); closeSettings(); return; }
        if (event.key === "Tab") {
          const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href], input:not([disabled])") ?? []);
          const first = items[0], last = items.at(-1);
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
      }}>
      <div className="hp-consent-heading"><Cookie size={23} aria-hidden="true" /><h2 id={titleId}>{custom ? "Ihre Datenschutzeinstellungen" : site.consent.title}</h2>
        {custom && <button type="button" className="hp-icon-button" aria-label="Zurück zur Auswahl" onClick={closeSettings}><X size={20} /></button>}</div>
      <p>{site.consent.text}</p>
      {custom && <div className="hp-consent-categories">
        <label><span><strong>Notwendig</strong><small>Technisch erforderliche Funktionen und die Speicherung Ihrer Auswahl.</small></span><input type="checkbox" checked disabled aria-label="Notwendige Cookies, immer aktiv" /><Check className="hp-necessary-check" size={18} /></label>
        <label><span><strong>Statistik</strong><small>Hilft uns, die Nutzung unserer Website zu verstehen. Wird nur mit Ihrer Einwilligung aktiviert.</small></span><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /></label>
        <label><span><strong>Externe Medien</strong><small>Erlaubt das Laden eingebetteter Videos und Karten von Drittanbietern.</small></span><input type="checkbox" checked={external} onChange={(event) => setExternal(event.target.checked)} /></label>
      </div>}
      <div className="hp-consent-actions"><button type="button" className="hp-button hp-button-outline" onClick={() => save(false, false)}>Nur notwendige</button><button type="button" className="hp-button hp-button-outline" onClick={() => save(true, true)}>Alle akzeptieren</button>
        {custom ? <button type="button" className="hp-text-button" onClick={() => save(analytics, external)}>Auswahl speichern <Check size={16} /></button> : <button type="button" ref={settingsButton} className="hp-text-button" onClick={event => { previousFocus.current = event.currentTarget; setCustom(true); }}>Einstellungen <ArrowUpRight size={16} /></button>}</div>
      <div className="hp-consent-links"><a href="/datenschutz">Datenschutz</a><a href="/impressum">Impressum</a>{custom && <button type="button" onClick={closeSettings}><ChevronLeft size={13} /> Zurück</button>}</div>
    </div>
  </div></>;
}

type TrackingWindow = Window & typeof globalThis & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; _paq?: unknown[][] };
function Analytics({ site }: { site: SiteConfig }) {
  const loaded = useRef(false);
  useEffect(() => {
    const activate = (event?: Event) => {
      const consent = event instanceof CustomEvent ? event.detail as Consent : readConsent();
      const win = window as TrackingWindow;
      const googleId = site.analytics.googleId;
      if (!consent?.analytics) {
        if (googleId) (win as unknown as Record<string, unknown>)[`ga-disable-${googleId}`] = true;
        win.gtag?.("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        win._paq?.push(["forgetConsentGiven"]);
        document.querySelectorAll("script[data-hp-analytics]").forEach((script) => script.remove());
        return;
      }
      if (googleId) (win as unknown as Record<string, unknown>)[`ga-disable-${googleId}`] = false;
      if (loaded.current) { win.gtag?.("consent", "update", { analytics_storage: "granted" }); win._paq?.push(["setConsentGiven"]); return; }
      loaded.current = true;
      if (/^G-[A-Z0-9]+$/.test(googleId)) {
        win.dataLayer = win.dataLayer ?? [];
        win.gtag = function (...args: unknown[]) { win.dataLayer!.push(args); };
        win.gtag("consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        win.gtag("js", new Date()); win.gtag("config", googleId, { anonymize_ip: true });
        const script = document.createElement("script"); script.async = true; script.dataset.hpAnalytics = "google";
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleId)}`; document.head.appendChild(script);
      }
      if (site.analytics.matomoUrl && /^\d+$/.test(site.analytics.matomoSiteId)) {
        try {
          const url = new URL(site.analytics.matomoUrl);
          if (url.protocol !== "https:") return;
          const base = url.href.replace(/\/$/, "");
          win._paq = win._paq ?? [];
          win._paq.push(["requireConsent"], ["setConsentGiven"], ["setTrackerUrl", `${base}/matomo.php`], ["setSiteId", site.analytics.matomoSiteId], ["trackPageView"], ["enableLinkTracking"]);
          const script = document.createElement("script"); script.async = true; script.dataset.hpAnalytics = "matomo"; script.src = `${base}/matomo.js`; document.head.appendChild(script);
        } catch { /* Invalid settings never load a remote script. */ }
      }
    };
    activate(); window.addEventListener(consentChangedEvent, activate);
    return () => window.removeEventListener(consentChangedEvent, activate);
  }, [site.analytics]);
  return null;
}

export function ExternalMedia({ kind, url, address, title, editable }: { kind: "video" | "map"; url?: string; address?: string; title: string; editable?: boolean }) {
  const [allowed, setAllowed] = useState(false);
  const [once, setOnce] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => { if (once && !editable) frameRef.current?.focus({ preventScroll: true }); }, [once, editable]);
  useEffect(() => {
    const update = (event?: Event) => {
      const external = Boolean((event instanceof CustomEvent ? event.detail as Consent : readConsent())?.external);
      setAllowed(external);
      if (event && !external) setOnce(false);
    };
    update(); window.addEventListener(consentChangedEvent, update);
    return () => window.removeEventListener(consentChangedEvent, update);
  }, []);
  const localVideo = kind === "video" && !!url && /^(?:\/[^/]|https:\/\/[^?#]+\.(?:mp4|webm)(?:\?|$))/i.test(url);
  let embedUrl = "";
  if (url) {
    try {
      const parsed = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://hagn-partner.de");
      if (kind === "video") {
        const youtube = /^(?:www\.)?youtube(?:-nocookie)?\.com$/.test(parsed.hostname) ? parsed.searchParams.get("v") ?? parsed.pathname.split("/embed/")[1] : parsed.hostname === "youtu.be" ? parsed.pathname.slice(1) : "";
        if (youtube && /^[a-zA-Z0-9_-]{6,20}$/.test(youtube)) embedUrl = `https://www.youtube-nocookie.com/embed/${youtube}`;
        else if (/^(?:www\.|player\.)?vimeo\.com$/.test(parsed.hostname)) { const videoId = parsed.pathname.match(/\d+/)?.[0]; if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`; }
      } else if (parsed.protocol === "https:" && /^(?:(?:www|maps)\.google\.(?:com|de)|www\.openstreetmap\.org)$/.test(parsed.hostname) && /\/embed/.test(parsed.pathname)) embedUrl = parsed.href;
    } catch { /* An invalid URL remains a local information panel. */ }
  }
  if (kind === "map" && !url && address?.trim()) embedUrl = `https://maps.google.com/maps?output=embed&hl=de&z=16&q=${encodeURIComponent(address.trim())}`;
  const googleMap = kind === "map" && /^https:\/\/(?:maps|www)\.google\./.test(embedUrl);
  if (localVideo) return <video className="hp-native-video" src={url} controls preload="metadata" aria-label={title} />;
  if (embedUrl && (allowed || once) && !editable) return <iframe ref={frameRef} className={`hp-embed hp-embed-${kind}`} src={embedUrl} title={kind === "map" ? `${googleMap ? "Google Maps" : "Karte"}: ${address || title}` : title} loading="lazy" allow={kind === "video" ? "fullscreen; picture-in-picture" : undefined} allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />;
  return <div className={`hp-external-placeholder hp-external-${kind}`}>
    <div className="hp-external-orbit" aria-hidden="true"><span /><span /><span /></div>
    <h3>{kind === "map" ? googleMap ? "Unsere Kanzlei auf Google Maps." : "Unsere Kanzlei auf der Karte." : title}</h3>
    <p>{embedUrl ? kind === "map" ? `Wenn Sie die Karte laden, werden Ihre IP-Adresse und weitere Nutzungsdaten an ${googleMap ? "Google" : "den Kartenanbieter"} übertragen. Die Freigabe gilt für diese Ansicht. Sie können sie auch über die Cookie-Einstellungen widerrufen.` : "Beim Laden des Videos werden Daten an den jeweiligen Anbieter übertragen. Weitere Informationen finden Sie in unseren Datenschutzhinweisen." : kind === "map" ? "Planen Sie Ihre Anfahrt mit dem Routenplaner Ihrer Wahl." : "Hier ist derzeit kein Video hinterlegt."}</p>
    {embedUrl && <button type="button" className="hp-button hp-button-dark" disabled={editable} onClick={() => setOnce(true)}>{kind === "map" ? googleMap ? "Google Maps einmalig laden" : "Karte einmalig laden" : "Video einmalig laden"} <ArrowUpRight size={18} /></button>}
    <a href="/datenschutz" className="hp-inline-link">Datenschutzhinweise</a>
  </div>;
}
