# Prüfbericht

Stand: 20. Oktober 2026. Geprüft wurde die Entwurfsfassung mit fünf Gestaltungen. Der Blog bleibt zunächst ausgeschaltet. Die Prüfungen verwenden eigene temporäre Testdaten; die ursprünglichen Inhalte wurden anschließend wiederhergestellt.

## Funktion und Daten

`npm test`: zwölf bestandene Tests für Inhaltsschema, Abschnittsbibliothek, Veröffentlichungsprüfung und Sicherheitsfunktionen. TypeScript und der lokale Production-Build liefen fehlerfrei. `npm audit` meldete nach den Aktualisierungen von Nodemailer und Sharp keine bekannten Schwachstellen.

`scripts/verify-integration.mjs` prüfte sechzehn zusammenhängende Abläufe erfolgreich gegen den laufenden Server und die tatsächlich verbundenen Ressourcen:

- Geschützte Verwaltung, Anmeldung, Sitzung und Abmeldung; fremde Ursprünge dürfen keine Änderungen auslösen.
- Gemeinsames Laden der CMS-Daten ohne Rückgabe vertraulicher Werte; Versionskonflikte verhindern verlorene Änderungen.
- Neue Seiten bleiben im Entwurf privat. Nach Veröffentlichung erscheinen sie öffentlich und der öffentliche Cache wird erneuert.
- Einzelne Blogbeiträge veröffentlichen aktiviert den Blog nicht versehentlich. Freigabe, Artikeldaten und Zurückziehen wurden geprüft.
- Ein tatsächlicher Bild-Upload nach Vercel Blob, Bildbeschreibung, Neun-Punkte-Fokus und anschließendes Löschen funktionierten.
- Eine Kontaktanfrage erschien im Posteingang. Status, interne Notiz, CSV-Export und Löschen wurden geprüft.
- Honeypot-Anfragen enden vor einem Datenbankzugriff. Für ein neues Administratorpasswort gilt eine Mindestlänge von zwölf Zeichen.
- Ursprünglicher Seitenbestand und Veröffentlichungsstand wurden wiederhergestellt; Testseiten, Testbeiträge, Testbilder und Testanfragen wurden entfernt.

SMTP ist vorbereitet und zunächst ausgeschaltet. Es wurden keine E-Mails an die Kanzlei versendet. Ein Versandtest ist erst mit den Zugangsdaten des tatsächlichen Mailanbieters möglich.

## Datenbankverbrauch

`scripts/verify-cache.mjs` lief mit `HP_DB_DIAGNOSTICS=1` gegen einen lokalen Production-Server: **39 öffentliche Aufrufe, null zusätzliche Datenbankabfragen**, alle Antworten mit `x-nextjs-cache: HIT`. Das ist ein Nachweis für bereits vorgerenderte beziehungsweise aufgewärmte Seiten, keine Zusage über jeden denkbaren Betriebszustand. Erster Aufbau, Veröffentlichung, Verwaltung, Anfragen und Uploads benötigen gezielte Datenbankzugriffe.

Normale Besuche, die Entwurfsauswahl und lokale Änderungen im Canvas erzeugen keine Abfrage pro Interaktion. Es gibt kein periodisches Abrufen des CMS und keine Migration während eines Seitenaufrufs. Der Diagnosemodus ist nicht für Vercel gesetzt.

## Zugänglichkeit

Der öffentliche Axe-Durchgang umfasste zehn repräsentative Routen in allen fünf Entwürfen bei Desktop- und Smartphone-Breite: **100 Prüfungen ohne gemeldeten Regelverstoß**. Die gewählten Regeln decken WCAG 2 A/AA, 2.1 A/AA, 2.2 AA und ergänzende Best Practices ab. Pro Seite wurde außerdem eine einzige Hauptüberschrift geprüft.

Nach der Google-Maps-Ergänzung wurden die zehn Kontaktseiten-/Breitenkombinationen erneut geprüft: ebenfalls keine gemeldeten Regelverstöße und jeweils eine Hauptüberschrift.

