"use client";
import {useEffect,useState} from 'react';
import {Input} from './admin-ui';
export function ColorField({label,value,onChange,fallback='#142b27',optional=false}:{label:string;value?:string;onChange:(value:string|undefined)=>void;fallback?:string;optional?:boolean}){
  const [hex,setHex]=useState(value||'');useEffect(()=>setHex(value||''),[value]);
  const display=/^#[\da-f]{6}$/i.test(value||'')?value!:fallback;
  return <div className="cms-field"><div className="cms-inline-heading"><span className="cms-label">{label}</span>{optional&&value&&<button type="button" className="cms-reset-link" onClick={()=>onChange(undefined)}>Zurücksetzen</button>}</div><div className="cms-color-field"><input type="color" aria-label={`${label} auswählen`} value={display} onChange={event=>onChange(event.target.value)}/><Input aria-label={`${label} als Farbcode`} placeholder={optional?'Aus globaler Palette':fallback} maxLength={7} value={hex} onChange={event=>{const next=event.target.value;setHex(next);if(/^#[\da-f]{6}$/i.test(next))onChange(next);else if(!next&&optional)onChange(undefined);}} onBlur={()=>{if(hex&&!/^#[\da-f]{6}$/i.test(hex))setHex(value||'');}}/></div></div>;
}
