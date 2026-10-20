"use client";

import type { SiteConfig } from "@/lib/types";
import { footerConfig } from "@/lib/site-config";
import { ContentLink } from "./editable";
import { ArrowUpRight } from "lucide-react";

export function FooterNavigation({ site, editable, className = "", arrows = false }: { site: SiteConfig; editable?: boolean; className?: string; arrows?: boolean }) {
  const footer = footerConfig(site);
  if (!footer.columns.length) return null;
  return <div className={`hp-footer-navigation ${className}`} data-column-count={footer.columns.length}>
    {footer.navigationHeading && <h2>{footer.navigationHeading}</h2>}
    <div className="hp-footer-nav-columns">{footer.columns.map((column) => <nav key={column.id} aria-label={column.title || footer.navigationHeading || "Weitere Seiten"}>
      {column.title && column.title !== footer.navigationHeading && <h3>{column.title}</h3>}
      {column.links.map((link, index) => <ContentLink key={`${link.href}-${index}`} href={link.href} editable={editable}>{link.label}{arrows && <ArrowUpRight size={16} />}</ContentLink>)}
    </nav>)}</div>
  </div>;
}

export function FooterLegalLinks({ site, editable }: { site: SiteConfig; editable?: boolean }) {
  return <>{footerConfig(site).legalLinks.map((link, index) => <ContentLink key={`${link.href}-${index}`} href={link.href} editable={editable}>{link.label}</ContentLink>)}</>;
}
