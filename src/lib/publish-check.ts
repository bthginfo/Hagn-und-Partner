import type {WebsiteContent} from './types';
export function publishIssues(content:WebsiteContent):string[]{
  const issues:string[]=[];
  for(const link of content.config.navigation)if(!link.label.trim()||!link.href.trim())issues.push('Bitte ergänzen Sie den Namen und das Linkziel aller Navigationspunkte.');
  const footer=content.config.footer;
  if(footer){for(const link of [...footer.legalLinks,...footer.columns.flatMap(column=>column.links)])if(!link.label.trim()||!link.href.trim())issues.push('Bitte ergänzen Sie die Bezeichnungen und Linkziele im Fußbereich.');for(const column of footer.columns)if(!column.title.trim())issues.push('Bitte ergänzen Sie die Überschriften Ihrer Linkspalten im Fußbereich.');if(footer.ctaLabel.trim()&&!footer.ctaHref.trim())issues.push('Bitte ergänzen Sie das Linkziel des Kontaktaufrufs im Fußbereich.');}
  const listTypes=new Set(['services','team','faq','steps','stats','cards','list','downloads','timeline','accordion','comparison','columns','portrait-mosaic','service-explorer','focus-finder','portrait-rail','stacked-panels','case-deck','people-index']);
  const pages=[...content.pages,...(content.posts??[]).filter(post=>post.status==='published').map(post=>({...post,locale:'de'}))];
  for(const page of pages)for(const section of page.sections){
    if(!section.visible||section.type==='divider')continue;const label=`„${page.title}“, Abschnitt „${section.name}“`;
    if(!section.content.heading.trim()&&!['quote','logos'].includes(section.type))issues.push(`${label}: Bitte ergänzen Sie eine Überschrift.`);
    if(listTypes.has(section.type)&&!section.content.items?.length)issues.push(`${label}: Bitte ergänzen Sie mindestens einen Eintrag oder blenden Sie den Abschnitt aus.`);
    for(const item of section.content.items||[])if(!item.title.trim())issues.push(`${label}: Ein Eintrag hat noch keine Überschrift.`);
    if(section.type==='quote'&&!section.content.quote?.trim())issues.push(`${label}: Bitte tragen Sie das Zitat ein oder blenden Sie den Abschnitt aus.`);
    if(section.type==='video'&&!section.content.videoUrl?.trim())issues.push(`${label}: Bitte hinterlegen Sie ein Video oder blenden Sie den Abschnitt aus.`);
    if(['gallery','editorial-gallery','image-curtain'].includes(section.type)&&!section.content.images?.length)issues.push(`${label}: Bitte wählen Sie Bilder für die Galerie aus.`);
  }
  return [...new Set(issues)];
}
