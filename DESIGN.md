---
name: Hagn & Partner
description: Fünf eigenständige Gestaltungen mit einer gemeinsamen, direkt bearbeitbaren Inhaltsbasis.
colors:
  forest: "#142b27"
  paper: "#f4f5f0"
  lime: "#d6f478"
  editorial-blue: "#2c40ef"
  editorial-yellow: "#ffe65a"
  editorial-paper: "#fdfdfb"
  cinematic-ink: "#211c55"
  cinematic-pink: "#f8d8ed"
  cinematic-paper: "#f6f3fc"
  noir: "#080b0d"
  noir-paper: "#eef0e8"
  copper: "#d7a877"
  logo-blue: "#09456e"
  navy: "#081728"
  navy-surface: "#102a41"
  navy-text: "#f4f7ff"
  sky: "#95ceef"
  cms-muted: "#5c6b63"
  cms-line: "#dce3dc"
  danger: "#a8312b"
typography:
  display:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(4.5rem, 9.25cqi, 8.2rem)"
    fontWeight: 500
    lineHeight: 1.01
    letterSpacing: "-0.04em"
  editorial:
    fontFamily: "Bodoni Moda Variable, serif"
    fontSize: "clamp(3rem, 7cqi, 7rem)"
    fontWeight: 500
    lineHeight: 1.03
  cinematic:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(4rem, 11cqi, 10rem)"
    fontWeight: 600
    lineHeight: 0.95
  headline:
    fontFamily: "Manrope Variable, sans-serif"
    fontSize: "clamp(2.2rem, 4.35cqi, 4.3rem)"
    fontWeight: 550
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.65
  cms-body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "14px"
    lineHeight: 1.5
rounded:
  control: "5px"
  cms-control: "7px"
  surface: "12px"
  navy-surface: "16px"
spacing:
  small: "8px"
  control: "14px"
  group: "24px"
  section-compact: "clamp(36px, 5cqi, 76px)"
  section-normal: "clamp(72px, 8.5cqi, 138px)"
  section-airy: "clamp(88px, 11cqi, 176px)"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
    height: "52px"
  button-secondary:
    textColor: "{colors.forest}"
    rounded: "{rounded.control}"
    padding: "13px 20px"
    height: "52px"
  cms-button:
    backgroundColor: "{colors.forest}"
    textColor: "{colors.paper}"
    rounded: "{rounded.cms-control}"
    padding: "9px 14px"
    height: "39px"
  navy-card:
    backgroundColor: "{colors.navy-surface}"
    textColor: "{colors.navy-text}"
    rounded: "{rounded.navy-surface}"
---

# Design System: Hagn & Partner

## Overview

**Creative North Star: "Fünf Blickwinkel auf dieselbe Kanzlei"**

Die Website zeigt echte Menschen, Räume und fachliche Inhalte der Kanzlei. Fünf bewusst unterschiedliche Gestaltungen bieten eine Auswahl für die Entwurfsphase. Innerhalb jeder Gestaltung unterscheiden sich Startseite, Kanzlei, Team, Rechtsgebiete, Service und Kontakt auch in ihrer Komposition. Die Inhaltsbasis bleibt gemeinsam und vollständig im CMS bearbeitbar.

Die öffentliche Website darf bildgewaltig und ausdrucksstark sein. Die Verwaltung bleibt ruhig, vorhersehbar und auf verständliche Aufgaben ausgerichtet. Die Auswahl von Farben und Layouts benötigt keine CSS-Kenntnisse. Vorhandene Texte und Qualifikationen haben Vorrang vor dekorativen Behauptungen.

**Key Characteristics:**

- Echte Porträts mit bewusst gesetztem Bildausschnitt.
- Fünf eigenständige Welten statt eines gemeinsamen Rasters mit fünf Farben.
- Sichtbare Hierarchie, klare Kontaktwege und überschaubare Textabschnitte.
- Direkte Bearbeitung mit verständlichen Feldern, Vorschau und getrenntem Veröffentlichen.

## Colors

Die Grundpaletten stehen in `src/lib/theme.ts`. Panorama verbindet Papier, Waldgrün und einen hellen Akzent. Magazin nutzt Blau und Gelb. Fotobühne kombiniert tiefes Violett mit Rosa. Noir arbeitet mit schwarzen Flächen und warmen Akzenten; das räumliche § bleibt dunkel und zurückhaltend. Navy nimmt die echte Logofarbe auf und ergänzt sie um einen dunkleren Seitenhintergrund und einen hellen Blauakzent.

**The Palette Rule.** Globale Farben gelten je Entwurf. Abschnittsfarben sind ausdrückliche, zurücksetzbare Abweichungen. Text und Hintergrund werden gemeinsam auf Lesbarkeit geprüft.

Die CMS-Palette bleibt vom wechselnden Website-Entwurf unabhängig. Status- und Fehlerfarben haben eine feste Bedeutung; ein Fehler wird zusätzlich durch Text beschrieben.

## Typography

