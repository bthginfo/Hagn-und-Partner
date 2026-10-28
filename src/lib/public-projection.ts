import { gzipSync, gunzipSync } from 'node:zlib';
import type { WebsiteContent } from './types';

export function projectPublicContent(content: WebsiteContent, slug?: string): WebsiteContent {
  const blog = content.config.blog;
  return {
    version: 1,
    config: content.config,
    pages: content.pages.filter(page => slug === undefined || page.slug === slug).map(page => slug === undefined ? { ...page, sections: [] } : page),
    posts: blog?.enabled ? (content.posts ?? []).filter(post => post.status === 'published').map(post => ({
      ...post,
      sections: slug === `${blog.slug}/${post.slug}` ? post.sections : [],
    })) : [],
  };
}

// Next's persistent fetch cache limits each entry to 2 MiB. Keep large articles
// cacheable, rather than silently reading them from Postgres on every request.
export function packPublicSnapshot(value: unknown): string {
  return gzipSync(Buffer.from(JSON.stringify(value)), { level: 6 }).toString('base64');
}
export function unpackPublicSnapshot<T>(value: string): T {
  return JSON.parse(gunzipSync(Buffer.from(value, 'base64'), { maxOutputLength: 16 * 1024 * 1024 }).toString('utf8')) as T;
}
