const german=(message,values)=>message.replace(/\{(\w+)\}/g,(_,key)=>String(values[key]??""));
const clean=value=>String(value??"").trim().replace(/\s+/g," ");

/** Editorial hints for published content. This does not make a claim about indexation. */
export function searchReadinessIssues(content,t=german) {
 if(!content)return [];
 const posts=content.config?.blog?.enabled?(content.posts??[]).filter(post=>post.status==="published"):[];
 const titleOwners=new Map(),descriptionOwners=new Map(),issues=[];
 for(const page of [...(content.pages??[]),...posts]){
  if(page.seo?.noindex)continue;
  const routePart=value=>String(value??"").replace(/^\/+|\/+$/g,"");
  const path=posts.includes(page)?"/"+[content.config.blog.slug,page.slug].map(routePart).filter(Boolean).join("/"):"/"+routePart(page.slug);
  const title=clean(page.seo?.title),description=clean(page.seo?.description);
  const values={page:clean(page.title)||path,path};
  if(!title)issues.push(t("„{page}“ ({path}): Einen eigenen Suchergebnis-Titel ergänzen.",values));
  if(!description)issues.push(t("„{page}“ ({path}): Eine eigene Meta-Beschreibung ergänzen.",values));
  for(const [text,seen,message] of [
   [title,titleOwners,"„{page}“ ({path}): Der Suchergebnis-Titel wird auch für {other} verwendet."],
   [description,descriptionOwners,"„{page}“ ({path}): Die Meta-Beschreibung wird auch für {other} verwendet."],
  ]){
   if(!text)continue;
   const key=text.toLocaleLowerCase(),owner=seen.get(key);
   if(owner)issues.push(t(message,{...values,other:owner}));
   else seen.set(key,path);
  }
 }
 return issues;
}
