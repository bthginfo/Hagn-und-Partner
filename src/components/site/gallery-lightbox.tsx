"use client";

import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import type { ImageValue } from '@/lib/types';

/** Shared controls for the five gallery layouts; their composition stays intact. */
export function useGalleryLightbox(images: ImageValue[]) {
  const [active, setActive] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const current = active === null ? null : Math.min(active, Math.max(0, images.length - 1));
  const image = current === null ? undefined : images[current];
  const isOpen = active !== null;
  function move(direction: number) {
    setActive(value => value === null || !images.length ? value : (value + direction + images.length) % images.length);
  }
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const previousOverflow = document.documentElement.style.overflow;
    const previousGutter = document.documentElement.style.scrollbarGutter;
    document.documentElement.style.scrollbarGutter = 'stable';
    document.documentElement.style.overflow = 'hidden';
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      document.documentElement.style.overflow = previousOverflow;
      document.documentElement.style.scrollbarGutter = previousGutter;
      opener.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);
  useEffect(() => {
    if (current === null || images.length < 2) return;
    for (const offset of [-1, 1]) {
      const next = new Image();
      next.src = images[(current + offset + images.length) % images.length].src;
    }
  }, [current, images]);
  const openImage = (index: number, button: HTMLButtonElement) => { opener.current = button; setActive(index); };
  const lightbox = <dialog ref={dialogRef} className="hp-gallery-lightbox" aria-label="Bildergalerie – Großansicht" onCancel={event => { event.preventDefault(); setActive(null); }} onClose={() => { if (!dialogRef.current?.open) setActive(null); }} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setActive(null);
  }} onKeyDown={event => {
    if (event.key === 'Tab') {
      const controls = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not([disabled])')];
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
  }}>
    <div className="hp-gallery-lightbox-head"><span>Großansicht</span><button type="button" className="hp-gallery-close" autoFocus onClick={() => setActive(null)}><span>Schließen</span><X size={23} /></button></div>
    <figure className="hp-gallery-lightbox-image" onTouchStart={event => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }} onTouchEnd={event => {
      const point = event.changedTouches[0], start = touch.current; touch.current = null;
      if (!start) return;
      const dx = point.clientX - start.x, dy = point.clientY - start.y;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    }}>{image && <img src={image.src} alt={image.alt} decoding="async" />}</figure>
    <div className="hp-gallery-lightbox-foot"><p>{image?.caption || image?.alt}</p><div className="hp-gallery-navigation">
      <button type="button" aria-label="Vorheriges Bild" disabled={images.length < 2} onClick={() => move(-1)}><ArrowLeft size={23} /></button>
      <span aria-live="polite" aria-atomic="true">{current === null ? 0 : current + 1} / {images.length}</span>
      <button type="button" aria-label="Nächstes Bild" disabled={images.length < 2} onClick={() => move(1)}><ArrowRight size={23} /></button>
    </div></div>
  </dialog>;
  return { openImage, lightbox };
}
