"use client";
import {useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {Expand,ScanLine} from 'lucide-react';

export const previewWidths = { desktop: 1440, tablet: 768, mobile: 390 } as const;
export type PreviewDevice = keyof typeof previewWidths;

export function usePreviewDevice() {
  const [automatic, setAutomatic] = useState<PreviewDevice>("desktop");
  const [override, setDevice] = useState<PreviewDevice>();
  useEffect(() => {
    const phone = matchMedia("(max-width: 600px)"), tablet = matchMedia("(max-width: 900px)");
    const sync = () => setAutomatic(phone.matches ? "mobile" : tablet.matches ? "tablet" : "desktop");
    sync();
    phone.addEventListener("change", sync); tablet.addEventListener("change", sync);
    return () => { phone.removeEventListener("change", sync); tablet.removeEventListener("change", sync); };
  }, []);
  return [override ?? automatic, setDevice] as const;
}

/** Measure an authored canvas without stretching it or changing the selected device width. */
export function PreviewFrame({device,children,controls=true}:{device:PreviewDevice;children:ReactNode;controls?:boolean}){
  const adminText = (label: string) => label;
  const root=useRef<HTMLDivElement>(null);const documentRef=useRef<HTMLDivElement>(null);
  const [width,setWidth]=useState(0);const [height,setHeight]=useState(900);const [actual,setActual]=useState(false);
  const originalSize=controls&&actual;
  const target=previewWidths[device];const scale=originalSize?1:Math.min(1,(width||target)/target);
  useEffect(()=>{const host=root.current,doc=documentRef.current;if(!host||!doc)return;const observer=new ResizeObserver(entries=>{
    for(const entry of entries){
      if(entry.target===host&&entry.contentRect.width>0)setWidth(entry.contentRect.width);
      if(entry.target===doc&&entry.contentRect.height>0)setHeight(entry.contentRect.height);
    }
  });observer.observe(host);observer.observe(doc);return()=>observer.disconnect();},[]);
  useEffect(()=>setActual(false),[device]);
  const spaceWidth=Math.max(width,target*scale);const offset=Math.max(0,(spaceWidth-target*scale)/2);
  return <div className="cms-preview-frame" ref={root} data-preview-scale={originalSize?'actual':'fit'}>{controls&&<><div className="cms-preview-scale-tools" role="group" aria-label={adminText("Vorschaugröße")}><span>{adminText(device==='desktop'?'Desktop · 1440 px':device==='tablet'?'Tablet · 768 px':"Smartphone · 390 px")}</span><button type="button" aria-pressed={!actual} onClick={()=>setActual(false)} title={adminText("Die ganze Seitenbreite passend anzeigen")}><ScanLine size={14}/>{adminText("Einpassen")}</button><button type="button" aria-pressed={actual} onClick={()=>setActual(true)} title={adminText("In Originalgröße bearbeiten; der Bereich lässt sich seitlich scrollen")}><Expand size={14}/>100 %</button></div><p className="cms-preview-zoom-hint">{actual?adminText("Originalgröße. Mit „Einpassen“ sehen Sie wieder die ganze Seitenbreite."):adminText("Die ganze Seitenbreite ist eingepasst. Mit „100 %“ bearbeiten Sie Details in Originalgröße.")}</p></>}<div className="cms-preview-scaled-space" style={{width:spaceWidth,height:height*scale}}><div ref={documentRef} className={`cms-preview-document cms-preview-document--${device}`} style={{width:target,minWidth:target,maxWidth:target,minHeight:0,margin:0,left:offset,visibility:width?'visible':'hidden',transform:`scale(${scale})`,transformOrigin:'top left','--cms-preview-inverse-scale':1/scale} as CSSProperties}>{children}</div></div></div>;
}
