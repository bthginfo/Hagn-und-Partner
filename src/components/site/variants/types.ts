import type { ReactNode } from "react";
import type { ContentItem, ImageValue, Section, SiteConfig } from "@/lib/types";
import type { SiteViewProps } from "../site-view";

export interface VariantSiteProps extends SiteViewProps {
  fallback: (section: Section) => ReactNode;
}

export interface VariantSectionProps {
  section: Section;
  site: SiteConfig;
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  onChange?: (section: Section) => void;
  /** Genuine people from the current page, available for the visual opening. */
  portraits?: ContentItem[];
  topics?: ContentItem[];
  sceneImage?: ImageValue;
}
