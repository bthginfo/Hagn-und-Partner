import content from './content.json';
import media from './media.json';
import type { MediaAsset, WebsiteContent } from '@/lib/types';
export const seedContent=content as WebsiteContent;
export const seedMedia=media as MediaAsset[];
