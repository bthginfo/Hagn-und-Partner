# Architektur und Betrieb

## Inhalt und Darstellung

`WebsiteContent` enthält die globale Konfiguration, Seiten und optionale Blogbeiträge. Jede Seite besteht aus geordneten Abschnitten mit stabilen IDs. Inhalt und Gestaltung sind getrennte, validierte Felder. Ein gemeinsames Schema und die Registry in `section-library.ts` verbinden Renderer, Bibliothek und CMS. Alle fünf Entwürfe nutzen dieselben fachlichen Inhalte; ihre Kompositionen sind getrennte Komponenten und Stylesheets.

Die 26 Basistypen erhalten pro Entwurf eigene Darstellungen. Zusätzliche Bibliothekstypen erlauben die gezielte Nutzung besonderer Kompositionen. Die Hero-Gestaltung ist je Seite wählbar. Bildposition und Alt-Text gehören zur jeweiligen Bildverwendung; zentrale Mediendaten dienen als wiederverwendbare Vorgabe.

Die gemeinsame interne Linkauswahl nutzt ausschließlich den bereits geladenen Entwurf. Sie führt von der Seite zum optionalen Abschnitt und kennt auch Blogübersicht und Beiträge. Die Einführung speichert ihren Abschluss versioniert im jeweiligen Browser; ihre Schritte und die Linkauswahl benötigen keine zusätzlichen Datenbankaufrufe. Die Vorschau behält 1440 beziehungsweise 390 Pixel Inhaltsbreite und skaliert diese auf den verfügbaren Platz.

`PageContent.locale` bereitet weitere Sprachen vor. Ein mehrsprachiger Betrieb benötigt später bewusste URL-/Locale-Zuordnung, Übersetzungsbeziehungen, Sprachumschalter und `hreflang`. Diese Funktionen werden nicht durch bloßes Ändern des Sprachfelds vorgetäuscht.

## Datenbankzugriffe und Kontingente

- Der öffentliche Snapshot enthält ausschließlich veröffentlichte Inhalte und die kanonische Adresse. Eine einzige Postgres-Abfrage lädt diesen Snapshot nach einer Invalidierung; Next Data Cache und React Request Cache teilen das Ergebnis zwischen Seiten und Metadaten.
- Öffentliche Seiten und Suchmaschinen-Dateien sind statisch bzw. ISR. Die Daten werden nicht regelmäßig aus der Datenbank abgefragt. Besuche, Scrollen, Navigation und Wechseln der Entwurfsvariante erzeugen nach dem Aufwärmen keine Inhaltsabfragen.
- Speichern verändert nur den Entwurf. Erst Veröffentlichen invalidiert den öffentlichen Cache über `hp-published` und die betroffenen Routen. SMTP-Einstellungen haben einen getrennten Cache-Tag.
- Das CMS lädt Zustand, Medien, Einstellungen und Anfragen in einer gemeinsamen Bootstrap-Abfrage plus Sitzungsprüfung. Tippen, Bildposition, Layoutauswahl, Vorschau, Rückgängig und Tour-Schritte arbeiten im Browser. Es gibt kein Polling und kein Autosave nach jedem Tastendruck.
- Neon verwendet den serverlosen HTTP-Treiber mit der gepoolten URL. Eine kalte Funktion führt keine DDL-/Seed-Arbeit aus. Migration und Erstimport sind explizite Einrichtungsschritte.
- Sitzungen und Rate-Limits sind dauerhaft gespeichert. Wiederholt blockierte Absender werden zusätzlich in einer begrenzten lokalen Map abgefangen. Ein Formular-Honeypot und fehlerhafte Eingaben beenden die Verarbeitung vor einer Datenbankabfrage.
- Bis zu 30 veröffentlichte Inhaltsfassungen werden aufbewahrt; Anfragen haben eine einstellbare Löschfrist. Ein täglicher SQL-Bereinigungsvorgang entfernt abgelaufene Daten. Medien werden beim Anzeigen direkt aus dem CDN geladen.

Kosten entstehen weiterhin durch Verwaltungsaktionen, echte Anfragen, Veröffentlichungen, Deployments, Cache-Invalidierungen und Nutzung der Dienste. Die Architektur reduziert diese Vorgänge, ersetzt aber keine Tarifkontingente oder deren Überwachung.

