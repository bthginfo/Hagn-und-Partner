"use client";

import { useEffect, useRef, useState } from "react";
import { Accessibility, ArrowDown, ArrowRight, ArrowUpRight, Award, Baby, BadgeCheck, Bike, BookMarked, BookOpen, BriefcaseBusiness, Building2, CalendarCheck2, CalendarDays, Camera, Car, Check, CircleAlert, CircleCheck, Euro, CircleHelp, Clock3, Columns3, Compass, CreditCard, Download, ExternalLink, Eye, Factory, FileCheck2, Files, FileText, Fingerprint, Flag, FolderOpen, Gavel, Globe, GraduationCap, Hammer, HandHeart, Handshake, HardHat, HeartHandshake, HeartPulse, Hourglass, House, Image, Images, Info, KeyRound, Landmark, Languages, LayoutGrid, Leaf, LifeBuoy, Lightbulb, Link, ListChecks, LockKeyhole, Mail, MapPin, MessageSquare, MessagesSquare, Monitor, Network, Phone, Plane, ReceiptText, Route, Scale, Search, Send, Shield, ShieldCheck, Siren, Smartphone, Store, Target, Timer, TrainFront, TrendingUp, Truck, Umbrella, Upload, UserRound, UsersRound, Video, Wallet, Wrench, type LucideIcon } from "lucide-react";
import { Button, EmptyState, Modal, SearchField } from "./admin-ui";

