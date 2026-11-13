type SettingArea = { id: string; title: string };
const terms: Record<string, string> = {
 general: "name website adresse domain sprache language zeitzone module social studio planer newsletter ki shop buchung reservierung speisekarte backup",
 app: "app installieren favicon icon symbole push benachrichtigung notification",
 contact: "kontakt contact telefon phone e-mail anschrift adresse zeiten hours öffnung öffnungszeiten",
 navigation: "menü menu link footer fußbereich header",
 branding: "logo brand icon bildmarke favicon",
 design: "farben color schrift font größe typografie abstände layout",
 privacy: "cookies einwilligung consent tracking google analytics matomo statistik datenschutz privacy",
 email: "email e-mail smtp versand test mail postfach templates vorlagen",
 security: "passwort password konto login sicherheit rollen team zugang",
 profile: "name unternehmen studio adresse kontakt telefon ansprechpartner website",
 site: "name website sprache language domain firma datensicherung",
 billing: "rechnung bank iban umsatzsteuer steuern billing",
 copy: "texte beschriftungen formular button",
 labels: "texte beschriftungen formular button",
 blog: "beiträge artikel journal blog übersicht",
 footer: "fußbereich footer link",
 content: "recht impressum datenschutz journal blog",
 legal: "recht impressum datenschutz",
 theme: "farben color schrift font größe typografie abstände layout",
 retention: "aufbewahrung löschung frist",
 backup: "sicherung wiederherstellung export import backup",
};
function normalize(text:string) {
 return text.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("de").replaceAll("ß","ss");
}
export function findSettingAreas<T extends SettingArea>(areas:readonly T[], query:string) {
 const words=normalize(query).trim().split(/\s+/).filter(Boolean);
 if(!words.length)return areas;
 return areas.filter(area=>{
  const text=normalize(area.title+" "+(terms[area.id]??""));
  return words.every(word=>text.includes(word));
 });
}
