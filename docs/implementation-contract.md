# Parallel implementation contract

Next.js 16 App Router / React 19 / strict TS. Shared schema in src/lib/types.ts. Root owns all backend, seed, app layout, root globals, routing, infrastructure and tests. Public implementation owns src/components/site/** and src/styles/site.css. CMS implementation owns src/components/admin/** and src/styles/admin.css. Do not change shared types/package/config; request changes by message.

## Public exports
`SiteView({page,site,editable?,selectedSectionId?,onSectionSelect?,onSectionChange?})` from src/components/site/site-view.tsx. page: PageContent, site: SiteConfig, callbacks select section id and change entire section. site-view includes header/footer and SectionRenderer; exported `SectionRenderer` from same file optional. All visible copy flows from props. For editable text onBlur clone section update path. Prevent live links navigating while editing. Section selection via overlay and selected outline; contentEditable on actual rendered texts. Contact form posts JSON {name,email,phone,subject,message,consent:true,website:''} to /api/contact. Cookie UI persists v1 consent locally; analytics only load after explicit consent. Use /api/public/consent if needed but none required. Config contains consent & analytics. No external font requests; root imports fontsource Manrope and DM Sans; root defines --font-display Manrope and --font-body DM Sans. Renderer must handle all 26 SECTION_TYPES in a deliberate presentation. Image positions objectPosition from data. Site CSS scoped .hp-site to avoid Admin conflict. Nav links pages /kanzlei /anwaelte /rechtsgebiete /service /kontakt. Details /anwaelte/{slug} and /rechtsgebiete/{slug}. Root provides pages.

## Admin exports & APIs
`AdminApp()` from src/components/admin/admin-app.tsx; `AdminLogin()` from src/components/admin/admin-login.tsx. German UI.
GET /api/admin/bootstrap -> AdminBootstrap (types file). APIs require session cookie automatically.
POST /api/admin/login {password} -> {ok:true}; POST /api/admin/logout {}.
PUT /api/admin/content {content:WebsiteContent, revision:number} -> {state:CmsState}; 409 on concurrent modification.
POST /api/admin/publish {revision:number} -> {state:CmsState}; only saved draft. POST /api/admin/restore {id,revision} -> {state:CmsState}.
GET /api/admin/media -> {media:MediaAsset[]}; POST FormData file+alt -> {asset:MediaAsset}; PATCH {id,alt,position} -> {asset}; DELETE {id}.
PUT /api/admin/settings {settings:SiteSettings} -> {settings:SiteSettings}, password omitted/empty preserves stored SMTP password. POST /api/admin/settings/test {to?} -> {ok,message}.
GET /api/admin/inquiries -> {inquiries:Inquiry[]}; PATCH {id,status?,note?}; DELETE {id}; /api/admin/inquiries/export GET CSV.
POST /api/admin/password {currentPassword,newPassword} -> {ok:true}.
GET /api/admin/export returns JSON attachment (draft & published, no secrets/inquiries).
Standard errors {error:string}. Save is explicit, publish separate; show dirty guard, visible toasts/errors and loading states. Use import {sectionLibrary,createSection} from @/lib/section-library (root provides) with sectionLibrary entries {type,name,description,category,icon}; createSection(type):Section. No backend imports in client.
