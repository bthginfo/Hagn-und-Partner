# Galerie- und Funktionskorrekturen

Nachprüfung vom 20. Oktober 2026, ausgehend von den Fehlern der Schubert-Galerien. Die dort ebenfalls betroffene gemeinsame Galerie-, Dialog-, Formular- und Footer-Logik wurde bei Hagn korrigiert.

## Änderungen

- Die drei Kanzleifotos lassen sich in allen fünf Entwürfen vollständig vergrößern. Die bisherigen Galerie-Kompositionen, der Journal-Bildwechsel und die Bildansicht mit Schieberegler bleiben erhalten.
- Ein gemeinsamer Dialog unterstützt Vor/Zurück, Pfeiltasten, Escape, Schließen, Klick auf den Hintergrund und horizontale Wischgesten. Der Fokus bleibt beim Tabben im Dialog und kehrt nach dem Schließen zum auslösenden Bild zurück. Der Seitenhintergrund scrollt währenddessen nicht.
- Scrollabhängige Bewegungen der Galeriefotos sind deaktiviert. Die Schieberegler-Funktion bleibt bedienbar; ein einzelner darüberliegender Vergrößerungsbutton vermeidet überlappende Bildschaltflächen.
- Der Entwurfsumschalter überdeckt die Cookie-Einstellungen und Footer-Links nicht mehr. Der zusätzliche Abstand gilt nur während der Entwurfsphase.
- „Zum Seitenanfang“ scrollt unabhängig von der Position des Hauptinhalts bis ganz nach oben. Die Ankersteuerung respektiert reduzierte Bewegung.
- Das Kontaktformular erklärt einen Verbindungsabbruch auf Deutsch. Die Eingaben bleiben erhalten und können erneut gesendet werden.

## Prüfung

- 12 Unit-Tests und TypeScript-Prüfung erfolgreich.
- Kanzlei-Galerie und Kontaktformular in fünf Entwürfen bei 1440 × 1000 und 390 × 844 geprüft: Bilder, Vergrößerung, Navigation, Escape, erneutes Öffnen, Fokus-Rückkehr und Scrollsperre; außerdem Pflichtfelder, Verbindungsfehler, Wiederholung und Formular-Reset.
- Bei der Formularprüfung wurden Antworten für den Erfolgsfall simuliert; es wurden keine Testnachrichten an die Kanzlei verschickt.
- Alle 29 öffentlichen Seiten liefern HTTP 200 und eine Hauptüberschrift. Ursprüngliche Texte und Medien sind erhalten.
- Footer-Bedienung und Dialoge werden zusätzlich gemeinsam mit den beiden Schubert-Auftritten auf Tastaturbedienung, Hintergrundklick, Wischgesten und automatisierte Barrierefreiheitsregeln geprüft. Die lokalen Aufzeichnungen liegen im Schubert-Projekt unter `.data/gallery-qa/`.
