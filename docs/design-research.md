# Recherche und Gestaltungsentscheidungen

Stand: 20. Oktober 2026. Die bestehende [Kanzlei-Website](https://www.hagn-partner.de/) ist die Quelle für Fakten, Menschen, Leistungen und Originalfotografie. Die neuen Entwürfe übernehmen keine erfundenen Referenzen, Mandantenzahlen oder Bewertungen.

Die visuelle Recherche hat unter anderem [Lusion](https://lusion.co/) als tatsächlich im Browser betrachtete Referenz für räumliche Gestaltung und direkte Interaktion einbezogen. Daraus folgt für Noir eine klare Trennung von Hintergrund, Objekt, Fotografie und Vordergrund. Das konkrete dunkle § und seine zurückhaltende Bewegung entsprechen dem anschließenden Nutzerfeedback. Die übrigen Entwürfe nutzen bewusst andere räumliche und typografische Mittel.

| Entwurf | Gestalterischer Schwerpunkt | Unterschiedliche Einstiege |
| --- | --- | --- |
| Panorama | Große Fotokanten, klare Schrift, ruhige helle Flächen | Bildwand, Porträtfokus, kompakte Sachseiten, geteilte Inhalte |
| Magazin | Bodoni, Blau/Gelb, redaktionelle Fotokomposition | Cover, Kapitelband, Foto-/Textspalten, Porträtkomposition |
| Fotobühne | Große kondensierte Schrift, interaktive Themen, horizontale Porträts | Filmische Bildfläche, Seitenkolumnen, Themenstart, Bildraster |
| Noir | Schwarze Ebenen, matte dunkle §-Skulptur, Tiefe | Räumliche Fotowand, Porträtfokus, kompakter Einstieg, geteilte Bühne |
| Navy | Echte Logofarbe `#09456e`, dunkle Flächen, klare Karten | Bento, Panorama, Porträt, kompakter Katalog und Split |

Ruhige und schnelle Bedienung bleibt eine Gestaltungsanforderung. [web.dev zur Optimierung von INP](https://web.dev/articles/optimize-inp) begründet den Fokus auf unmittelbare Reaktionen und geringe Arbeit im Hauptthread. Maus-Effekte werden in Animation Frames zusammengeführt, gedämpft und außerhalb des Sichtbereichs gestoppt. Öffentliche Seiten benötigen keine laufenden CMS-Abfragen.

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) und [axe-core](https://github.com/dequelabs/axe-core) bilden die Grundlage der automatisierten A11y-Prüfungen. Zusätzlich wurden Fokus, Menüs, Dialoge, Touch-Größen, Wortumbrüche und reduzierte Bewegung im Browser geprüft. Reduzierte Systembewegung entfernt das räumliche Nachführen; sie entfernt weder die statische Schichtung noch die direkten Bedienrückmeldungen. Hintergrund: [web.dev zu Bewegung und Barrierefreiheit](https://web.dev/learn/accessibility/motion).

Die Anforderungen an verständliche, auffindbare Inhalte gelten auch für AI-Suche. Sichtbare Fakten, kanonische URLs, saubere Überschriften und passende strukturierte Daten bleiben zentral. [Google Search Central](https://developers.google.com/search/docs/appearance/ai-features) verlangt keine gesonderte spezielle AI-Auszeichnung. Eine garantierte Darstellung in Such- oder AI-Ergebnissen wird nicht behauptet.

Die ergänzende Fotografie wurde thematisch ausgewählt und vor der Verwendung angesehen. Quellen, Lizenzseiten und Unterscheidung zwischen Kanzleifotos und Symbolbildern stehen im [Inhaltsinventar](content-inventory.md).