Die Verwaltung wurde in dreizehn Ansichten beziehungsweise Einstellungsbereichen bei zwei Bildschirmgrößen geprüft: **26 Prüfungen ohne gemeldeten Regelverstoß**. Dabei wurden unter anderem Kontraste, Überschriften, Formularbeschriftungen und die Semantik des bearbeitbaren Canvas korrigiert.

Der Durchgang wurde nach der neuen Linkauswahl erneut vollständig bestanden. Zusätzlich wurden die fünf geöffneten Linkdialog-Zustände „Seite“, „Abschnitt“, „Adresse“, „E-Mail“ und „Telefon“ bei beiden Breiten geprüft: **zehn weitere Prüfungen ohne gemeldeten Regelverstoß**. Die Dialoge bleiben innerhalb der sichtbaren Breite. Ihr zugänglicher Name entspricht dem vollständigen sichtbaren Text.

Die Geräte-Einführung wurde mit zwei getrennten Browserkontexten geprüft: Der erste startet automatisch, Überspringen speichert nur dort den Abschluss, und Neuladen startet die Tour dort nicht erneut. Im zweiten Browser startet sie weiterhin. Neustart über die Hilfe beginnt bei Schritt eins. Diese Aktionen sowie die interne Linkauswahl erzeugten keine zusätzlichen API-Aufrufe. Die Vorschau behält ihre echte Inhaltsbreite und wird standardmäßig eingepasst; Mobile steht mittig.

Zusätzlich wurden Tastaturbedienung, Fokusbegrenzung und Rückgabe bei Dialogen, mobile Navigation, Formularzustände und die geführte Einführung manuell überprüft. Die Einführung hebt die tatsächlichen Bedienelemente hervor und lässt sich aus der Hilfe erneut starten. Betriebssystemseitig gewünschte Bewegungsreduktion wird berücksichtigt; räumliche Gestaltung und direkte Rückmeldungen bleiben erhalten.

Automatische Prüfungen erfassen nicht jede Nutzung mit Screenreader oder anderen Hilfsmitteln. Dies ist keine Zertifizierung einer vollständigen WCAG-Konformität.

## Gestaltung und Inhalte

Die unabhängige Textprüfung kontrollierte Kanzleiperspektive, Tatsachenbezug, Berufsbezeichnungen und unbelegte Behauptungen. Die abschließende Kontrolle der neuen Hero-Texte ergab keine weiteren sprachlichen Befunde. Herkunft und ergänzende Bildmotive sind in [Inhalte und Quellen](content-inventory.md) sowie `supplementary-imagery.json` dokumentiert.

Die Browserprüfung umfasst die fünf eigenständigen Gestaltungen, Unterseiten, Detailseiten und mobile Ansichten. Konkrete Korrekturen betrafen unter anderem Zeilenumbrüche, die Kanzleizeitleiste, ausgeglichene Personenraster, Bildausschnitte, Formularabstände, Menüverhalten und das schwarze Paragraphenzeichen im Noir-Entwurf. Der neue kompakte Navy-Hero erhielt eine ausdrückliche Rasterposition für das Bild; die geerbte Ganzzeilen-Spanne hatte es zuvor unter den Text verschoben.

Die zusätzliche mobile Kontrolle führte zu einem ausdrücklichen Reset des seitlichen Porträt-Titelversatzes, einer bündigen Finder-Karte mit lesbarer Themenauswahl und besseren Formular-/Kontaktgrößen. Der Noir-Themenindex darf auch bei langen Begriffen innerhalb seiner Rasterspalte schrumpfen. Mobile Noir-Heros ordnen Überschrift und Beschreibung nach ihrer tatsächlichen Höhe an; Fotos besitzen darunter einen eigenen Bereich.

