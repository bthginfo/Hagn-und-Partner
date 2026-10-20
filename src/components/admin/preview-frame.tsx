"use client";
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {Expand,ScanLine} from 'lucide-react';

/** A desktop stays 1440px wide even between the outline and inspector. */
export function PreviewFrame({device,children}:{device:'desktop'|'mobile';children:ReactNode}){
  const root=useRef<HTMLDivElement>(null);const documentRef=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(0);const [height,setHeight]=useState(900);const [actual,setActual]=useState(false);
  const target=device==='desktop'?1440:390;const scale=actual?1:Math.min(1,(width||target)/target);
  useEffect(()=>{const host=root.current,doc=documentRef.current;if(!host||!doc)return;const observer=new ResizeObserver(()=>{setWidth(host.clientWidth);setHeight(doc.offsetHeight);});observer.observe(host);observer.observe(doc);return()=>observer.disconnect();},[]);
  useEffect(()=>setActual(false),[device]);
  const spaceWidth=Math.max(width,target*scale);const offset=Math.max(0,(spaceWidth-target*scale)/2);
  return <div className="cms-preview-frame" ref={root} data-preview-scale={actual?'actual':'fit'}><div className="cms-preview-scale-tools" role="group" aria-label="Vorschaugröße"><span>{device==='desktop'?'Desktop · 1440 px':'Smartphone · 390 px'}</span><button type="button" aria-pressed={!actual} onClick={()=>setActual(false)} title="Die ganze Seitenbreite passend anzeigen"><ScanLine size={14}/>Einpassen</button><button type="button" aria-pressed={actual} onClick={()=>setActual(true)} title="In Originalgröße bearbeiten; der Bereich lässt sich seitlich scrollen"><Expand size={14}/>100 %</button></div><p className="cms-preview-zoom-hint">{actual?'Originalgröße. Mit „Einpassen“ sehen Sie wieder die ganze Seitenbreite.':'Die ganze Seitenbreite ist eingepasst. Mit „100 %“ bearbeiten Sie Details in Originalgröße.'}</p><div className="cms-preview-scaled-space" style={{width:spaceWidth,height:height*scale}}><div ref={documentRef} className={`cms-preview-document cms-preview-document--${device}`} style={{width:target,minWidth:target,maxWidth:target,minHeight:0,margin:0,left:offset,visibility:width?'visible':'hidden',transform:`scale(${scale})`,transformOrigin:'top left','--cms-preview-inverse-scale':1/scale} as CSSProperties}>{children}</div></div></div>;
}
