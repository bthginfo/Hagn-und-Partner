"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { findSettingAreas } from "@/lib/admin-settings-search";
import "./settings-area-nav.css";

type Area<Id extends string> = { id: Id; title: string };
export function SettingsAreaNav<Id extends string>({
 areas, active, onSelect, translate = value => value,
}: { areas: readonly Area<Id>[]; active: Id; onSelect: (id:Id)=>void; translate?: (value:string)=>string }) {
 const [query,setQuery]=useState("");
 const visible=findSettingAreas(areas.map(area=>({...area,title:translate(area.title)})),query);
 return <nav className="cms-settings-nav cms-settings-area-nav" aria-label={translate("Einstellungsbereiche")}>
  <label className="cms-settings-search"><Search size={16} aria-hidden="true"/>
    <input type="search" aria-label={translate("Einstellungen suchen")} placeholder={translate("Einstellungen suchen")}
      value={query} onChange={event=>setQuery(event.target.value)} onKeyDown={event=>{
        if(event.key==="Escape"){event.preventDefault();setQuery("");}
        if(event.key==="Enter"&&visible.length===1){event.preventDefault();onSelect(visible[0].id);setQuery("");}
      }} />
    {query&&<button type="button" aria-label={translate("Suche leeren")} onClick={()=>setQuery("")}><X size={15}/></button>}
  </label>
  {!visible.length&&<p role="status">{translate("Keine passenden Einstellungen.")}</p>}
  {visible.map(area=><button type="button" key={area.id} aria-current={active===area.id?"page":undefined} onClick={()=>{onSelect(area.id);setQuery("");}}>{area.title}</button>)}
 </nav>;
}
