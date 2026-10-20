"use client";

import { AdminLinkProvider } from "./link-picker";

import { useCallback, useEffect, useRef, useState } from "react";
import { LogOut, Newspaper, PanelLeftClose } from "lucide-react";
import type { AdminBootstrap, CmsState, Inquiry, MediaAsset, SiteSettings, WebsiteContent } from "@/lib/types";
import { ApiError, Button, CircleHelp, ExternalLink, IconButton, Image, LayoutDashboard, LoaderCircle, Mail, Menu, Notice, Pencil, RefreshCw, Settings2, X, api, clone, errorMessage } from "./admin-ui";
import { Dashboard, HelpPanel } from "./dashboard-help";
import { InquiryInbox } from "./inquiry-inbox";
import { MediaManager } from "./media-manager";
import { PageEditor } from "./page-editor";
import { SiteSettingsPanel } from "./site-settings";
import { BlogManager } from "./blog-manager";
import { GuidedTour, browserTourComplete, markBrowserTourComplete } from "./guided-tour";
import { siteMediaUploadedEvent } from "@/components/site/editable";

export type AdminView = "dashboard" | "editor" | "blog" | "media" | "inquiries" | "settings" | "help";
const nav = [{ id: "dashboard", label: "Übersicht", icon: LayoutDashboard }, { id: "editor", label: "Seiten bearbeiten", icon: Pencil }, { id: "blog", label: "Beiträge", icon: Newspaper }, { id: "media", label: "Medien", icon: Image }, { id: "inquiries", label: "Anfragen", icon: Mail }, { id: "settings", label: "Einstellungen", icon: Settings2 }, { id: "help", label: "Hilfe", icon: CircleHelp }] as const;
type Toast = { id: string; text: string; error: boolean };

