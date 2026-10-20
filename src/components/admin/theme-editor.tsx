"use client";

import {useState} from 'react';
import {Check,Palette,RotateCcw} from 'lucide-react';
import type {ColorPalette,DesignVariant,SectionDesign,SiteConfig} from '@/lib/types';
import {contrastRatio,defaultPalettes,paletteFor,readableText,variantNames} from '@/lib/theme';
import {Button,Field,Notice,Select,Toggle} from './admin-ui';
import {ColorField} from './color-field';

const labels:Record<keyof ColorPalette,string>={primary:'Markenfarbe',accent:'Akzentfarbe',background:'Seitenhintergrund',text:'Textfarbe',surface:'Zusätzliche Flächen',border:'Linien und Rahmen'};
export function ThemeEditor({config,onChange}:{config:SiteConfig;onChange:(config:SiteConfig)=>void}){
  const [variant,setVariant]=useState<DesignVariant>(config.designVariant??1);
  const palette=paletteFor(config,variant);const contrast=contrastRatio(palette.text,palette.background);
  function update(patch:Partial<ColorPalette>){onChange({...config,theme:{...config.theme,palettes:{...config.theme.palettes,[variant]:{...palette,...patch}}}});}
  function reset(){const palettes={...config.theme.palettes};delete palettes[variant];onChange({...config,theme:{...config.theme,palettes}});}
  return <div className="cms-theme-editor"><div className="cms-form-section"><h3>Gestaltung der Website</h3><Field label="Standard-Entwurf" hint="Diese Gestaltung wird für Besucher vorausgewählt. Während der Entwurfsphase kann sie über den Umschalter gewechselt werden."><Select value={config.designVariant??1} onChange={event=>{const next=Number(event.target.value) as DesignVariant;onChange({...config,designVariant:next});setVariant(next);}}>{([1,2,3,4,5] as DesignVariant[]).map(value=><option value={value} key={value}>{value} · {variantNames[value]}</option>)}</Select></Field></div>
    <div className="cms-form-section"><div className="cms-inline-heading"><h3>Farben für die ganze Website</h3><Palette size={21}/></div><p>Wählen Sie einen Entwurf und passen Sie seine Farben an. Abschnitte ohne eigene Farben übernehmen diese Einstellungen.</p><Field label="Farben dieses Entwurfs bearbeiten"><Select value={variant} onChange={event=>setVariant(Number(event.target.value) as DesignVariant)}>{([1,2,3,4,5] as DesignVariant[]).map(value=><option value={value} key={value}>{value} · {variantNames[value]}</option>)}</Select></Field>
      <div className="cms-palette-presets" role="group" aria-label="Farbpalette übernehmen">{([1,2,3,4,5] as DesignVariant[]).map(value=><button type="button" key={value} onClick={()=>update(defaultPalettes[value])} aria-label={`${variantNames[value]}-Farben übernehmen`}><span>{Object.values(defaultPalettes[value]).slice(0,4).map((color,index)=><i key={index} style={{background:color}}/>)}</span>{variantNames[value]}</button>)}</div>
      <div className="cms-palette-workspace"><div className="cms-palette-fields">{(Object.keys(labels) as (keyof ColorPalette)[]).map(key=><ColorField key={key} label={labels[key]} value={palette[key]} onChange={value=>{if(value&&/^#[\da-f]{6}$/i.test(value))update({[key]:value,...(key==='primary'&&palette.text===palette.primary?{text:value}:{})});}}/>)}</div><div className="cms-palette-live-preview" style={{background:palette.background,color:palette.text,borderColor:palette.border}}><div style={{borderColor:palette.border}}>{config.name}<span style={{background:palette.accent}}/></div><strong>Ein guter erster Eindruck.</strong><p>So wirken Ihre Farben bei Texten, Flächen und Schaltflächen zusammen.</p><div className="cms-palette-sample-card" style={{background:palette.surface,borderColor:palette.border}}>Eine zusätzliche Inhaltsfläche.</div><span className="cms-palette-sample-button" style={{background:palette.accent,color:readableText(palette.accent)}}>Kontakt aufnehmen <Check size={15}/></span></div></div>
      {contrast<4.5?<Notice tone="error">Text und Hintergrund haben zu wenig Kontrast ({contrast.toFixed(1)}:1).<Button onClick={()=>update({text:readableText(palette.background)})}>Gut lesbare Textfarbe wählen</Button></Notice>:<p className="cms-palette-contrast"><Check size={16}/>Textkontrast {contrast.toFixed(1)}:1 · gut lesbar</p>}
      <Button variant="quiet" onClick={reset}><RotateCcw size={15}/>Originalfarben dieses Entwurfs wiederherstellen</Button>
    </div></div>;
}

export function SectionColorEditor({design,onChange}:{design:SectionDesign;onChange:(design:SectionDesign)=>void}){
  const [expanded,setExpanded]=useState(Boolean(design.background||design.textColor||design.accentColor));
  const contrast=design.background&&design.textColor&&/^#[\da-f]{6}$/i.test(design.background)&&/^#[\da-f]{6}$/i.test(design.textColor)?contrastRatio(design.textColor,design.background):undefined;
  function update(patch:Partial<SectionDesign>){onChange({...design,...patch});}
  function reset(){update({background:undefined,textColor:undefined,accentColor:undefined});setExpanded(false);}
  return <div className="cms-section-colors"><Toggle label="Eigene Farben für diesen Abschnitt" checked={expanded} onChange={value=>{if(value)setExpanded(true);else reset();}} hint="Ausgeschaltet übernimmt der Abschnitt die globalen Farben seines Farbschemas."/>{expanded&&<><div className="cms-section-color-preview" style={{background:design.background||'#f4f5f0',color:design.textColor||'#142b27'}}><strong>Ihr Abschnitt</strong><span style={{background:design.accentColor||'#d6f478'}}/></div><ColorField label="Hintergrund" value={design.background} fallback="#f4f5f0" optional onChange={value=>update({background:value})}/><ColorField label="Textfarbe" value={design.textColor} optional onChange={value=>update({textColor:value})}/><ColorField label="Akzentfarbe" value={design.accentColor} fallback="#d6f478" optional onChange={value=>update({accentColor:value})}/>{contrast!==undefined&&contrast<4.5&&<Notice tone="error">Diese Farben sind schwer zu lesen.<Button onClick={()=>update({textColor:readableText(design.background!)})}>Textfarbe passend wählen</Button></Notice>}<Button variant="quiet" onClick={reset}><RotateCcw size={14}/>Globale Farben übernehmen</Button></>}</div>;
}
