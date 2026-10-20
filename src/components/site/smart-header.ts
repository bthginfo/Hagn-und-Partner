"use client";

import { useEffect, useRef } from "react";

/** Directional navigation with a dead zone; keyboard focus always reveals it. */
export function useSmartHeader({ open = false, disabled = false, maxWidth }: { open?: boolean; disabled?: boolean; maxWidth?: number } = {}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const header = ref.current;
    const site = header?.closest<HTMLElement>(".hp-site");
    if (!header || !site) return;
    let frame = 0;
    let lastY = Math.max(0, window.scrollY);
    let direction = 0;
    let distance = 0;
    const active = () => !disabled && (!maxWidth || site.clientWidth <= maxWidth);
    const reveal = () => { header.dataset.headerHidden = "false"; };
    const measure = () => {
      const height = header.getBoundingClientRect().height;
      site.style.setProperty("--hp-header-height", `${height}px`);
      site.style.setProperty("--hp-sticky-header-height", `${active() ? height : 0}px`);
      header.dataset.headerInactive = String(!active());
      if (!active()) reveal();
    };
    const update = () => {
      frame = 0;
      const limit = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const y = Math.min(limit, Math.max(0, window.scrollY));
      const delta = y - lastY;
      lastY = y;
      header.dataset.headerScrolled = String(!disabled && y > 32);
      if (!active() || open || y <= 32 || header.contains(document.activeElement)) { reveal(); distance = 0; return; }
      if (Math.abs(delta) < .5) return;
      const nextDirection = delta > 0 ? 1 : -1;
      if (nextDirection !== direction) { direction = nextDirection; distance = 0; }
      distance += Math.abs(delta);
      if (distance < (direction > 0 ? 22 : 12)) return;
      header.dataset.headerHidden = String(direction > 0 && y > Math.max(150, header.offsetHeight + 35));
      distance = 0;
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    const focused = () => { distance = 0; reveal(); };
    const observer = new ResizeObserver(measure);
    observer.observe(header); observer.observe(site);
    measure(); update();
    window.addEventListener("scroll", request, { passive: true });
    header.addEventListener("focusin", focused);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect(); window.removeEventListener("scroll", request); header.removeEventListener("focusin", focused);
    };
  }, [open, disabled, maxWidth]);
  return { ref, "data-smart-header": true, "data-header-disabled": disabled || undefined, "data-header-mobile-only": maxWidth || undefined };
}