export function AdminApp() {
  const [data, setData] = useState<AdminBootstrap | null>(null); const dataRef = useRef<AdminBootstrap | null>(null); const [content, setContent] = useState<WebsiteContent | null>(null); const contentRef = useRef<WebsiteContent | null>(null); const saved = useRef(""); const allowedLeave = useRef(false); const bootstrapRequest = useRef<Promise<AdminBootstrap> | null>(null); const history = useRef<{ past: WebsiteContent[]; future: WebsiteContent[] }>({ past: [], future: [] }); const [historyState, setHistoryState] = useState({ undo: false, redo: false }); const [view, setView] = useState<AdminView>("dashboard"); const [mobileNav, setMobileNav] = useState(false); const [busy, setBusy] = useState<string | null>(null); const [loadingError, setLoadingError] = useState(""); const [conflict, setConflict] = useState(false); const [toasts, setToasts] = useState<Toast[]>([]); const [settingsDirty, setSettingsDirty] = useState(false); const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [tourOpen,setTourOpen]=useState(false);
  const [tourComplete,setTourComplete]=useState(false);
  const [mobileViewport, setMobileViewport] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const navOpener = useRef<HTMLButtonElement | null>(null);
  const drawerOpen = mobileViewport && mobileNav && !tourOpen;
  const drawerState = useRef({ open: false, tour: false });
  useEffect(() => {
    const query = window.matchMedia("(max-width: 1180px)");
    const update = () => {
      const focusMovesToHiddenNav = query.matches && sidebarRef.current?.contains(document.activeElement);
      setMobileViewport(query.matches); if (!query.matches) setMobileNav(false);
      if (focusMovesToHiddenNav) requestAnimationFrame(() => {
        if (!drawerState.current.open && !drawerState.current.tour) document.querySelector<HTMLElement>(".cms-nav-toggle")?.focus({ preventScroll: true });
      });
    };
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => { drawerState.current = { open: drawerOpen, tour: tourOpen }; if (tourOpen) setMobileNav(false); }, [drawerOpen, tourOpen]);
  useEffect(() => {
    if (!drawerOpen) return;
    const sidebar = sidebarRef.current;
    if (!sidebar) return;
    const bodyOverflow = document.body.style.overflow; const pageOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden"; document.documentElement.style.overflow = "hidden";
    const getFocusable = () => Array.from(sidebar.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex='0']")).filter(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden" && !element.closest("[inert]"));
    const focusFirst = () => (sidebar.querySelector<HTMLElement>(".cms-nav-close") || getFocusable()[0] || sidebar).focus({ preventScroll: true });
    const frame = requestAnimationFrame(focusFirst);
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setMobileNav(false); return; }
      if ((event.ctrlKey || event.metaKey) && ["s", "z", "y"].includes(event.key.toLowerCase())) { event.preventDefault(); event.stopPropagation(); return; }
      if (event.key !== "Tab") return;
      const focusable = getFocusable(); const first = focusable[0]; const last = focusable.at(-1);
      if (!first || !last) { event.preventDefault(); sidebar.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement as HTMLElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement as HTMLElement))) { event.preventDefault(); first.focus(); }
    };
    const onFocus = (event: FocusEvent) => { if (event.target instanceof Node && !sidebar.contains(event.target)) focusFirst(); };
    document.addEventListener("keydown", onKeydown, true); document.addEventListener("focusin", onFocus, true);
    return () => {
      cancelAnimationFrame(frame); document.removeEventListener("keydown", onKeydown, true); document.removeEventListener("focusin", onFocus, true);
      document.body.style.overflow = bodyOverflow; document.documentElement.style.overflow = pageOverflow;
      requestAnimationFrame(() => {
        if (drawerState.current.open || drawerState.current.tour) return;
        const target = window.matchMedia("(max-width: 1180px)").matches ? navOpener.current || document.querySelector<HTMLElement>(".cms-nav-toggle") : sidebar.querySelector<HTMLElement>('nav [aria-current="page"]');
        if (target?.isConnected && target.getClientRects().length && !target.closest("[inert]")) target.focus({ preventScroll: true });
      });
    };
  }, [drawerOpen]);
  const dirty = Boolean(content && JSON.stringify(content) !== saved.current);
  function commitData(next: AdminBootstrap) { dataRef.current = next; setData(next); }
  function replaceContent(next: WebsiteContent) { contentRef.current = next; setContent(next); }
  const toast = useCallback((text: string, error = false) => { const id = crypto.randomUUID(); setToasts(previous => [...previous.slice(-2), { id, text, error }]); const timer = setTimeout(() => setToasts(previous => previous.filter(item => item.id !== id)), error ? 11000 : 6000); timers.current.push(timer); }, []);
  useEffect(() => { let active = true; const request = bootstrapRequest.current ||= api<AdminBootstrap>("/api/admin/bootstrap"); void request.then(result => { if (!active) return; dataRef.current = result; setData(result); contentRef.current = clone(result.state.draft); setContent(contentRef.current); saved.current = JSON.stringify(result.state.draft);const complete=browserTourComplete();setTourComplete(complete);setTourOpen(!complete); }).catch(error => { if (active) setLoadingError(errorMessage(error)); }); return () => { active = false; timers.current.forEach(clearTimeout); }; }, []);
  useEffect(() => {
    const handleUpload = (event: Event) => {
      const asset = (event as CustomEvent<MediaAsset>).detail; const current = dataRef.current;
      if (!current || !asset?.id || !asset.url || current.media.some(item => item.id === asset.id)) return;
      const next = { ...current, media: [asset, ...current.media] };
      dataRef.current = next; setData(next);
    };
    window.addEventListener(siteMediaUploadedEvent, handleUpload);
    return () => window.removeEventListener(siteMediaUploadedEvent, handleUpload);
  }, []);
  function updateContent(next: WebsiteContent) { const previous = contentRef.current; if (previous && JSON.stringify(previous) === JSON.stringify(next)) return; if (previous) history.current.past = [...history.current.past.slice(-69), clone(previous)]; history.current.future = []; setHistoryState({ undo: history.current.past.length > 0, redo: false }); replaceContent(next); }
  function undo() { const previous = history.current.past.pop(); if (!previous || !contentRef.current) return; history.current.future.push(clone(contentRef.current)); replaceContent(previous); setHistoryState({ undo: history.current.past.length > 0, redo: true }); }
  function redo() { const next = history.current.future.pop(); if (!next || !contentRef.current) return; history.current.past.push(clone(contentRef.current)); replaceContent(next); setHistoryState({ undo: true, redo: history.current.future.length > 0 }); }
  function handleMutationError(error: unknown) { if (error instanceof ApiError && error.status === 409) { setConflict(true); toast("Der Entwurf wurde zwischenzeitlich geändert. Laden Sie den aktuellen Stand neu, bevor Sie weiter speichern.", true); } else toast(errorMessage(error), true); }
  async function saveDraft() { const currentData = dataRef.current; const currentContent = contentRef.current; if (!currentData || !currentContent || busy) return; setBusy("save"); const submitted = clone(currentContent); try { const result = await api<{ state: CmsState }>("/api/admin/content", { method: "PUT", body: JSON.stringify({ content: submitted, revision: currentData.state.revision }) }); commitData({ ...dataRef.current!, state: result.state }); saved.current = JSON.stringify(result.state.draft); if (JSON.stringify(contentRef.current) === JSON.stringify(submitted)) replaceContent(clone(result.state.draft)); setConflict(false); toast("Der Entwurf wurde gespeichert."); } catch (error) { handleMutationError(error); } finally { setBusy(null); } }
  async function publish() { const currentData = dataRef.current; if (!currentData || busy) return; if (JSON.stringify(contentRef.current) !== saved.current) { toast("Speichern Sie zuerst den Entwurf.", true); return; } setBusy("publish"); try { const result = await api<{ state: CmsState }>("/api/admin/publish", { method: "POST", body: JSON.stringify({ revision: currentData.state.revision }) }); commitData({ ...dataRef.current!, state: result.state }); saved.current = JSON.stringify(result.state.draft); setConflict(false); toast("Ihre Änderungen wurden veröffentlicht."); } catch (error) { handleMutationError(error); } finally { setBusy(null); } }
  async function restore(id: string) { if (!dataRef.current || busy) return; setBusy("restore"); try { const result = await api<{ state: CmsState }>("/api/admin/restore", { method: "POST", body: JSON.stringify({ id, revision: dataRef.current.state.revision }) }); if (contentRef.current) history.current.past.push(clone(contentRef.current)); history.current.future = []; commitData({ ...dataRef.current!, state: result.state }); saved.current = JSON.stringify(result.state.draft); replaceContent(clone(result.state.draft)); setHistoryState({ undo: history.current.past.length > 0, redo: false }); setConflict(false); toast("Die Version wurde als Entwurf wiederhergestellt."); } catch (error) { handleMutationError(error); throw error; } finally { setBusy(null); } }
  async function saveSettings(settings: SiteSettings) { const result = await api<{ settings: SiteSettings }>("/api/admin/settings", { method: "PUT", body: JSON.stringify({ settings }) }); const previous = dataRef.current!; commitData({ ...previous, settings: result.settings, system: { ...previous.system, smtp: result.settings.smtp.enabled && Boolean(result.settings.smtp.host) } }); toast("Die Einstellungen wurden gespeichert."); return result.settings; }
  async function persistBlogDraft() {
    const currentData=dataRef.current!; const submitted=clone(contentRef.current!);
    if(JSON.stringify(submitted)===saved.current)return;
    const result=await api<{state:CmsState}>("/api/admin/content",{method:"PUT",body:JSON.stringify({content:submitted,revision:currentData.state.revision})});
    commitData({...dataRef.current!,state:result.state}); saved.current=JSON.stringify(result.state.draft);
    if(JSON.stringify(contentRef.current)!==JSON.stringify(submitted))throw new Error("Es gibt weitere Änderungen. Bitte speichern Sie den aktuellen Stand erneut.");
    replaceContent(clone(result.state.draft)); setConflict(false);
  }
  async function saveBlog() {
    if(busy)return;setBusy("blog-save");
    try{await persistBlogDraft();toast("Der Entwurf wurde gespeichert.");}catch(error){handleMutationError(error);throw error;}finally{setBusy(null);}
  }
  async function blogAction(action:"publish"|"unpublish"|"delete"|"settings",id?:string) {
    if(busy)return;setBusy("blog");
    try{
      await persistBlogDraft();
      const result=await api<{state:CmsState}>(`/api/admin/blog/${action}`,{method:"POST",body:JSON.stringify({id,revision:dataRef.current!.state.revision})});
      commitData({...dataRef.current!,state:result.state});saved.current=JSON.stringify(result.state.draft);replaceContent(clone(result.state.draft));
      history.current={past:[],future:[]};setHistoryState({undo:false,redo:false});setConflict(false);
      toast(action==="publish"?"Der Beitrag wurde veröffentlicht.":action==="unpublish"?"Der Beitrag ist jetzt ein Entwurf.":action==="delete"?"Der Beitrag wurde gelöscht.":"Die Blog-Einstellungen wurden übernommen.");
    }catch(error){handleMutationError(error);throw error;}finally{setBusy(null);}
  }
  function closeTour(){markBrowserTourComplete();setTourComplete(true);setTourOpen(false);}
  async function upload(file: File) { if (file.size > 4 * 1024 * 1024) throw new Error("Diese Datei ist größer als 4 MB. Bitte verkleinern Sie sie vor dem Hochladen."); const form = new FormData(); form.append("file", file); form.append("alt", ""); const result = await api<{ asset: MediaAsset }>("/api/admin/media", { method: "POST", body: form }); commitData({ ...dataRef.current!, media: [result.asset, ...dataRef.current!.media] }); toast(`„${file.name}“ wurde hochgeladen.`); return result.asset; }
  async function updateMedia(asset: MediaAsset) { const result = await api<{ asset: MediaAsset }>("/api/admin/media", { method: "PATCH", body: JSON.stringify({ id: asset.id, alt: asset.alt, position: asset.position }) }); commitData({ ...dataRef.current!, media: dataRef.current!.media.map(item => item.id === asset.id ? result.asset || asset : item) }); toast("Die Dateiangaben wurden gespeichert."); }
  async function deleteMedia(asset: MediaAsset) { if (JSON.stringify(contentRef.current).includes(asset.url)) throw new Error("Diese Datei wird im aktuellen Entwurf verwendet. Entfernen oder ersetzen Sie sie dort zuerst und speichern Sie den Entwurf."); await api("/api/admin/media", { method: "DELETE", body: JSON.stringify({ id: asset.id }) }); commitData({ ...dataRef.current!, media: dataRef.current!.media.filter(item => item.id !== asset.id) }); toast("Die Datei wurde gelöscht."); }
  async function updateInquiry(inquiry: Inquiry, changes: { status?: Inquiry["status"]; note?: string }) { const result = await api<{ inquiry?: Inquiry }>("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ id: inquiry.id, ...changes }) }); commitData({ ...dataRef.current!, inquiries: dataRef.current!.inquiries.map(item => item.id === inquiry.id ? result.inquiry || { ...item, ...changes } : item) }); toast(changes.note !== undefined ? "Die Notiz wurde gespeichert." : "Der Status wurde geändert."); }
  async function deleteInquiry(inquiry: Inquiry) { await api("/api/admin/inquiries", { method: "DELETE", body: JSON.stringify({ id: inquiry.id }) }); commitData({ ...dataRef.current!, inquiries: dataRef.current!.inquiries.filter(item => item.id !== inquiry.id) }); toast("Die Anfrage wurde gelöscht."); }
  function navigate(next: AdminView) { if (settingsDirty && view === "settings" && next !== view && !window.confirm("Die technischen Einstellungen wurden noch nicht gespeichert. Möchten Sie diesen Bereich verlassen und die Änderungen verwerfen?")) return; setSettingsDirty(false); setView(next); setMobileNav(false); }
  async function logout() { if ((dirty || settingsDirty) && !window.confirm("Es gibt ungespeicherte Änderungen. Möchten Sie sich trotzdem abmelden und diese Änderungen verwerfen?")) return; setBusy("logout"); try { await api("/api/admin/logout", { method: "POST", body: "{}" }); allowedLeave.current = true; window.location.assign("/admin/login"); } catch (error) { toast(errorMessage(error), true); setBusy(null); } }
  useEffect(() => { const handler = (event: BeforeUnloadEvent) => { if (!allowedLeave.current && (dirty || settingsDirty)) { event.preventDefault(); event.returnValue = ""; } }; window.addEventListener("beforeunload", handler); return () => window.removeEventListener("beforeunload", handler); }, [dirty, settingsDirty]);
  useEffect(() => { const handler = (event: KeyboardEvent) => { if (!(event.ctrlKey || event.metaKey)) return; const target = event.target as HTMLElement; const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable; if (event.key.toLowerCase() === "s") { event.preventDefault(); if (contentRef.current && JSON.stringify(contentRef.current) !== saved.current) void saveDraft(); } if (!typing && event.key.toLowerCase() === "z") { event.preventDefault(); if (event.shiftKey) redo(); else undo(); } }; window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler); });
  if (!data || !content) return <main className="cms-root cms-loading">{loadingError ? <><h1>Die Verwaltung konnte nicht geladen werden.</h1><Notice tone="error">{loadingError}</Notice><Button onClick={() => window.location.reload()}><RefreshCw size={16} />Erneut laden</Button><a href="/" className="cms-text-link">Zur Website</a></> : <><div className="cms-loading-brand">Hagn <span>&</span> Partner</div><LoaderCircle className="cms-spin" size={25} /><p>Verwaltung wird geladen …</p></>}</main>;
  const newInquiries = data.inquiries.filter(item => item.status === "new").length;
  return <AdminLinkProvider content={content}><div className={`cms-root cms-app ${(view === "editor" || view === "blog") ? "cms-app--editor" : ""}`}><a href="#cms-main" className="cms-skip-link" inert={drawerOpen || tourOpen}>Zum Inhalt springen</a>{drawerOpen && <button className="cms-nav-backdrop" type="button" tabIndex={-1} aria-hidden="true" aria-label="Menü schließen" onClick={() => setMobileNav(false)} />}<aside ref={sidebarRef} id="cms-admin-navigation" inert={tourOpen || (mobileViewport && !mobileNav)} aria-hidden={tourOpen || (mobileViewport && !mobileNav) || undefined} role={drawerOpen ? "dialog" : undefined} aria-modal={drawerOpen || undefined} tabIndex={-1} className={`cms-sidebar ${drawerOpen ? "cms-sidebar--open" : ""}`} aria-label="Hauptnavigation"><div className="cms-sidebar-brand"><a href="/admin">Hagn <span>&</span><br />Partner<span className="cms-brand-sub">Website-Verwaltung</span></a><IconButton className="cms-nav-close" label="Menü schließen" onClick={() => setMobileNav(false)}><PanelLeftClose size={20} /></IconButton></div><nav>{nav.map(item => <button key={item.id} type="button" aria-current={view === item.id ? "page" : undefined} onClick={() => navigate(item.id)}><item.icon size={19} strokeWidth={1.65} /><span>{item.label}</span>{item.id === "inquiries" && newInquiries > 0 && <span className="cms-nav-badge">{newInquiries}</span>}</button>)}</nav><div className="cms-sidebar-bottom"><a href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={17} />Website öffnen</a><button type="button" disabled={busy === "logout"} onClick={() => void logout()}><LogOut size={17} />{busy === "logout" ? "Wird abgemeldet …" : "Abmelden"}</button><div className="cms-session"><span />Angemeldet als Kanzlei</div></div></aside><div className="cms-workspace" inert={tourOpen || drawerOpen}><header className="cms-app-header"><div><IconButton className="cms-nav-toggle" label="Hauptmenü öffnen" aria-expanded={drawerOpen} aria-controls="cms-admin-navigation" aria-haspopup="dialog" onClick={event => { navOpener.current = event.currentTarget; setMobileNav(true); }}><Menu size={21} /></IconButton><span>Hagn & Partner</span><span className="cms-header-separator">/</span><strong>{nav.find(item => item.id === view)?.label}</strong></div><div className="cms-header-end"><span className="cms-environment">{data.system.mode === "development" ? "Entwicklungsumgebung" : "Website-Verwaltung"}</span><span className="cms-avatar" aria-label="Kanzlei-Zugang">HP</span></div></header>{conflict && <Notice tone="error"><div className="cms-conflict"><span>Der Entwurf wurde in einer anderen Sitzung geändert. Laden Sie den aktuellen Stand neu, um unbeabsichtigtes Überschreiben zu vermeiden.</span><Button onClick={() => { if (!dirty || window.confirm("Beim Neuladen gehen die ungespeicherten Änderungen dieser Sitzung verloren. Aktuellen Stand laden?")) window.location.reload(); }}>Aktuellen Stand laden</Button></div></Notice>}<main id="cms-main" className={`cms-main ${(view === "editor" || view === "blog") ? "cms-main--editor" : ""}`} tabIndex={-1}>{view === "dashboard" && <Dashboard onStartTour={()=>setTourOpen(true)} data={{...data,settings:{...data.settings,onboardingComplete:tourComplete}}} content={content} dirty={dirty} onNavigate={navigate} onCompleteOnboarding={async () => closeTour()} />}{view === "editor" && <PageEditor content={content} cmsState={data.state} onChange={updateContent} media={data.media} onUpload={upload} dirty={dirty} busy={busy} onSave={saveDraft} onPublish={publish} onRestore={restore} undo={undo} redo={redo} canUndo={historyState.undo} canRedo={historyState.redo} />}{view === "blog" && <div className="cms-blog-view" inert={busy === "blog" || busy === "blog-save"}><BlogManager content={content} onChange={updateContent} media={data.media} onUpload={upload} onSave={saveBlog} onAction={blogAction} busy={Boolean(busy)} dirty={dirty} /></div>}{view === "media" && <MediaManager media={data.media} onUpload={upload} onUpdate={updateMedia} onDelete={deleteMedia} />}{view === "inquiries" && <InquiryInbox inquiries={data.inquiries} onUpdate={updateInquiry} onDelete={deleteInquiry} />}{view === "settings" && <SiteSettingsPanel onStartTour={()=>setTourOpen(true)} config={content.config} settings={data.settings} onConfigChange={config => updateContent({ ...content, config })} onSaveConfig={saveDraft} configDirty={dirty} configBusy={busy === "save"} onSaveSettings={saveSettings} onDirtyChange={setSettingsDirty} />}{view === "help" && <HelpPanel onNavigate={navigate} onStartTour={()=>setTourOpen(true)} />}</main></div>{tourOpen && <GuidedTour onNavigate={navigate} onClose={closeTour} />}<div className="cms-toasts" aria-live="polite" aria-relevant="additions">{toasts.map(item => <div key={item.id} role={item.error ? "alert" : "status"} className={`cms-toast ${item.error ? "cms-toast--error" : ""}`}><span>{item.text}</span><IconButton label="Meldung schließen" onClick={() => setToasts(previous => previous.filter(toast => toast.id !== item.id))}><X size={15} /></IconButton></div>)}</div></div></AdminLinkProvider>;
}
