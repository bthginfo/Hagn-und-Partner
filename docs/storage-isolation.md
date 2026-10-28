# Getrennte Speicher und geringer Datenbanktransfer

Stand: 28. Oktober 2026. Die vier Websites verwenden getrennte Neon-Projekte und getrennte Vercel-Blob-Stores im Vercel-Team `juliusvingelheim-2692s-projects`. Die übrigen Vercel-Projekte wurden nicht umgestellt.

| Website | Eigenes Neon-Projekt, Tarif Free | Eigener Blob-Store | Region |
| --- | --- | --- | --- |
| Hagn & Partner | `odd-frost-74601828` | `store_KArEqkRY8JXoJF5n` | Frankfurt |
| Mario Weddings | `blue-base-32705623` | `store_mTJxFsqJ3TjhCuRA` | Frankfurt |
| Mario Events | `crimson-dew-76333256` | `store_NN9Jd1laL0PaSdqG` | Frankfurt |
| Amelie Lider | `dark-surf-38037522` | `store_oA5S9Jf46OQGeF2c` | Frankfurt |

Jedes Ressourcenpaar ist ausschließlich mit der zugehörigen Website verbunden, jeweils für Production, Preview und Development. Die lokalen Verbindungswerte wurden ebenfalls umgestellt. Die Zugangsdaten der fertigen Deployments stimmen mit den nachträglich bereinigten nativen Storage-Verbindungen überein; Datenbank- und Blob-Zugriffe wurden tatsächlich ausgeführt. Die Speicherursprünge und Funktionen liegen in `fra1` beziehungsweise AWS `eu-central-1`.

## Was den bisherigen Transfer verursacht hat

Das bisher als `hagn-partner-db` bezeichnete Neon-Projekt `winter-credit-89309942` enthielt die Daten aller vier Websites. Hagn verwendete öffentliche `hp_*`-Tabellen, Mario Weddings das Schema `mario_weddings`, Mario Events das Schema `mario_events`; Amelie verwendete eine weitere Datenbank im selben Projekt. Eine weitere Datenbank oder ein Schema teilt weiterhin das Kontingent dieses Neon-Projekts. Die im Dashboard sichtbaren 4,09 GB beziehungsweise 81,8 Prozent waren deshalb kein isolierter Verbrauch der Kanzlei-Website.

Der auffällige Abruf lag bei Mario Weddings: Entwurf und veröffentlichter Stand umfassten in der PostgreSQL-JSON-Darstellung jeweils etwa 2,54 MB. Öffentliche Seiten lasen beide Spalten zusammen, obwohl sie nur den veröffentlichten Stand benötigten. Damit konnte bereits ein einzelner Abruf rund 5 MB Inhalt übertragen. Die vorhandene React-Memoisierung fasste gleiche Zugriffe nur innerhalb einer Anfrage zusammen; sie ersetzte keinen dauerhaften Cache zwischen Besuchen. Die gespeicherten Tabellenstatistiken zeigten rund 973 Zugriffe auf diese Inhaltstabelle. Mario Events verwendete dasselbe Abfragemuster mit wesentlich kleineren Inhalten.

Hagns veröffentlichter Stand war dagegen nur rund 193 KB groß; die vorhandenen Produktionsaufrufe und Tabellenstatistiken erklärten keinen fortlaufenden Verbrauch von mehreren Gigabyte allein durch diese Website. Historische Egress-Messwerte pro einzelner SQL-Abfrage wurden nicht aufgezeichnet. Eine rückwirkende bytegenaue Zuordnung der gesamten 4,09 GB zu einzelnen Websites ist daher nicht möglich; gemeinsame Kontingente und die großen wiederholten Abrufe sind nachgewiesen.

Ein altes Events-Einrichtungsskript übernahm Datenbank- und Blob-Zugangsdaten von Hagn. Es prüft jetzt ausschließlich die eigenen Ressourcen und überschreibt keine Konfiguration. Ein früheres Amelie-Skript, das nur eine weitere Datenbank innerhalb desselben Projekts anlegte, wurde stillgelegt.

## Änderungen am Datenzugriff

