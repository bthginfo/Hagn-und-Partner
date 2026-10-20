"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Check, PanelsTopLeft, X } from "lucide-react";

import type { DesignVariant } from "@/lib/types";
export type { DesignVariant } from "@/lib/types";
const variantNames = ["Panorama", "Neue Perspektive", "Klare Haltung", "Schwarz auf Weiß", "Navy"];
const storageKey = "hp-design-review-v1";
const readVariant = (value: unknown): DesignVariant | null => value === "1" || value === 1 ? 1 : value === "2" || value === 2 ? 2 : value === "3" || value === 3 ? 3 : value === "4" || value === 4 ? 4 : value === "5" || value === 5 ? 5 : null;

export function useDesignVariant(variant?: DesignVariant, editable = false, configuredVariant?: DesignVariant): [DesignVariant, (next: DesignVariant) => void] {
  const defaultVariant = readVariant(configuredVariant) ?? readVariant(process.env.NEXT_PUBLIC_SITE_VARIANT) ?? 1;
  const [active, setActive] = useState<DesignVariant>(variant ?? defaultVariant);
  useEffect(() => {
    if (variant) { setActive(variant); return; }
    if (editable || process.env.NEXT_PUBLIC_DESIGN_REVIEW === "false") { setActive(defaultVariant); return; }
    let persisted: string | null = null;
    try { persisted = localStorage.getItem(storageKey); } catch { /* The URL works when local storage is unavailable. */ }
    const fromUrl = readVariant(new URLSearchParams(window.location.search).get("design"));
    const next = fromUrl ?? readVariant(persisted) ?? defaultVariant;
    setActive(next);
    if (fromUrl) { try { localStorage.setItem(storageKey, String(fromUrl)); } catch { /* Optional persistence. */ } }
  }, [variant, editable, defaultVariant]);
  function change(next: DesignVariant) {
    setActive(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* Optional persistence. */ }
    const url = new URL(window.location.href); url.searchParams.set("design", String(next));
    window.history.replaceState(window.history.state, "", url);
  }
  return [active, change];
}

export function DesignReviewSwitcher({ variant, onChange }: { variant: DesignVariant; onChange: (next: DesignVariant) => void }) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    window.addEventListener("keydown", close); window.addEventListener("pointerdown", outside);
    return () => { window.removeEventListener("keydown", close); window.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <div className="hp-review-switcher" ref={rootRef}>
    {open && <div className="hp-review-panel" id={id} role="region" aria-label="Website-Entwürfe"><div className="hp-review-panel-head"><span>Fünf Perspektiven.</span><button className="hp-review-close" type="button" aria-label="Entwurfsauswahl schließen" onClick={() => { setOpen(false); toggleRef.current?.focus(); }}><X size={18} /></button></div>
      <div className="hp-review-options">{([1, 2, 3, 4, 5] as DesignVariant[]).map((option) => <button type="button" key={option} className={`hp-review-option hp-review-option-${option}`} aria-pressed={variant === option} onClick={() => { onChange(option); setOpen(false); toggleRef.current?.focus(); }}><span className="hp-review-swatch" aria-hidden="true">{option < 3 ? "H&P" : "H+P"}</span><span><small>Entwurf {option}</small><strong>{variantNames[option - 1]}</strong></span>{variant === option ? <Check size={18} /> : <ArrowUpRight size={18} />}</button>)}</div>
      <p>Der gewählte Entwurf bleibt beim Seitenwechsel erhalten.</p>
    </div>}
    <button type="button" ref={toggleRef} className="hp-review-fab" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={`Entwurf ${variant} / 5 – Website-Entwurf wählen. Aktuell: ${variantNames[variant - 1]}`} onClick={() => setOpen(!open)}><PanelsTopLeft size={20} /><span>Entwurf {variant} / 5</span><span className="hp-review-fab-dot" aria-hidden="true" /></button>
  </div>;
}
