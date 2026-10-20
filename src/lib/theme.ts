import type {ColorPalette,DesignVariant,SiteConfig} from './types';
export const variantNames:Record<DesignVariant,string>={1:'Panorama',2:'Magazin',3:'Fotobühne',4:'Noir',5:'Navy'};
export const defaultPalettes:Record<DesignVariant,ColorPalette>={
  1:{primary:'#142b27',accent:'#d6f478',background:'#f4f5f0',text:'#142b27',surface:'#e8ece4',border:'#c5cfc5'},
  2:{primary:'#2c40ef',accent:'#ffe65a',background:'#fdfdfb',text:'#2c40ef',surface:'#efeffa',border:'#b4b9ec'},
  3:{primary:'#211c55',accent:'#f8d8ed',background:'#f6f3fc',text:'#211c55',surface:'#e2ddef',border:'#837b9d'},
  4:{primary:'#080b0d',accent:'#d7a877',background:'#080b0d',text:'#eef0e8',surface:'#151b1e',border:'#3b4549'},
  5:{primary:'#09456e',accent:'#95ceef',background:'#081728',text:'#f4f7ff',surface:'#102a41',border:'#35566d'},
};
export function paletteFor(site:SiteConfig,variant:DesignVariant):ColorPalette{return site.theme.palettes?.[variant]??(variant===1?{...defaultPalettes[1],primary:site.theme.primary,accent:site.theme.accent,background:site.theme.background,text:site.theme.primary}:defaultPalettes[variant]);}
export function contrastRatio(first:string,second:string){
  function luminance(hex:string){const value=hex.replace('#','');const full=value.length===3?value.split('').map(char=>char+char).join(''):value;const rgb=[0,2,4].map(index=>parseInt(full.slice(index,index+2),16)/255).map(channel=>channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
  const [a,b]=[luminance(first),luminance(second)].sort((a,b)=>b-a);return(a+.05)/(b+.05);
}
export function readableText(background:string){return contrastRatio('#142b27',background)>=contrastRatio('#ffffff',background)?'#142b27':'#ffffff';}