- Öffentliche Mario-Seiten lesen ausschließlich veröffentlichte Inhalte. Der persistente Cache wird nach erfolgreicher Veröffentlichung beziehungsweise einer öffentlichen Blogänderung sofort erneuert. Entwürfe und geschützte Vorschauen bleiben außerhalb dieses Caches.
- Große Cache-Einträge werden serverseitig komprimiert. Nexts persistenter Fetch-Cache begrenzt einen Eintrag in der eingesetzten Version auf 2 MiB; ein unkomprimierter Weddings-Gesamtstand wäre dafür bereits zu groß. Cache-Schlüssel enthalten die Datenbankidentität, damit ein Speicherwechsel keine alten Daten übernimmt.
- Hagn liest beim ersten Abruf einer Seite nur deren benötigte Inhalte und eine kompakte Seitenübersicht. Der gemessene durchschnittliche Seitenabruf sank von rund 193 KB auf 9,1 KB, der größte auf 18,4 KB. Die komprimierten Einträge bleiben deutlich unter dem Cache-Limit.
- Gleiche Hagn-/Amelie-Entwurfs- und Veröffentlichungsstände werden beim Laden der Verwaltung nur einmal aus PostgreSQL übertragen. Unnötige vollständige `RETURNING`-Ergebnisse wurden entfernt.
- Weddings-Speichervorgänge geben aus SQL nur Versionsdaten und den Änderungsstatus zurück. Im Live-Test betrug dieses Ergebnis 96 Byte statt eines erneut übertragenen Gesamtstands von etwa 2,54 MB. Die bereits übergebenen Inhalte werden für die Browserantwort im Server wiederverwendet. Wiederherstellungen lesen weiterhin den tatsächlich benötigten historischen Inhalt. Speichern, erneutes Laden, private Vorschau und anschließende Veröffentlichung wurden mit unveränderten Fachinhalten tatsächlich geprüft.
- Neue Mario-Bilder liegen als optimierte WebP-Dateien im eigenen Blob-Store. PostgreSQL enthält nur ihre Metadaten und Adresse. Ältere `/api/media/:id`-Adressen bleiben kompatibel; neue Bilder werden direkt vom Blob-CDN ausgeliefert.
- Hagn verwendet bei `next dev` und Tests standardmäßig lokale Daten, auch wenn eine entfernte Verbindung vorhanden ist. Bewusste Datenbanktests benötigen `HP_USE_REMOTE_DATABASE=1`. Produktionsbetrieb und explizite Wartung verwenden die konfigurierte Datenbank.
- `HP_DB_METRICS=1` protokolliert sichere Größen-/Laufzeitdaten, keine Inhaltswerte, SQL-Parameter oder Zugangsdaten. Öffentliche Besuche fragen keine Datenbankversion zur Cache-Kontrolle ab.

## Übernahme und Nachweise

Alle fachlichen Tabellen einschließlich Medienregister, Passwortkonfiguration, Sitzungen, SMTP-Einstellungen, Anfragen, Limits und Versionen wurden vollständig übernommen. Dazu gehören auch Amelies Podcast-, Visitenkarten-, Logo- und Download-Daten. Die ursprünglichen Geheimnisse wurden beibehalten, damit verschlüsselte Einstellungen lesbar bleiben.

Mario Weddings erhielt 263 eigene Medienkopien mit insgesamt 176.883.583 Byte. Jede Kopie wurde heruntergeladen und ihre SHA-256-Prüfsumme mit der Quelle verglichen. Adressen wurden gezielt in Entwürfen, Veröffentlichungen, Versionen und den lokalen Inhaltskatalogen ersetzt. Die übrigen Websites hatten keine bestehenden Blob-Dateien zu übernehmen; ihre lokalen Website-Dateien bleiben Bestandteil der jeweiligen Bereitstellung. Eine abschließende Inventur nach der Schreibsperre bestätigte keine fehlenden Objekte. Amelies alter Store war laut Kontoinventur vollständig leer.

Vor der endgültigen Kopie sperrte ein temporärer Anwendungsmechanismus auch Uploads und externe Nebenwirkungen. Bestehende Anfragen konnten auslaufen; für die Mario-Seiten lagen keine noch gültigen Upload-Freigaben vor. Die Quelltabellen wurden anschließend gegen Insert, Update, Delete und Truncate geschützt. Alte Quell-Sitzungen wurden widerrufen, die Zielkopien behalten die übernommenen Sitzungen. Erhöhte Revisionsnummern verhindern, dass alte Editorstände die Zielinhalte überschreiben.