type IconOption = { name: string; label: string; category: string; keywords: string; component: LucideIcon; aliases?: string[] };
const law = "Recht & Kanzlei", people = "Menschen & Gesundheit", contact = "Kontakt & Orientierung", work = "Arbeit & Wirtschaft", traffic = "Verkehr & Gebäude", media = "Dateien & Medien", workflow = "Abläufe & Übersicht";
export const iconOptions: IconOption[] = [
  { name: "Scale", label: "Waage", category: law, keywords: "recht gericht gerechtigkeit strafrecht", component: Scale },
  { name: "Gavel", label: "Richterhammer", category: law, keywords: "gericht urteil verfahren strafrecht", component: Gavel },
  { name: "Landmark", label: "Gerichtsgebäude", category: law, keywords: "recht behörde amt bank institution", component: Landmark },
  { name: "ShieldCheck", label: "Geprüfter Schutz", category: law, keywords: "sicherheit absicherung vertrauen versicherung", component: ShieldCheck, aliases: ["shieldcheck"] },
  { name: "Shield", label: "Schutzschild", category: law, keywords: "sicherheit versicherung verteidigung", component: Shield, aliases: ["shield"] },
  { name: "BookOpen", label: "Offenes Buch", category: law, keywords: "wissen recht gesetze literatur", component: BookOpen },
  { name: "BookMarked", label: "Gesetzbuch", category: law, keywords: "recht wissen nachschlagen vertrag", component: BookMarked },
  { name: "GraduationCap", label: "Ausbildung", category: law, keywords: "studium wissenschaft qualifikation", component: GraduationCap },
  { name: "Award", label: "Auszeichnung", category: law, keywords: "qualifikation urkunde fortbildung", component: Award },
  { name: "BadgeCheck", label: "Bestätigt", category: law, keywords: "prüfung qualifikation anerkannt", component: BadgeCheck },
  { name: "LockKeyhole", label: "Vertraulichkeit", category: law, keywords: "datenschutz privat sicherheit schloss", component: LockKeyhole },
  { name: "KeyRound", label: "Schlüssel", category: law, keywords: "zugang miete vermietung eigentum", component: KeyRound },
  { name: "Fingerprint", label: "Fingerabdruck", category: law, keywords: "identität datenschutz strafrecht", component: Fingerprint },
  { name: "UsersRound", label: "Menschen", category: people, keywords: "team familie gemeinsam gruppe kollegen", component: UsersRound, aliases: ["users", "family", "usersround"] },
  { name: "UserRound", label: "Person", category: people, keywords: "mensch ansprechpartner mitarbeiter anwalt", component: UserRound },
  { name: "HeartHandshake", label: "Persönliche Begleitung", category: people, keywords: "familienrecht beratung scheidung trennung sorgerecht", component: HeartHandshake, aliases: ["heart", "family", "hearthandshake"] },
  { name: "Handshake", label: "Handschlag", category: people, keywords: "einigung zusammenarbeit vertrag vereinbarung", component: Handshake },
  { name: "HandHeart", label: "Unterstützung", category: people, keywords: "hilfe begleitung fürsorge unterhalt", component: HandHeart },
  { name: "Baby", label: "Kind", category: people, keywords: "familie sorgerecht kinder eltern", component: Baby },
  { name: "Accessibility", label: "Barrierefreiheit", category: people, keywords: "zugang inklusion menschen behinderung", component: Accessibility },
  { name: "HeartPulse", label: "Gesundheit", category: people, keywords: "medizin arzt krankheit unfall schaden", component: HeartPulse },
  { name: "Umbrella", label: "Absicherung", category: people, keywords: "versicherung schutz vorsorge", component: Umbrella },
  { name: "LifeBuoy", label: "Hilfe", category: people, keywords: "rettung unterstützung notfall", component: LifeBuoy },
  { name: "Phone", label: "Telefon", category: contact, keywords: "anrufen rückruf kontakt nummer", component: Phone, aliases: ["phone"] },
  { name: "Mail", label: "E-Mail", category: contact, keywords: "kontakt brief nachricht schreiben", component: Mail, aliases: ["mail"] },
  { name: "MessageSquare", label: "Gespräch", category: contact, keywords: "beratung nachricht chat antwort", component: MessageSquare, aliases: ["message"] },
  { name: "MessagesSquare", label: "Austausch", category: contact, keywords: "gespräch besprechung dialog", component: MessagesSquare },
  { name: "Send", label: "Nachricht senden", category: contact, keywords: "kontakt e-mail absenden", component: Send },
  { name: "MapPin", label: "Standort", category: contact, keywords: "adresse ort anfahrt ingolstadt", component: MapPin, aliases: ["map-pin", "mappin"] },
  { name: "Globe", label: "Welt", category: contact, keywords: "international internet web weltweit", component: Globe },
  { name: "Languages", label: "Sprachen", category: contact, keywords: "deutsch englisch übersetzung mehrsprachig", component: Languages },
  { name: "Compass", label: "Orientierung", category: contact, keywords: "richtung wegweiser beratung navigieren", component: Compass },
  { name: "Route", label: "Weg", category: contact, keywords: "anfahrt planung ablauf schritte", component: Route },
  { name: "Flag", label: "Zielmarke", category: contact, keywords: "ziel erreichen standort start", component: Flag },
  { name: "BriefcaseBusiness", label: "Beruf & Arbeit", category: work, keywords: "arbeitsrecht kündigung abmahnung arbeitgeber arbeitnehmer", component: BriefcaseBusiness, aliases: ["briefcase", "work", "briefcasebusiness"] },
  { name: "Network", label: "Zusammenarbeit", category: work, keywords: "netzwerk gesellschaft organisation firmen", component: Network },
  { name: "Store", label: "Geschäft", category: work, keywords: "handel gewerbe laden geschäftsraum", component: Store },
  { name: "Factory", label: "Unternehmen", category: work, keywords: "industrie betrieb firma arbeit wirtschaft", component: Factory },
  { name: "Wallet", label: "Geldbeutel", category: work, keywords: "vermögen geld zahlung kosten", component: Wallet },
  { name: "Euro", label: "Euro", category: work, keywords: "geld kosten gebühren honorar lohn unterhalt", component: Euro },
  { name: "CreditCard", label: "Zahlung", category: work, keywords: "geld überweisung kreditkarte kosten", component: CreditCard },
  { name: "ReceiptText", label: "Abrechnung", category: work, keywords: "rechnung honorar gebühren kosten nebenkosten", component: ReceiptText },
  { name: "TrendingUp", label: "Entwicklung", category: work, keywords: "wirtschaft wachstum verlauf zahlen", component: TrendingUp },
  { name: "Car", label: "Auto", category: traffic, keywords: "verkehrsrecht unfall bußgeld führerschein fahrzeug", component: Car },
  { name: "Bike", label: "Fahrrad", category: traffic, keywords: "verkehr unfall rad mobilität", component: Bike },
  { name: "Truck", label: "Lastwagen", category: traffic, keywords: "verkehr transport logistik fahrzeug", component: Truck },
  { name: "TrainFront", label: "Bahn", category: traffic, keywords: "reise verkehr zug transport", component: TrainFront },
  { name: "Plane", label: "Flugzeug", category: traffic, keywords: "reise urlaub flug verkehr", component: Plane },
  { name: "House", label: "Haus", category: traffic, keywords: "mietrecht wohnungseigentum immobilien wohnen vermieter", component: House, aliases: ["home", "house"] },
  { name: "Building2", label: "Gebäude", category: traffic, keywords: "immobilien geschäft büro hausverwaltung", component: Building2, aliases: ["building", "business", "building2"] },
  { name: "HardHat", label: "Bauhelm", category: traffic, keywords: "bauen baurecht bauvertrag handwerker arbeitsschutz", component: HardHat },
  { name: "Hammer", label: "Handwerk", category: traffic, keywords: "bauen reparatur handwerker vertrag", component: Hammer },
  { name: "Wrench", label: "Werkzeug", category: traffic, keywords: "reparatur handwerker werkvertrag", component: Wrench },
  { name: "Leaf", label: "Blatt", category: traffic, keywords: "natur umwelt nachhaltigkeit garten", component: Leaf },
  { name: "FileText", label: "Dokument", category: media, keywords: "text vertrag brief formular unterlagen akte", component: FileText, aliases: ["document", "file", "filetext"] },
  { name: "Files", label: "Unterlagen", category: media, keywords: "dokumente mehrere akten papiere", component: Files },
  { name: "FileCheck2", label: "Geprüftes Dokument", category: media, keywords: "vertrag dokument prüfen genehmigen", component: FileCheck2 },
  { name: "FolderOpen", label: "Akte", category: media, keywords: "ordner dokumente unterlagen ablage", component: FolderOpen },
  { name: "Camera", label: "Kamera", category: media, keywords: "foto aufnehmen bild dokumentation", component: Camera },
  { name: "Image", label: "Bild", category: media, keywords: "foto medien datei", component: Image, aliases: ["image"] },
  { name: "Images", label: "Galerie", category: media, keywords: "fotos bilder medien sammlung", component: Images },
  { name: "Video", label: "Video", category: media, keywords: "film medien aufnahme", component: Video },
  { name: "Monitor", label: "Bildschirm", category: media, keywords: "desktop computer digital online", component: Monitor },
  { name: "Smartphone", label: "Smartphone", category: media, keywords: "mobil telefon handy digital", component: Smartphone },
  { name: "Download", label: "Herunterladen", category: media, keywords: "datei speichern formular pdf download", component: Download },
  { name: "Upload", label: "Hochladen", category: media, keywords: "datei bild senden upload", component: Upload },
  { name: "Link", label: "Verknüpfung", category: media, keywords: "link adresse internet verweis", component: Link, aliases: ["link"] },
  { name: "ExternalLink", label: "Externer Link", category: media, keywords: "website öffnen verweis neu", component: ExternalLink },
  { name: "CalendarDays", label: "Kalender", category: workflow, keywords: "termin datum frist vereinbaren", component: CalendarDays, aliases: ["calendar", "calendardays"] },
  { name: "CalendarCheck2", label: "Vereinbarter Termin", category: workflow, keywords: "termin bestätigung datum kalender", component: CalendarCheck2 },
  { name: "Clock3", label: "Uhrzeit", category: workflow, keywords: "zeit öffnungszeiten bürozeiten frist", component: Clock3, aliases: ["clock", "clock3"] },
  { name: "Timer", label: "Zeitspanne", category: workflow, keywords: "dauer zeit frist ablauf", component: Timer },
  { name: "Hourglass", label: "Wartezeit", category: workflow, keywords: "frist zeit dauer sanduhr", component: Hourglass },
  { name: "ListChecks", label: "Checkliste", category: workflow, keywords: "liste punkte prüfen erledigen", component: ListChecks, aliases: ["list"] },
  { name: "LayoutGrid", label: "Übersicht", category: workflow, keywords: "karten raster ansicht inhalte", component: LayoutGrid, aliases: ["square", "layers"] },
  { name: "Columns3", label: "Spalten", category: workflow, keywords: "aufteilung ansicht gegenüberstellung", component: Columns3, aliases: ["columns"] },
  { name: "Target", label: "Ziel", category: workflow, keywords: "vorhaben ergebnis planung strategie", component: Target },
  { name: "Lightbulb", label: "Gedanke", category: workflow, keywords: "idee lösung wissen beratung", component: Lightbulb },
  { name: "Search", label: "Suche", category: workflow, keywords: "finden prüfen recherche untersuchen", component: Search },
  { name: "Eye", label: "Blick", category: workflow, keywords: "sehen prüfen sichtbar übersicht", component: Eye },
  { name: "Check", label: "Häkchen", category: workflow, keywords: "erledigt richtig bestätigung ja", component: Check, aliases: ["check"] },
  { name: "CircleCheck", label: "Abgeschlossen", category: workflow, keywords: "erledigt geprüft bestätigung", component: CircleCheck },
  { name: "CircleHelp", label: "Frage", category: workflow, keywords: "hilfe faq frage antwort", component: CircleHelp, aliases: ["help"] },
  { name: "Info", label: "Information", category: workflow, keywords: "hinweis wissen auskunft", component: Info },
  { name: "CircleAlert", label: "Wichtiger Hinweis", category: workflow, keywords: "achtung warnung frist wichtig", component: CircleAlert },
  { name: "Siren", label: "Dringlichkeit", category: workflow, keywords: "notfall dringend alarm frist", component: Siren },
  { name: "ArrowUpRight", label: "Pfeil nach rechts oben", category: workflow, keywords: "weiter öffnen link richtung", component: ArrowUpRight, aliases: ["arrow-up-right", "arrow", "arrowupright"] },
  { name: "ArrowRight", label: "Pfeil nach rechts", category: workflow, keywords: "weiter nächster schritt richtung", component: ArrowRight },
  { name: "ArrowDown", label: "Pfeil nach unten", category: workflow, keywords: "unten weiter richtung ablauf", component: ArrowDown },
];