## Speicherung

Neon Postgres und der öffentliche Vercel-Blob-Store liegen in Frankfurt. Die Function-Region ist `fra1`. Öffentliche Bilder können global aus dem CDN ausgeliefert werden. Kontaktanfragen und Zugangsdaten gehören nicht in den öffentlichen Medien-Store.

Tabellen: `hp_site` für Entwurf/Veröffentlichung mit optimistischer Revision; `hp_revisions` für Fassungen; `hp_records` für Sitzungen, Einstellungen, Medien und Anfragen; `hp_limits` für zeitlich begrenzte Zähler. Parameterisierte SQL-Abfragen und Zod prüfen alle Schreibvorgänge. Die lokale Dateispeicherung ist nur ein Entwicklungspfad.

## Zugang, Formulare und Medien

Administratorsitzungen verwenden zufällige Tokens; die Datenbank erhält deren Hash. Cookies sind HttpOnly, SameSite Strict und bei HTTPS Secure. Sitzungen laufen nach zwölf Stunden ab. Schreibzugriffe prüfen die Herkunft. Passwortwechsel prüfen das bisherige Passwort, erzwingen ein längeres neues Passwort und widerrufen bestehende Sitzungen.

Das Kontaktformular speichert die Anfrage zuerst. Eine fehlende oder fehlschlagende SMTP-Verbindung verliert die Nachricht nicht. Benachrichtigungen enthalten eine Anfrage-ID und den Verweis auf den geschützten Posteingang, keine vertrauliche Fallschilderung. SMTP verwendet TLS mit geprüftem öffentlichen Hostnamen, begrenzten Zeitüberschreitungen und verschlüsselt gespeicherten Zugangsdaten.

Uploads akzeptieren JPEG, PNG und WebP bis 4 MiB. Sharp prüft und dekodiert die Datei, korrigiert die Orientierung, entfernt Metadaten, begrenzt die Kantenlänge und speichert WebP. Verwendete Medien lassen sich nicht versehentlich aus der Bibliothek löschen. Uploads, Bildwahl und Änderungen an Bildverwendungen sind getrennte Vorgänge.

Google Maps wird erst nach ausdrücklicher einmaliger Freigabe oder Zustimmung zur Kategorie „Externe Medien“ geladen. Ein Widerruf entfernt den Iframe auch bei einmaliger Freigabe. Die Anschrift stammt standardmäßig aus den globalen Kanzleidaten; einzelne Karten können eine andere Anschrift oder einen geprüften Einbettungslink verwenden. Im Canvas werden keine externen Karten geladen. Für die Adresssuche ist kein API-Schlüssel erforderlich.

## Veröffentlichung und SEO

Seitentitel, Beschreibungen, Vorschaubilder und Noindex sind im CMS einstellbar. Sitemap, Robots, kanonische URLs, echte Überschriften und passende JSON-LD-Typen werden aus dem veröffentlichten Inhalt erzeugt. Alte URLs erhalten Weiterleitungen. Blogentwürfe besitzen keine öffentliche Route; eine einzelne Beitragsveröffentlichung veröffentlicht keine fremden Seitenentwürfe.

Für AI-Suche gelten dieselben nachvollziehbaren Inhalte und passenden strukturierten Daten. `llms.txt` ist eine ergänzende Zusammenfassung und keine Indexierungs- oder Sichtbarkeitsgarantie. Google verlangt für seine AI-Funktionen keine spezielle zusätzliche SEO-Markierung: [Google Search Central](https://developers.google.com/search/docs/appearance/ai-features).

Die Entwurfsbereitstellung bleibt mit `NEXT_PUBLIC_DESIGN_REVIEW=true` von der Indexierung ausgeschlossen. Erst die endgültige Freigabe entfernt diese Sperre und den Variantenumschalter.

## Erweiterung

Neue Abschnittstypen werden in TypeScript-Typen, Zod-Schema, Bibliothek, Capability-Zuordnung und Renderer ergänzt. API und private Speicherschicht bleiben von der Darstellung getrennt. Weitere Integrationen, Rollen oder Sprachfassungen lassen sich darauf aufbauen. Der anfängliche gemeinsame Passwortzugang ist bewusst eine erste, später ersetzbare Authentifizierung.
