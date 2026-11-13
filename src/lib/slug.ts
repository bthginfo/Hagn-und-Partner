export function normalizeSlug(value:string):string{
  return value.trim().toLocaleLowerCase('de').replaceAll('ä','ae').replaceAll('ö','oe').replaceAll('ü','ue').replaceAll('ß','ss').replace(/^\/+|\/+$/g,'').split('/').filter(Boolean).map(part=>part.replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-{2,}/g,'-')).filter(Boolean).join('/');
}

export function isReservedPageSlug(slug: string): boolean {
  return /^(?:admin|api|_next|demo|checkout|members|workspace-branding)(?:\/|$)/.test(slug)
    || /^coach\/(?:access|edit|view)(?:\/|$)/.test(slug);
}