Manrope und DM Sans bilden die gemeinsame Basis. Bodoni Moda prägt die Magazinwelt; Barlow Condensed die Fotobühne. Alle Schriften werden lokal ausgeliefert. Große Schrift ist ein kompositorisches Mittel, darf aber keine echten Namen, Rechtsgebiete oder Schaltflächen abschneiden. Deutsche Worttrennung und responsive Größen berücksichtigen lange Begriffe.

**The Content Rule.** Die sichtbare Hierarchie folgt dem tatsächlichen Inhalt: eine erste H1 pro Seite, danach nachvollziehbare Abschnitte. Kleine Personenlabels im Hero sind keine künstlichen Unterabschnitte.

## Layout

Öffentliche Komponenten reagieren auf die Breite ihres eigenen Containers. Dadurch bleibt dieselbe Darstellung in der CMS-Vorschau verwendbar. Der Editor rendert echte 1440 bzw. 390 Pixel und skaliert die Vorschau bei Bedarf in den verfügbaren Arbeitsbereich.

Hero-Aufbauten: automatisch, Bildwand, nebeneinander, Porträtfokus, kompakter Einstieg und Bildraster. Die Inhalte bleiben beim Wechsel erhalten. Kartenraster richten sich nach Anzahl und Inhalt der Einträge; eine kurze breite Karte soll keine hohe leere Zeile neben einer schmalen Karte erzeugen. Inhaltliche Reihenfolge und Tastaturreihenfolge bleiben gleich.

Die Navigation wird beim Herunterscrollen ausgeblendet und beim Hochscrollen sichtbar. Menüöffnung, Tastaturfokus und Seitenanfang halten sie offen. Noir behält am Desktop seine feste Seitennavigation. Lange Leseabschnitte und Rechtstexte bekommen eine begrenzte Zeilenlänge.

## Elevation & Depth

Panorama nutzt die Überlagerung von Bildkante, Schrift und Porträt. Magazin arbeitet mit einer flachen, bewusst geschichteten Fotokomposition. Fotobühne verwendet Bildflächen, horizontale Porträts und interaktive Themenbereiche. Navy arbeitet mit differenzierten dunklen Flächen.

Noir besitzt getrennte Hintergrund-, Foto- und Textebenen mit tatsächlicher Perspektive. Das § wird als dunkles extrudiertes Volumen dargestellt. Eine gemeinsame zeitbasierte Dämpfung verbindet die Mausbewegung aller Ebenen; es gibt keine gegeneinander laufenden Zeigersteuerungen. Im Ruhezustand, außerhalb des Sichtbereichs und in versteckten Tabs wird das Zeichen nicht fortlaufend neu gerendert. Touch-Geräte erhalten eine statische Darstellung.

## Shapes

Bedienelemente besitzen klare Konturen und zurückhaltende Radien. Navy-Flächen sind stärker gerundet, Magazin und Noir bleiben kantiger. Abschnittsradien und Rahmen sind im CMS einstellbar. Bilder werden über reale Bildausschnitte positioniert; Gesichter dürfen durch Standardbeschnitt nicht verloren gehen.

## Components

Kontaktfelder haben sichtbare Labels und konsistente Innenabstände. Platzhalter ergänzen die Beschriftung und ersetzen sie nicht. Fehler erklären die notwendige Korrektur. Icons stammen aus derselben Lucide-Familie und werden über eine visuelle, durchsuchbare Auswahl gewählt.

Abschnittsbibliothek, Medienwahl und Symbolauswahl verwenden fokussierte Dialoge mit Escape und Rückkehr zum auslösenden Element. Der Rundgang wechselt die tatsächlichen Verwaltungsbereiche und erläutert sie in einem schwebenden Dialog mit hervorgehobenem Ziel.

**The Motion Rule.** Animationen unterstützen die räumliche oder inhaltliche Orientierung. Standardmäßig bleiben die entworfenen Interaktionen aktiv. Eine ausdrücklich gewählte reduzierte Systembewegung beendet räumliches Nachführen und kontinuierliche Effekte, behält aber Inhalt, Schichtung, Fokus und direkte Rückmeldung.

## Do's and Don'ts

### Do

- Do echte Namen, Qualifikationen, Kontaktwege und Quellen erhalten.
- Do Raster und Überschriften mit den tatsächlichen langen deutschen Inhalten prüfen.
- Do Bildausschnitte so setzen, dass die abgebildeten Personen erkennbar bleiben.
- Do Änderungen im CMS unmittelbar zeigen und erst nach ausdrücklichem Veröffentlichen öffentlich machen.
- Do Mausbewegungen begrenzen, dämpfen und im Ruhezustand stoppen.

### Don't

- Don't Entwürfe nur durch einen Farbwechsel unterscheiden.
- Don't gleichförmige Heros auf allen Unterseiten wiederholen.
- Don't Layoutlücken, abgeschnittene Wörter oder fehlenden Feldeinzug als Gestaltung behandeln.
- Don't Qualifikationen, Bewertungen, Fallzahlen oder Versprechen erfinden.
- Don't strukturierte CMS-Inhalte als JSON oder kommagetrennte Listen verlangen.
- Don't das Noir-Zeichen als silberne, glänzende Skulptur darstellen.