Der erweiterte Durchgang erfasste alle 29 Seiten in allen fünf Entwürfen bei 1815, 1024 und 390 Pixeln: **435 geometrische Seitenprüfungen ohne verbleibenden Seitenüberlauf oder defektes Bild**. Die bewusst außerhalb der Ansicht angeordneten Honeypot-Felder wurden als solche eingeordnet. Ein unabhängiger Agent sah die Kontaktbögen der 348 Zustände von Entwurf 1–4 tatsächlich an und kontrollierte vollständige mobile Noir-Abschnitte über zehn Seitentypen. Für Navy wurden zusätzlich elf repräsentative Seiten bei vier Breiten visuell geprüft und die sechs Hauptseiten nach den Bildkorrekturen erneut kontrolliert. Ein weiterer Durchgang über 58 Noir-Ansichten auf Desktop und Tablet fand keine sichtbare Überschriften-/Absatzkollision. Dies beschreibt die konkrete Abdeckung, keine Garantie für jeden zukünftigen CMS-Inhalt.

Die nachträglich gewünschte Google-Maps-Einbettung wurde in allen fünf Entwürfen bei 1440 und 390 Pixeln geprüft: zehn erfolgreiche Abläufe. Vor der Freigabe wurden weder ein Karten-Iframe noch eine Google-Anfrage erzeugt. Die einmalige Freigabe lädt den richtigen Kanzleistandort, der Rahmen bleibt innerhalb der Seitenbreite. Ein Widerruf entfernt auch eine einmalig geladene Karte. Der tatsächliche Standort-Pin wurde zusätzlich im Browser angesehen. In der Bearbeitungsansicht bleibt die externe Karte deaktiviert.

Der Design-Detektor wurde einmal ausgeführt. Seine fünf primären Hinweise bezogen sich auf benachbarte Regeln für eine flache redaktionelle Linie und abgerundete Unterelemente, nicht auf die gleiche Kartenumrandung. Die weiteren Hinweise betrafen überwiegend bewusste Token-Variationen der fünf Entwürfe. Visuelle Fehler wurden im Browser beurteilt.

## Bereitstellung

Das Vercel-Projekt ist `hagn-und-partner`. Die Funktionsregion ist in `vercel.json` auf Frankfurt (`fra1`) begrenzt. Neon und der öffentliche Blob-Store wurden ebenfalls in Frankfurt angelegt. Eine Build- oder Sandbox-Region ist davon unabhängig.

Bereitgestellt und erreichbar unter [hagn-und-partner.vercel.app](https://hagn-und-partner.vercel.app), Verwaltung unter [/admin](https://hagn-und-partner.vercel.app/admin). Der Vercel-Build einschließlich TypeScript und aller 36 statischen Ausgaben lief erfolgreich. Die tatsächlichen Deployment-Ausgaben bestätigen `deployedTo: ["fra1"]`, insbesondere für Verwaltung, Kontakt und Bereinigung. Die öffentliche Startseite und die Anmeldung antworten mit HTTP 200, der ungeschützte Bootstrap mit 401 und der deaktivierte Blog mit 404.

Die sechzehn Integrationsprüfungen wurden zusätzlich vollständig gegen diese HTTPS-Bereitstellung bestanden. Das Sitzungscookie trägt dort auch `Secure`. Echte Blob-Uploads, Kontaktanfragen, Seiten- und Blogveröffentlichung sowie Cache-Erneuerung funktionierten; ursprüngliche Inhalte wurden wiederhergestellt und sämtliche Testdaten entfernt. Es wurden keine E-Mails versendet.

Der erste Code-Push auf GitHub war erfolgreich. Die optionale automatische Verbindung zum Repository wird vom Vercel-Konto mit fehlendem Admin-/Schreibzugriff seiner GitHub-Anbindung abgelehnt. Manuelle CLI-Deployments sind erfolgreich; diese fehlende Git-Verknüpfung betrifft keine Veröffentlichung aus dem CMS.

Der Entwurfsbetrieb verwendet `NEXT_PUBLIC_DESIGN_REVIEW=true`: Der Umschalter ist sichtbar, Suchmaschinen erhalten Noindex und eine gesperrte `robots.txt`. Der endgültige Start benötigt die gewählte Gestaltung, die endgültige kanonische Domain, eine erneute Bereitstellung mit ausgeschaltetem Entwurfsmodus und die tatsächlichen SMTP-Einstellungen, falls Benachrichtigungen gewünscht sind.