const normalize = (value: string) => value.toLocaleLowerCase("de").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll("ß", "ss").replace(/[-_]/g, " ");
export function iconOption(value?: string) { if (!value) return undefined; const key = normalize(value).replaceAll(" ", ""); return iconOptions.find(option => [option.name, ...(option.aliases || [])].some(name => normalize(name).replaceAll(" ", "") === key)); }
export function LibraryIcon({ name, size = 20 }: { name?: string; size?: number }) { if (name === "none") return <span className="cms-icon-none" aria-hidden="true" />; const Component = iconOption(name)?.component || ArrowUpRight; return <Component size={size} strokeWidth={1.6} aria-hidden="true" />; }

export function IconPicker({ value, onSelect, onClose }: { value?: string; onSelect: (name: string | undefined) => void; onClose: () => void }) {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("Alle"); const root = useRef<HTMLDivElement>(null); const selected = iconOption(value);
  useEffect(() => { const timer = setTimeout(() => root.current?.querySelector<HTMLInputElement>("input")?.focus(), 0); return () => clearTimeout(timer); }, []);
  const categories = ["Alle", ...Array.from(new Set(iconOptions.map(option => option.category)))]; const terms = normalize(query).trim().split(/\s+/).filter(Boolean); const filtered = iconOptions.filter(option => (category === "Alle" || option.category === category) && terms.every(term => normalize(`${option.label} ${option.name} ${option.keywords}`).includes(term)));
  return <Modal title="Symbol auswählen" description="Suchen Sie nach einem Motiv oder Begriff, zum Beispiel Telefon, Arbeitsrecht oder Familie." onClose={onClose} wide footer={<><span className="cms-icon-picker-current">{selected ? <><LibraryIcon name={selected.name} size={17} />Aktuell: {selected.label}</> : "Kein Symbol ausgewählt"}</span><span className="cms-spacer" /><Button onClick={() => { onSelect(undefined); onClose(); }}>Ohne Symbol</Button><Button onClick={onClose}>Abbrechen</Button></>}><div ref={root}><SearchField value={query} onChange={setQuery} placeholder="Symbol suchen …" label="Symbolbibliothek durchsuchen" /><div className="cms-icon-picker-categories" role="group" aria-label="Symbolkategorie">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><div className="cms-icon-picker-count" role="status">{filtered.length} {filtered.length === 1 ? "Symbol" : "Symbole"}</div>{!filtered.length ? <EmptyState title="Kein passendes Symbol">Versuchen Sie einen anderen Begriff oder wählen Sie „Alle“.</EmptyState> : <div className="cms-icon-picker-grid">{filtered.map(option => <button type="button" key={option.name} aria-pressed={selected?.name === option.name} onClick={() => { onSelect(option.name); onClose(); }}><option.component size={27} strokeWidth={1.5} aria-hidden="true" /><span>{option.label}</span>{selected?.name === option.name && <Check className="cms-icon-picker-check" size={14} />}</button>)}</div>}</div></Modal>;
}

export function IconPickerField({ value, onChange }: { value?: string; onChange: (name: string | undefined) => void }) { const [open, setOpen] = useState(false); return <div className="cms-field"><span className="cms-label">Symbol</span><Button className="cms-icon-picker-field" onClick={() => setOpen(true)}><LibraryIcon name={value} size={22} /><span>{value === "none" ? "Ohne Symbol" : value ? iconOption(value)?.label || "Symbol ändern" : "Symbol auswählen"}</span></Button>{open && <IconPicker value={value} onSelect={onChange} onClose={() => setOpen(false)} />}</div>; }
