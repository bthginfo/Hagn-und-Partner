export function normalizeSlug(value:string):string{
  return value.trim().toLocaleLowerCase('de').replaceAll('ä','ae').replaceAll('ö','oe').replaceAll('ü','ue').replaceAll('ß','ss').replace(/^\/+|\/+$/g,'').split('/').filter(Boolean).map(part=>part.replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-{2,}/g,'-')).filter(Boolean).join('/');
}
