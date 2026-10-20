// Optional German word breaks for browsers without a German hyphenation dictionary.
// They affect display only; saved content and all editable field values stay intact.
const compounds = [
  "Tätigkeits|schwerpunkte", "Tätigkeits|schwerpunkt", "Gesprächs|terminen", "Gesprächs|termine", "Gesprächs|termin",
  "Datenschutz|hinweise", "Datenschutz|erklärung", "Rechts|schutz|versicherung", "Rechts|schutz|versicherungen",
  "Ordnungs|widrigkeiten|recht", "Ordnungs|widrigkeiten", "Verkehrs|recht", "Wohnungs|eigentums|recht",
  "Immobilien|recht", "Gesell|schafts|recht", "Handels|recht", "Arbeits|recht", "Familien|recht", "Vertrags|recht",
  "Versicherungs|recht", "Verwaltungs|recht", "Insolvenz|recht", "Wirtschafts|recht", "Grundstücks|recht",
  "Rechts|anwältinnen", "Rechts|anwälten", "Rechts|anwälte", "Rechts|anwältin", "Rechts|anwalt",
  "Fach|anwältinnen", "Fach|anwälten", "Fach|anwälte", "Fach|anwältin", "Fach|anwalt",
  "Berufs|haftpflicht|versicherung", "Geschäfts|bedingungen", "Kosten|übernahme", "Schadens|ersatz", "Schaden|ersatz",
  "Öffnungs|zeiten", "Kontakt|möglichkeiten", "Ansprech|partner", "Zusammen|arbeit", "Qualifi|kationen",
  "Über|zeugung", "Forderungs|management", "Opfer|vertretung", "Zwangs|verwaltung",
  "Muster|widerrufs|formular", "Prozess|kosten|hilfe", "Rechts|anwalts|vergütung",
];
const breaks = new Map(compounds.map(word => [word.replaceAll("|", "").toLocaleLowerCase("de"), word.split("|").map(part => part.length)]));
const pattern = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${[...breaks.keys()].sort((a, b) => b.length - a.length).join("|")})(?![\\p{L}\\p{N}_])`, "giu");
const protectedText = /(https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[a-z]{2,})/gi;

export function textWithBreaks(value?: string) {
  if (!value) return value;
  return value.split(protectedText).map((part, index) => index % 2 ? part : part.replace(pattern, word => {
    const lengths = breaks.get(word.toLocaleLowerCase("de"));
    if (!lengths) return word;
    let offset = 0;
    return lengths.map(length => { const piece = word.slice(offset, offset + length); offset += length; return piece; }).join("\u00ad");
  })).join("");
}