Der Vergleich erfolgte tabellenweise über PostgreSQL-normalisierte Inhalte, Zeilenzahlen und Prüfsummen. Erwartete Änderungen wie neue Medienadressen und Revisionsnummern wurden dabei ausdrücklich berücksichtigt. Die alten Daten und privaten Sicherungen bleiben erhalten; sie sind keine aktiven Ressourcenverbindungen der vier Websites. Die Migrationshelfer brechen nach der Umschaltung vor jedem erneuten Import ab. Zusätzlich kennzeichnet eine Datenbank-Markierung das produktive Ziel. Alte Snapshots dürfen produktive Daten nicht ersetzen.

Die Live-Prüfung umfasste 111 öffentliche Routen und anschließend 222 wiederholte Abrufe: **keine zusätzliche öffentliche Inhaltsabfrage in PostgreSQL**. Die 16 Hagn-Integrationsprüfungen bestanden mit den neuen tatsächlichen Ressourcen. Die anderen drei CMS wurden mit eigenen temporären Sitzungen und echten Uploads in ihren jeweiligen Store geprüft; bei Mario wurden leere Binärdatenfelder in PostgreSQL und die kompatiblen alten Medienadressen bestätigt. Auch der aktive lokale Amelie-Editor wurde gegen seine neue Datenbank geprüft. Temporäre Bilder und Testsitzungen wurden entfernt.

## Für weitere Website-Projekte

1. Pro Website ein eigenes Neon-Projekt und einen eigenen Blob-Store anlegen. Zugangsdaten nicht aus einer anderen Website übernehmen. PostgreSQL-Datenbanknamen und Schemas allein schaffen kein eigenes Free-Kontingent.
2. Vor dem ersten Deploy Projekt-ID, Team, Region und Verbindung für jede Umgebung kontrollieren. Identische Hosts oder Blob-Store-IDs zwischen unabhängigen Websites sind ein Warnsignal.
3. Öffentliche Lesezugriffe und private Editorzugriffe getrennt behandeln. Nur veröffentlichte, für die jeweilige Ausgabe benötigte Daten laden; keine kompletten Entwurfs- und Versionsarchive an öffentliche Abrufe hängen.
4. Einen persistenten Cache mit expliziter Veröffentlichungs-Invalidierung verwenden. Tatsächliche Eintragsgrößen prüfen und Cache-Schlüssel beim Wechsel der Datenquelle trennen. React-Request-Memoisierung allein reicht nicht.
5. Bilder, Videos und Downloads direkt aus Object Storage ausliefern. In SQL nur Metadaten speichern. Listen und Inboxen begrenzen, große Datensätze nicht nur für Zähler laden und keine großen Daten nach einem Schreibvorgang erneut zurückgeben, wenn sie bereits vorliegen.
6. Migrationen, Tabellenaufbau, Aufräumen und RSS-Importe explizit oder geplant ausführen. Sie gehören nicht in gewöhnliche öffentliche Seitenaufrufe. Lokale Arbeit und automatisierte Prüfungen bewusst von produktiven Ressourcen abgrenzen.
7. Einen echten Production-Build mehrfach abrufen und die Datenbankzugriffe vor und nach dem Aufwärmen vergleichen. Ein sichtbarer HTTP-Cache-Miss bedeutet nicht zwingend einen SQL-Abruf; messen statt vermuten.

## Tarife

Die vier Neon-Projekte verwenden `free_v3`. Nach der aktuellen [Neon-Dokumentation](https://neon.com/docs/introduction/network-transfer) sind im Free-Tarif 5 GB öffentlicher Transfer je Projekt und Monat enthalten. Neue Projekte erhalten ihr eigenes Kontingent; das bereits verbrauchte Kontingent des alten Projekts wird dadurch nicht zurückgesetzt.

Blob-Stores und ihre Zugangsdaten sind vollständig getrennt. Vercel vergibt auf dem bestehenden Pro-Team allerdings keinen eigenen kostenlosen Tarif pro Store: Nutzung wird über das gemeinsame monatliche Guthaben und anschließend nach Verbrauch abgerechnet. Separate Stores ändern diese Abrechnung nicht. Es wurde kein neuer kostenpflichtiger Tarif gebucht. Siehe [Vercel Blob: Preise und Store-Trennung](https://vercel.com/docs/vercel-blob/usage-and-pricing).
