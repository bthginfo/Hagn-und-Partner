# Hagn & Partner

Website und visuelle Inhaltsverwaltung für Hagn, Deckert, Stemmer & Partner PartG mbB in Ingolstadt. Next.js App Router, React, TypeScript, Neon Postgres und Vercel Blob. Öffentliche Seiten werden vorgerendert und gezielt nach einer Veröffentlichung erneuert.

[Entwurfswebsite](https://hagn-und-partner.vercel.app) · [Verwaltung](https://hagn-und-partner.vercel.app/admin)

## Website und Verwaltung

- Fünf eigenständige Entwürfe, vorübergehend umschaltbar über den Button rechts unten. Auswahl über `?design=1` bis `?design=5`.
- 29 Inhaltsseiten einschließlich Kanzlei, sieben Anwaltsprofilen, 14 Rechtsgebieten, Service, Kontakt, Impressum und Datenschutz.
- `/admin`: geschützte Verwaltung mit direkter Bearbeitung im Canvas, eigenen Seiten, SEO pro Seite, Abschnitten, Bildausschnitten, Symbolauswahl, Navigation und Footer.
- Interne Seiten und Abschnitte werden über eine gemeinsame Linkauswahl gewählt. Externe Adressen, Downloads, E-Mail und Telefon sind ebenfalls möglich. Die Desktop-Vorschau passt die vollständige Seitenbreite ein; die Smartphone-Vorschau steht mittig.
- 53 Abschnittstypen in der Bibliothek. Karten und Listen werden mit einzelnen Eingabefeldern bearbeitet. Texte lassen sich direkt in der Vorschau ändern.
- Zentrale Medienbibliothek, Bildbeschreibungen und Fokus über ein Neun-Punkte-Raster. Hochgeladene Bilder werden optimiert und von Metadaten bereinigt.
- Entwürfe, explizites Speichern, Veröffentlichen, Rückgängig/Wiederholen und bis zu 30 veröffentlichte Fassungen. Versionsprüfung verhindert versehentliches Überschreiben durch eine andere Sitzung.
- Anfragen im Backend, optionale SMTP-Benachrichtigungen, Cookie-Einstellungen und optionale Statistikdienste.
- Optionaler Blog mit eigenen Beiträgen und drei Darstellungen. Er ist anfangs deaktiviert und enthält keine Beispielartikel.
- Geführte Einführung mit hervorgehobenen Bereichen beim ersten Login je Browser beziehungsweise Gerät. Sie ist überspringbar und unter **Hilfe → Einführung wiederholen** erneut startbar.
- Interaktive Google-Karte auf der Kontaktseite, erst nach Freigabe. Anschrift und Kartenquelle lassen sich im CMS ändern.

## Lokal starten

Voraussetzung: Node.js 24 und npm.

```powershell
npm ci
Copy-Item .env.example .env.local
node scripts/configure-auth.mjs
npm run dev
```

Ohne `DATABASE_URL` verwendet die lokale Entwicklung eine ignorierte Datei unter `.data/`. Auf Vercel ist Postgres erforderlich. Für die verbundenen Ressourcen kann stattdessen `vercel env pull .env.local` verwendet werden. Eine vorhandene `.env.local` dabei nicht mit der Beispieldatei überschreiben.

Bei einer neuen Postgres-Datenbank zuerst `DATABASE_URL` setzen, dann einmal `npm run db:setup` ausführen. Der Aufbau ist idempotent; vorhandene Inhalte werden nicht neu importiert. Normale Seitenaufrufe führen keine Migrationen aus.

## Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `DATABASE_URL` | Gepoolte Neon-Verbindung; vertraulich |
| `BLOB_READ_WRITE_TOKEN` | Zugriff auf den Medien-Store; vertraulich |
| `AUTH_SECRET` | Zufallsschlüssel für verschlüsselte SMTP-Zugangsdaten; vertraulich, dauerhaft aufbewahren |
| `ADMIN_INITIAL_PASSWORD_HASH` | Scrypt-Hash des ersten Passworts; nur für die erstmalige Einrichtung |
| `CRON_SECRET` | Schutz des täglichen Bereinigungsaufrufs |
| `NEXT_PUBLIC_SITE_URL` | Anfängliche kanonische HTTPS-Adresse, später auch im CMS einstellbar |
| `NEXT_PUBLIC_DESIGN_REVIEW` | `true`: Entwurfsumschalter und Ausschluss von der Suchmaschinenindexierung |
| `NEXT_PUBLIC_SITE_VARIANT` | Erster Standardentwurf; anschließend im CMS auswählbar |

Das aktuelle Passwort wird nach der ersten Anmeldung im geschützten Datenbestand verwaltet. Passwortänderungen erfolgen unter **Einstellungen → Zugang** und beenden die übrigen Sitzungen. SMTP-Passwörter werden verschlüsselt und nie an den Browser zurückgegeben. Das Erstpasswort steht nicht im Repository.

## Veröffentlichen

Das Vercel-Projekt ist `hagn-und-partner`. Funktionen, Neon und Blob sind für Frankfurt (`fra1`) eingerichtet. Inhalte werden beim Deploy nicht mit Seed-Daten überschrieben. Ein täglicher geschützter Cron-Aufruf entfernt abgelaufene Sitzungen, Rate-Limits und Anfragen nach der im CMS gewählten Frist.

```powershell
vercel deploy --prod
```

Der Code ist auf `main` im GitHub-Repository gespeichert. Die automatische Git-Verknüpfung wartet auf die richtige Kontozuordnung: Vercel nennt `tuv-julius-voningelheim` als GitHub-Namensraum; das persönliche Repository gehört `bthginfo`. In den [Vercel-Kontoeinstellungen](https://vercel.com/account/settings/authentication) muss das Eigentümerkonto `bthginfo` verbunden sein. Die App-Freigabe „All repositories“ ersetzt diese Kontozuordnung nicht. Anschließend lässt sich das Repository unter **Projekteinstellungen → Git** verbinden. Bis dahin funktionieren Code-Deployments über den obigen CLI-Befehl. Veröffentlichungen im CMS benötigen keinen Git-Push und funktionieren direkt auf der bereitgestellten Website.

Vor dem endgültigen Start die gewählte Gestaltung im CMS veröffentlichen, `NEXT_PUBLIC_DESIGN_REVIEW=false` setzen und erneut deployen. Dadurch verschwinden Umschalter und Entwurfs-Noindex. Die endgültige Domain unter **Einstellungen → Allgemein** eintragen. SMTP erst mit den tatsächlichen Zugangsdaten des Mailanbieters aktivieren.

Vercel Hobby erlaubt persönliche, nicht kommerzielle Nutzung. Für den produktiven Kanzleibetrieb ist ein geeigneter kommerzieller Tarif erforderlich: [Vercel Hobby](https://vercel.com/docs/plans/hobby). Neon und Blob wurden im kostenlosen Einstieg eingerichtet; deren aktuelle Kontingente gelten weiterhin. Ein nie erreichtes Monatslimit kann keine Architektur garantieren; die öffentlichen Aufrufe benötigen nach dem Aufwärmen keine Datenbankabfrage.

## Prüfungen

```powershell
npm run typecheck
npm test
npm run build
node scripts/verify-accessibility.mjs http://localhost:3000
node scripts/verify-integration.mjs http://localhost:3000
```

Der Integrationstest erwartet das Administratorpasswort verborgen auf stdin. Er prüft echte Datenbank- und Blob-Vorgänge mit vorübergehenden Testdaten und stellt den Ausgangsinhalt anschließend wieder her. Nur gegen eine eigene Test-/Entwurfsumgebung ausführen; SMTP muss deaktiviert sein. Es werden keine Test-E-Mails an die Kanzlei versendet.

Der Cache-Nachweis läuft gegen einen lokalen Production-Server mit `HP_DB_DIAGNOSTICS=1` über `node scripts/verify-cache.mjs http://localhost:3001`. Diese Diagnosevariable gehört nicht in den öffentlichen Betrieb. Axe ersetzt keine vollständige manuelle Prüfung mit realen Hilfsmitteln.

Weitere Dokumentation: [Architektur](docs/architecture.md), [Inhalte und Quellen](docs/content-inventory.md), [Textprüfung](docs/copy-review.md), [Gestaltung](DESIGN.md), [Prüfbericht](docs/verification.md).
