# Unabhängige Textprüfung

Aktueller Stand: Die späteren Kontrollgänge sind am Ende dieses Dokuments ergänzt. Die unten protokollierten offenen Punkte gehören zum damaligen Zwischenstand. Sichtbare Sekretariatskennzeichnung, Hauptüberschriften und der allgemeine Bild-Sprunglink wurden anschließend umgesetzt und im Browser nachgeprüft.

## Erste Prüfung und damaliger Zwischenstand

Stand: 20. Oktober 2026. Die Erstprüfung erfolgte ohne Änderungen an Implementierung oder Inhaltsdaten; anschließend wurden die unten markierten Inhaltskorrekturen freigegeben und umgesetzt.

**Umsetzungsstand nach Freigabe:** Die Inhaltskorrekturen aus 1, 2, 4–9, 11–13, 16 und 17 sind jetzt in `scripts/build-content.mjs` und der daraus erzeugten `src/data/content.json` umgesetzt. Aus 10 sind die sechs Beschriftungen „Sekretariat kontaktieren“ umgesetzt; die Team-Karten benötigen noch die TSX-Anpassung durch die Hauptaufgabe. Die vorhandene CTA-Vorlage in `src/lib/section-library.ts` ist ebenfalls korrigiert. Die übrigen TSX-Befunde 3, 10, 14, 15 und 18 bleiben zur Umsetzung durch die Hauptaufgabe offen. Die ursprünglichen Fundstellen unten dokumentieren den geprüften Ausgangszustand.

**Verifikation:** 29 Seiten und 144 Abschnitte; IDs, Typen, Reihenfolge, Sichtbarkeit, Sprungmarken und Gestaltung unverändert. Alle sieben Profile mit Originalqualifikationen und direkten Kontaktzielen, alle wiederholten Kontakte, neun Downloads und drei vollständige 190-Euro-Bedingungen geprüft. Die vier langen Fachtexte behalten sämtliche Originalabsätze und mehr als 98 % ihres Umfangs; die Familienrecht-Fassung enthält weiter alle vier belegten Themen. Daten entsprechen dem vorhandenen Zod-Schema. Erneuter Generatorlauf liefert bytegleichen Inhalt. Das Quelleninventar und `src/data/media.json` blieben unverändert. `node scripts/build-content.mjs --content-only` erzeugt gezielt nur die Inhalte; ohne diesen Schalter schreibt der Generator wie zuvor zusätzlich die Mediathek. Der redaktionelle Stadtbild-Alternativtext in bestehenden Medienkatalogeinträgen gehört damit noch zur Mediatheksprüfung der Hauptaufgabe.

Alle **29 Seiten mit 144 Abschnitten** in `src/data/content.json` wurden vollständig gelesen, einschließlich Metadaten, Bildbeschreibungen, Personenlisten und wiederkehrender Texte. Ebenfalls vollständig gelesen: `src/lib/section-library.ts`, alle vier Dateien in `src/components/site/` und alle neun Dateien in `src/components/admin/`. Grundlage für Personen, Leistungen und Originalton: `docs/content-data.json` und `docs/content-inventory.md`. Noch nicht vorhandene Routen oder Funktionen sind keine Textbefunde.

Die sieben Personen, ihre vorhandenen Fachanwaltstitel, Zulassungsjahre, E-Mail-Adressen und Telefonnummern stimmen mit dem Inventar überein. Die abweichende Durchwahl **-17** für Eva Huxmann und **-25** für das allgemeine Sekretariat von Annalena Baumanis ist richtig übernommen. Deckert, Huxmann und Wagner werden nicht als Fachanwälte ausgegeben. Es gibt keine erfundenen Bewertungen, Mandate oder Erfolgskennzahlen. Der Betrag **190 Euro** ist an allen drei Stellen korrekt auf Verbraucher und ein erstes Beratungsgespräch ohne gesonderte Gebührenvereinbarung bezogen; Umsatzsteuer und Abrechnung nach Aufwand stehen dabei. Diese Angaben erhalten.

P1 = vor öffentlicher Verwendung korrigieren. P2 = deutliche Textverbesserung. P3 = kleinere Konsistenzkorrektur. JSON-Pfade sind nullbasiert. Bei Fragmenten ist nur die ausdrücklich zitierte Zeichenfolge zu ersetzen; fachliche Aufzählungen und Quellendetails bleiben erhalten. Dies ist eine Textprüfung, keine rechtliche Aktualitätsprüfung.

## 1. P1 – Öffentliche Datenschutzhinweise enthalten Einrichtungs- und Zukunftstexte

Datei: `src/data/content.json`, `/pages/28/sections/3/content/text`.

**Alt, vollständiger zweiter Absatz:**

> Zum Start sind keine Statistikdienste aktiviert. Wenn wir später Google Analytics oder Matomo einsetzen, laden wir diese erst nach Ihrer ausdrücklichen Einwilligung in die Kategorie Statistik. Für nicht erforderliche Speicherung ist § 25 Abs. 1 TDDDG maßgeblich; die anschließende Datenverarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO.

**Neu bei der tatsächlich geprüften Konfiguration, in der sämtliche Statistikfelder leer sind:**

> Wir verwenden derzeit keine Statistikdienste.

**Alt, letzter Absatz:**

> Über „Cookie-Einstellungen“ im Seitenfuß können Sie Ihre Auswahl ändern oder eine Einwilligung mit Wirkung für die Zukunft widerrufen. Werden Statistikdienste eingerichtet, ergänzen wir diese Hinweise um die tatsächlich eingesetzten Dienste und deren Konfiguration.

**Neu:**

> Über „Cookie-Einstellungen“ im Seitenfuß können Sie Ihre Auswahl ändern oder eine Einwilligung mit Wirkung für die Zukunft widerrufen.

Grund: „Zum Start“, „wenn wir später“ und die Ankündigung späterer Textpflege gehören zur Einrichtung. Der veröffentlichte Text muss den tatsächlichen Betrieb beschreiben. Bei späterer Aktivierung müssen die dann tatsächlich verwendeten Anbieter beschrieben werden; dafür keine pauschale Zukunftsbehauptung stehen lassen. Erforderliche Speicherung und deren bereits enthaltene Grundlagen bleiben im ersten Absatz erhalten.

## 2. P1 – Öffentliche Kontaktinformationen sprechen in Entwicklerbegriffen

Datei: `src/data/content.json`, `/pages/28/sections/2/content/text`.

**Alt:**

> Die Anfrage wird in unserem geschützten Kanzlei-Backend gespeichert. Bei eingerichtetem E-Mail-Versand erhalten wir zusätzlich eine Benachrichtigung über unseren konfigurierten Mailserver.

**Neu:**

> Wir speichern Ihre Anfrage im geschützten Verwaltungsbereich unserer Website. Sofern wir Benachrichtigungen per E-Mail versenden, enthalten diese den Eingangszeitpunkt, die Kennung der Anfrage und einen Link zu diesem Verwaltungsbereich. Den Inhalt Ihrer Nachricht rufen wir dort nach der Anmeldung ab.

Der Ersatz beschreibt die in `src/lib/mail.ts` vorhandene Benachrichtigung konkret: Der Nachrichtentext wird nicht mitgeschickt. SMTP bleibt in den geprüften Standardeinstellungen deaktiviert; daher keine bedingungslose Versandbehauptung einsetzen.

**Alt:**

> Nicht in eine Mandatsakte übernommene Formulareinträge werden entsprechend der für das Backend festgelegten Aufbewahrungsfrist gelöscht.

**Neu:**

> Nicht in eine Mandatsakte übernommene Formulareinträge löschen wir nach Ablauf der für Kontaktanfragen festgelegten Aufbewahrungsfrist.

Grund: aktive Kanzleiperspektive und verständliche Begriffe. Keine neue Aufbewahrungsdauer erfinden; eine konkrete Dauer muss mit dem tatsächlich gespeicherten Wert übereinstimmen.

## 3. P1 – Kenntnisnahme und Einwilligung widersprechen sich

Die Datenschutzhinweise sagen bereits ausdrücklich: „Die Bestätigung am Formular dokumentiert die Kenntnisnahme dieser Hinweise.“ Die zwei Oberflächentexte sollten dazu passen.

| Datei / Stelle | Exakter alter Text | Vorgeschlagener Ersatz |
| --- | --- | --- |
| `src/components/site/contact-form.tsx`, Checkbox; Link erhalten | `Ich habe die Datenschutzhinweise gelesen und bin mit der Verarbeitung meiner Angaben zur Beantwortung meiner Anfrage einverstanden.` | `Ich habe die Datenschutzhinweise zur Verarbeitung meiner Angaben gelesen.` |
| `src/components/admin/inquiry-inbox.tsx`, Zeitstempel | `Einwilligung erteilt:` | `Datenschutzhinweise bestätigt:` |

Grund: einheitliche Beschreibung dessen, was die Oberfläche tatsächlich abfragt. Keine zusätzliche Rechtsgrundlage durch die Beschriftung suggerieren. Der interne Feldname `consentAt` muss für diese reine Textkorrektur nicht geändert werden.

## 4. P2 – Beauftragungshinweis verweist in die falsche Richtung und spricht über die Kanzlei

Datei: `src/data/content.json`, `/pages/25/sections/6/content/text`.

**Alt:**

> Durch die Übersendung eines oder mehrerer der nachstehenden Dokumente wird kein Vertragsverhältnis mit der Rechtsanwaltskanzlei Hagn, Deckert, Stemmer & Partner begründet. Hierzu bedarf es der ausdrücklichen Annahme bzw. Bestätigung durch den Anwalt.

**Neu:**

> Durch die Übersendung dieser Formulare entsteht noch kein Mandatsverhältnis mit uns. Dafür ist unsere ausdrückliche Annahme oder Bestätigung erforderlich.

Grund: Die Formulare stehen oberhalb. „Mit uns“ entspricht der geforderten Kanzleiperspektive und dem bereits vorhandenen Hinweis am Kontaktformular. Die inhaltliche Voraussetzung bleibt erhalten.

## 5. P2 – Zwei fehlerhafte Suchergebnisbeschreibungen

Datei: `src/data/content.json`.

| JSON-Pfad | Alt | Neu |
| --- | --- | --- |
| `/pages/4/seo/description` | `Dr. iur. Niels Deckert, Rechtsanwalt in Ingolstadt. . Schwerpunkte: Immobilienrecht, Handels- und Gesellschaftsrecht, Zivilrecht allgemein.` | `Dr. iur. Niels Deckert berät Sie in unserer Kanzlei in Ingolstadt im Immobilienrecht, Handels- und Gesellschaftsrecht sowie im allgemeinen Zivilrecht.` |
| `/pages/9/seo/description` | `Ulrike Wagner, Rechtsanwältin in Ingolstadt. . Schwerpunkte: Familienrecht, Verkehrsrecht, Zivilrecht allgemein.` | `Ulrike Wagner berät und vertritt Sie in unserer Kanzlei in Ingolstadt im Familienrecht, Verkehrsrecht und allgemeinen Zivilrecht.` |

Grund: doppelter Punkt und holprige Schlagwortliste; der Ersatz bleibt bei den belegten Tätigkeitsschwerpunkten und ergänzt keine Qualifikation.

## 6. P2 – Ortsname in SEO-Titeln doppelt

Datei: `src/data/content.json`, `/pages/0/seo/title` sowie `/pages/11/seo/title` bis `/pages/24/seo/title`.

In genau diesen 15 Titeln das **exakte abschließende Fragment** ` | Hagn & Partner Ingolstadt` durch ` | Hagn & Partner` ersetzen. Der vordere Titelteil enthält bereits „in Ingolstadt“.

Beispiel vollständig: `Verkehrsrecht in Ingolstadt | Hagn & Partner Ingolstadt` → `Verkehrsrecht in Ingolstadt | Hagn & Partner`.

Grund: natürliche lokale Suchbegriffe ohne unnötige Wiederholung. Titel der Profile, Kanzlei und Kontaktseite sind hiervon nicht betroffen.

## 7. P2 – Fünf Leistungsbeschreibungen für Suchergebnisse sind unnötig lang

Datei: `src/data/content.json`. Es ist keine starre Zeichengrenze nötig; die Beschreibung soll den konkreten Nutzen lesbar zusammenfassen.

| JSON-Pfad | Alt | Neu |
| --- | --- | --- |
| `/pages/11/seo/description` | `Verkehrsrecht: Nach einem Unfall, bei einem Bußgeldbescheid oder bei Fragen zum Führerschein: Wir beraten und vertreten Sie im Verkehrsrecht und übernehmen die Korrespondenz mit Versicherungen und Behörden. Hagn, Deckert, Stemmer & Partner in Ingolstadt.` | `Wir beraten und vertreten Sie im Verkehrsrecht in Ingolstadt – nach einem Unfall, bei Bußgeldbescheiden und bei Fragen zur Fahrerlaubnis.` |
| `/pages/12/seo/description` | `Miet- und Wohnungseigentumsrecht: Wir beraten Mieter, Vermieter, Wohnungseigentümer und Hausverwaltungen zu Mietverhältnissen und Wohnungseigentum – von Vertragsfragen bis zur gerichtlichen Auseinandersetzung. Hagn, Deckert, Stemmer & Partner in Ingolstadt.` | `Wir beraten Mieter, Vermieter und Wohnungseigentümer in Ingolstadt. Ihr Ansprechpartner ist Fachanwalt Markus Stemmer.` |
| `/pages/13/seo/description` | `Arbeitsrecht: Wir vertreten Arbeitnehmer und Arbeitgeber bei Fragen zum Arbeitsvertrag, bei Kündigungen und in arbeitsrechtlichen Auseinandersetzungen. Hagn, Deckert, Stemmer & Partner in Ingolstadt.` | `Wir beraten Arbeitnehmer und Arbeitgeber in Ingolstadt zu Arbeitsverträgen, Kündigungen und weiteren arbeitsrechtlichen Fragen.` |
| `/pages/14/seo/description` | `Strafrecht: Wir verteidigen Sie in strafrechtlichen Ermittlungs- und Gerichtsverfahren. Gemeinsam besprechen wir den Vorwurf, die Aktenlage und die nächsten Schritte. Hagn, Deckert, Stemmer & Partner in Ingolstadt.` | `Wir verteidigen Sie in Ermittlungs- und Strafverfahren in Ingolstadt. Gemeinsam prüfen wir die Aktenlage und besprechen die Verteidigungsstrategie.` |
| `/pages/15/seo/description` | `Familienrecht: Bei Trennung, Scheidung und weiteren familienrechtlichen Fragen beraten wir Sie persönlich und vertreten Ihre Interessen mit dem erforderlichen Augenmaß. Hagn, Deckert, Stemmer & Partner in Ingolstadt.` | `Wir beraten und vertreten Sie in Ingolstadt bei Scheidung, Zugewinn, Unterhalt und Sorgerecht. Lernen Sie unsere Anwältinnen für Familienrecht kennen.` |

Grund: Die jetzigen Werte wiederholen Einleitung, Fachgebiet und Kanzleinamen mehrfach. Die Ersatztexte nennen ausschließlich belegte Themen und Personen. Die ausführlichen Seitentexte keinesfalls auf diese Kurzfassungen reduzieren.

## 8. P2 – Familienrecht-Absatz wiederholt das Schlüsselwort und spricht über die Kanzlei

Datei: `src/data/content.json`, `/pages/15/sections/1/content/text`.

**Alt:**

> Als Fachanwaltskanzlei für Familienrecht in Ingolstadt ist die gemeinsame Erarbeitung interessengerechter und zufriedenstellender Lösungen für Ihr familienrechtliches Problem unsere Priorität. Ob Scheidung, Zugewinn, Unterhalt oder Sorgerecht, im Bereich des Familienrechts ist neben einer soliden Rechtskenntnis auch Einfühlungsvermögen in den individuellen familienrechtlichen Fall gefordert. Nur so können unsere Fachanwälte für Familienrecht Lösungen erzielen, die Ihren spezifischen Interessen im Bereich Familienrecht gerecht werden.

**Neu:**

> Wir beraten und vertreten Sie in Ingolstadt bei Scheidung, Zugewinn, Unterhalt und Sorgerecht. Gemeinsam erarbeiten wir Lösungen, die Ihre Interessen und Ihre persönliche Situation berücksichtigen. Unsere Fachanwältinnen für Familienrecht verbinden fundierte Rechtskenntnisse mit dem nötigen Einfühlungsvermögen.

Grund: natürliche Kanzleiperspektive, keine Aneinanderreihung desselben Suchbegriffs. Alle vier konkreten Themen und die vorhandene fachliche Qualifikation bleiben erhalten. Der letzte Satz bezieht sich auf Radlinger und Haneder; Huxmann und Wagner erhalten dadurch keinen Fachanwaltstitel.

## 9. P2 – Sieben Profile enthalten identische, unnatürliche Listenprosa

Datei: `src/data/content.json`, jeweils `/pages/<Index>/sections/0/content/text`. Der zweite Satz mit dem Sekretariats- oder Direktkontakt bleibt jeweils exakt erhalten.

| Seite | Exakter erster Satz alt | Neuer erster Satz |
| --- | --- | --- |
| 3, Veronika Hagn | `Ich berate und vertrete Sie in den Bereichen Verkehrsrecht, Strafrecht, Zivilrecht allgemein.` | `Ich berate und vertrete Sie im Verkehrsrecht, im Strafrecht und im allgemeinen Zivilrecht.` |
| 4, Niels Deckert | `Ich berate und vertrete Sie in den Bereichen Immobilienrecht, Handels- und Gesellschaftsrecht, Zivilrecht allgemein.` | `Ich berate und vertrete Sie im Immobilienrecht, im Handels- und Gesellschaftsrecht sowie im allgemeinen Zivilrecht.` |
| 5, Markus Stemmer | `Ich berate und vertrete Sie in den Bereichen Miet- und Wohnungseigentumsrecht, Zwangsverwaltung, Verkehrsrecht.` | `Ich berate und vertrete Sie im Miet- und Wohnungseigentumsrecht, bei Fragen zur Zwangsverwaltung und im Verkehrsrecht.` |
| 6, Gabriele Radlinger | `Ich berate und vertrete Sie in den Bereichen Familienrecht, Verkehrsrecht, Zivilrecht allgemein.` | `Ich berate und vertrete Sie im Familienrecht, im Verkehrsrecht und im allgemeinen Zivilrecht.` |
| 7, Maria Haneder | `Ich berate und vertrete Sie in den Bereichen Arbeitsrecht, Familienrecht, Verkehrsrecht.` | `Ich berate und vertrete Sie im Arbeitsrecht, im Familienrecht und im Verkehrsrecht.` |
| 8, Eva Huxmann | `Ich berate und vertrete Sie in den Bereichen Familienrecht, Strafrecht, Verwaltungsrecht.` | `Ich berate und vertrete Sie im Familienrecht, im Strafrecht und im Verwaltungsrecht.` |
| 9, Ulrike Wagner | `Ich berate und vertrete Sie in den Bereichen Familienrecht, Verkehrsrecht, Zivilrecht allgemein.` | `Ich berate und vertrete Sie im Familienrecht, im Verkehrsrecht und im allgemeinen Zivilrecht.` |

Grund: vollständige natürliche Sätze statt aus Datenfeldern zusammengesetzter Stichwortfolgen. Die Ich-Perspektive im persönlichen Profil kann bleiben.

## 10. P2 – Sekretariatsadressen werden als persönliche E-Mail-Ziele beschriftet

Datei: `src/components/site/site-view.tsx`, Team-Renderer, zugänglicher Linkname `label={`${item.title} eine E-Mail schreiben`}`.

**Alt am Beispiel:** `Veronika Hagn eine E-Mail schreiben`.

**Neu:** `E-Mail an das Sekretariat von Veronika Hagn`.

Analog für Niels Deckert, Markus Stemmer, Gabriele Radlinger, Maria Haneder und Eva Huxmann. Sichtbar bei diesen Anwaltkarten vor der unveränderten Adresse `Sekretariat:` ergänzen. Die tatsächlichen Adressen und Durchwahlen nicht ändern. Bei Ulrike Wagner bleibt die direkte Adresse `rain.wagner@hagn-partner.de`; deren Linkname kann `E-Mail an Ulrike Wagner` lauten. Bei Sekretariatskarten lautet er `E-Mail an Susanna Nagel` usw.

Zusätzlich Datei `src/data/content.json`, `/pages/3` bis `/pages/8`, jeweils `/sections/0/content/secondaryLabel`: `E-Mail schreiben` → `Sekretariat kontaktieren`. `/pages/9` ausdrücklich ausnehmen.

Grund: Sechs Adressen gehören laut Quelleninventar zum Sekretariat. Die Profiltexte erklären das bereits, die auf zahlreichen Seiten wiederholten Karten noch nicht.

## 11. P2 – Übernommene Fachtexte enthalten konkrete Satz- und Schreibfehler

Datei: `src/data/content.json`. Nur die folgenden exakten Fragmente korrigieren; die langen fachlichen Aufzählungen und regionalen Gerichtsangaben erhalten.

| JSON-Pfad | Exaktes Fragment alt | Ersatz |
| --- | --- | --- |
| `/pages/11/sections/1/content/text` | `In den meisten Fällen genügt ein kurzer Moment der Unachtsamkeit, dass man unvermittelt mit dem Verkehrsrecht in Berührung kommt,` | `Oft genügt ein kurzer Moment der Unachtsamkeit, um unvermittelt mit dem Verkehrsrecht in Berührung zu kommen,` |
| gleich | `übernehmen wir die die gesamte Abwicklung` | `übernehmen wir die gesamte Abwicklung` |
| gleich | `– je nach Haftungsquote-` | `– je nach Haftungsquote –` |
| gleich | `Fahren ohne Fahrerlaubnis), ermittelt wird, oder Sie` | `Fahren ohne Fahrerlaubnis) ermittelt wird oder Sie` |
| gleich | `ermittelt wird, und Sie bereits` | `ermittelt wird und Sie bereits` |
| gleich | `Akteneinsicht bei Polizei` | `Akteneinsicht bei der Polizei` |
| gleich | `einen Freispruch, eine Einstellung, oder zumindest` | `einen Freispruch, eine Einstellung oder zumindest` |
| `/pages/11/sections/1/content/text`, `/pages/12/sections/1/content/text` | `z.B.` | `z. B.` |
| `/pages/13/sections/1/content/text` | `Geschäftsführer, sowie Betriebs- und Personalräte` | `Geschäftsführer sowie Betriebs- und Personalräte` |
| `/pages/14/sections/1/content/text` | `in Ermittlungsverfahren, Straf- Ordnungswidrigkeitsverfahren` | `in Ermittlungsverfahren sowie in Straf- und Ordnungswidrigkeitenverfahren` |
| `/pages/11/sections/1/content/text`, `/pages/12/sections/1/content/text` | `Wir vertreten alle Parteien vorwiegend` | `Wir vertreten unsere Mandanten vorwiegend` |
| `/pages/13/sections/1/content/text` | `Wir vertreten alle Arbeitsvertragsparteien vorwiegend` | `Wir vertreten unsere Mandanten vorwiegend` |

Grund beim letzten Punkt: Der jeweilige Text nennt die beratenen Personengruppen bereits. „Alle Parteien“ ist unnötig missverständlich und kann als gemeinsame Vertretung gegnerischer Seiten gelesen werden.

## 12. P2 – Schreibfehler im beruflichen Werdegang

Datei: `src/data/content.json`; auch in wiederholten `details`-Feldern derselben Person konsistent korrigieren.

| Ort / Fundstelle | Exaktes Fragment alt | Ersatz |
| --- | --- | --- |
| Deckert, insbesondere `/pages/4/sections/1/content/items/3/title` | `Nach Doktorratsstudium` | `Nach Doktoratsstudium` |
| Stemmer, insbesondere `/pages/5/sections/1/content/items/3/title` | `IGZ- geprüfter Zwangsverwalter (mit Auszeichnung)` | `IGZ-geprüfter Zwangsverwalter (mit Auszeichnung)` |
| Huxmann, insbesondere `/pages/8/sections/1/content/items/1/title` | `Duales Studium zur Diplom Verwaltungswirtin (FH) mit anschließender Tätigkeit beim Landschaftsverband Westfalen Lippe` | `Duales Studium zur Diplom-Verwaltungswirtin (FH) mit anschließender Tätigkeit beim Landschaftsverband Westfalen-Lippe` |
| Wagner, `/pages/9/sections/1/content/items/2/title` und wiederholte `details` | `WEISSER RING - Gemeinnütziger Verein zur Unterstützung von Kriminalitätsopfern und zur Verhütung von Straftaten e. V.` | `Mitglied bei WEISSER RING e. V. – gemeinnütziger Verein zur Unterstützung von Kriminalitätsopfern und zur Verhütung von Straftaten` |

Grund: Rechtschreibung und verständliche Einordnung. Die Mitgliedschaft ist im Originalprofil ausdrücklich unter „Mitgliedschaften“ aufgeführt. Dissertationsthema, Universitäten, Auszeichnung und Organisation nicht streichen.

## 13. P2 – Wiederholte Allgemeinformeln durch konkrete Überschriften ersetzen

Datei: `src/data/content.json`.

| Ort | Alt | Neu |
| --- | --- | --- |
| `/pages/0/sections/2/content/heading` | `Das passende Wissen\nfür Ihr Anliegen.` | `Unsere Rechtsgebiete.` |
| `/pages/0/sections/3/content/heading` | `Persönlich an Ihrer Seite.` | `Unsere Rechtsanwälte\nund Fachanwälte.` |
| `/pages/1/sections/1/content/heading` | `Ihr Anliegen verdient\nunseren vollen Blick.` | `Persönliche Beratung.\nRealistische Einschätzung.` |
| alle 26 vorhandenen `cta`-Abschnitte, `content.heading` | `Ihr nächster Schritt?\nEin persönliches Gespräch.` | `Vereinbaren Sie\neinen Gesprächstermin.` |
| dieselben `cta`-Abschnitte, `content.text` | `Schildern Sie uns Ihr Anliegen. Wir nehmen uns Zeit für die rechtliche Einordnung und Ihre Fragen.` | `Rufen Sie uns an oder schreiben Sie uns, um einen Termin zu vereinbaren. Bitte nennen Sie laufende Fristen schon bei der Kontaktaufnahme.` |
| `/config/consent/title` | `Ihre Privatsphäre ist uns wichtig.` | `Ihre Datenschutzeinstellungen.` |

Zusätzlich `src/lib/section-library.ts`, `defaults.cta`: `Wir sind für Sie da.` → `Vereinbaren Sie einen Termin.`; zugehöriger Text `Vereinbaren Sie einen Termin mit uns.` → `Rufen Sie uns an oder schreiben Sie uns. In dringenden Fällen empfehlen wir einen Anruf.`

Grund: „an Ihrer Seite“, „voller Blick“, die rhetorische Frage in allen Abschlussblöcken und die Privatsphäre-Floskel transportieren wenig konkrete Information. Die Ersatztexte greifen belegte Arbeitsweise und Terminorganisation auf. Den tatsächlichen Kanzleileitsatz **„Juristen aus Überzeugung“** ausdrücklich erhalten.

## 14. P2 – Test-E-Mail-Satz verliert bei vorhandener Adresse das Verb

Datei: `src/components/admin/site-settings.tsx`, Abschnitt „Verbindung prüfen“.

**Alt als JSX:**

```tsx
Eine Test-E-Mail wird an die gespeicherte Empfänger-Adresse {settings.smtp.to ? <strong>{settings.smtp.to}</strong> : "gesendet"}. Prüfen Sie anschließend auch Ihren Spam-Ordner.
```

**Neu als JSX:**

```tsx
Mit „Test-E-Mail senden“ senden Sie eine Nachricht an die gespeicherte Empfängeradresse{settings.smtp.to ? <> <strong>{settings.smtp.to}</strong></> : null}. Prüfen Sie anschließend auch Ihren Spam-Ordner.
```

Zusätzliche Beschriftung dort: `Empfänger der Kontaktanfragen` → `Empfängeradresse für Benachrichtigungen`.

Grund: Bei konfiguriertem Empfänger steht aktuell „Eine Test-E-Mail wird an ... info@... .“ Der Ersatz benennt außerdem den konkreten auslösenden Klick. Es wurde keine Test-E-Mail verschickt.

## 15. P2 – Englische Entwicklerbegriffe in der einfachen Verwaltung

Diese sind keine notwendigen Fachbegriffe für die Kanzleimitarbeiter. Technisch erforderliche Bezeichnungen wie SMTP-Server, TLS und Port können an den Verbindungsfeldern bleiben.

| Datei / Stelle | Exakter alter Text | Ersatz |
| --- | --- | --- |
| `src/components/admin/section-inspector.tsx` | `Dient Ihrer Orientierung im Backend.` | `Dieser Name hilft Ihnen, den Abschnitt im Seitenaufbau wiederzufinden. Er erscheint nicht auf der öffentlichen Website.` |
| gleiche Datei | `Buttons und Verweise` | `Schaltflächen und Links` |
| gleiche Datei, vier Beschriftungen | `Erster Button · Beschriftung`, `Erster Button · Linkziel`, `Zweiter Button · Beschriftung`, `Zweiter Button · Linkziel` | `Erste Schaltfläche · Beschriftung`, `Erste Schaltfläche · Linkziel`, `Zweite Schaltfläche · Beschriftung`, `Zweite Schaltfläche · Linkziel` |
| gleiche Datei, Symbolauswahl | `Icon`, `Icon ändern`, `Icon auswählen`, `Kein Icon` | `Symbol`, `Symbol ändern`, `Symbol auswählen`, `Kein Symbol` |
| `src/components/admin/site-settings.tsx`, Titel zweimal und Tab | `Navigation & Footer` | `Navigation & Fußbereich` |
| gleiche Datei, Zwischenüberschrift | `Footer` | `Fußbereich` |
| gleiche Datei | `Diese Angaben werden in Kontaktbereichen, Navigation, Footer und strukturierten Daten verwendet.` | `Diese Angaben erscheinen in den Kontaktbereichen, in der Navigation und im Fußbereich. Sie werden auch für Suchmaschinen bereitgestellt.` |
| gleiche Datei | `Kontaktanfragen werden immer im Backend gespeichert. Mit SMTP erhalten Sie zusätzlich eine Benachrichtigung per E-Mail.` | `Kontaktanfragen finden Sie unter „Anfragen“. Wenn Sie den E-Mail-Versand einrichten, erhalten Sie zusätzlich eine Benachrichtigung.` |
| `src/components/admin/dashboard-help.tsx`, Leitfaden „Eine Seite bearbeiten ...“ | `Über „Inhalt“ rechts erreichen Sie außerdem Bilder, Buttons und wiederkehrende Einträge.` | `Über „Inhalt“ rechts bearbeiten Sie außerdem Bilder, Schaltflächen und wiederkehrende Einträge.` |
| gleiche Datei, E-Mail-Leitfaden | `Anfragen bleiben unabhängig vom E-Mail-Versand im Backend erhalten.` | `Anfragen bleiben unabhängig vom E-Mail-Versand unter „Anfragen“ erhalten.` |
| `src/components/site/editable.tsx`, nur im Editor sichtbar | `Laden Sie zuerst ein Bild in der Mediathek des CMS hoch.` | `Laden Sie zuerst ein Bild unter „Medien“ hoch.` |

Für die zugänglichen Symbolnamen in `section-inspector.tsx` zusätzlich `Icon ${name}` durch deutsche Namen ersetzen, z. B. `Symbol: Pfeil nach rechts oben` statt `Icon arrow-up-right`; Schlüssel in den Daten unverändert lassen. Die vorhandenen verständlichen Handlungsanleitungen in der Verwaltung sind sinnvoll und keine versehentlich veröffentlichten Regieanweisungen.

## 16. P3 – Einzahl bei einer einzelnen Kontaktperson

Datei: `src/data/content.json`; jeweils vollständiger alter Text `Ihre Ansprechpartner.`.

| JSON-Pfad | Ersatz |
| --- | --- |
| `/pages/12/sections/3/content/heading` | `Ihr Ansprechpartner.` |
| `/pages/13/sections/3/content/heading` | `Ihre Ansprechpartnerin.` |
| `/pages/16/sections/1/content/heading` | `Ihr Ansprechpartner.` |
| `/pages/17/sections/1/content/heading` | `Ihr Ansprechpartner.` |
| `/pages/19/sections/1/content/heading` | `Ihr Ansprechpartner.` |
| `/pages/20/sections/1/content/heading` | `Ihre Ansprechpartnerin.` |
| `/pages/24/sections/1/content/heading` | `Ihre Ansprechpartnerin.` |

Grund: Die jeweilige Seite nennt genau eine Person. Keine zusätzlichen Personen ergänzen, nur um die Überschrift zu rechtfertigen.

## 17. P3 – Redaktioneller Bildhinweis im Alternativtext

Datei: `src/data/content.json`, `/pages/26/sections/2/content/image/alt`.

**Alt:** `Architektur in Ingolstadt – ergänzendes Stadtmotiv, keine Aufnahme unseres Kanzleigebäudes`.

**Neu:** `Architektur am Nordbahnhof in Ingolstadt`.

Grund: Der Alternativtext soll das Bild beschreiben. „Ergänzendes Stadtmotiv“ ist eine redaktionelle Einordnung. Der Ort ist im Bildinventar belegt. Der Bildnachweis im Impressum kann weiter klarstellen, dass das Stadtbild nicht die Kanzlei zeigt. Der aktuelle Map-Renderer gibt dieses Bild noch nicht aus; daher P3.

## 18. P2 – Bearbeitungsplatzhalter können als echter Text veröffentlicht werden

| Datei | Exakter alter Text / Wert | Ersatz und Verhalten |
| --- | --- | --- |
| `src/components/admin/section-inspector.tsx`, neuer Eintrag | `title: "Neuer Eintrag"` | `title: ""`; die vorhandene Editoranzeige „Eintrag ohne Titel“ verwenden und vor der Veröffentlichung fehlenden Inhalt gezielt anzeigen. |
| `src/components/admin/site-settings.tsx`, neuer Navigationspunkt | `label: "Neuer Link"` | `label: ""`; den echten Namen im Eingabefeld anfordern und einen leeren Navigationspunkt vor Veröffentlichung beanstanden. |

Grund: „Neuer Eintrag“ und „Neuer Link“ sind Bearbeitungszustände, keine Kanzleitexte. Den Platzhalter nicht durch eine andere veröffentlichbare Allgemeinfloskel ersetzen. Die Ausgangswebsite selbst enthält diese Werte noch nicht.

## Beizubehalten

- Die vollständigen fachlichen Texte zu Verkehrsrecht, Miet- und Wohnungseigentumsrecht, Arbeitsrecht und Strafrecht einschließlich der Beispiele, Anspruchsarten und regionalen Gerichte. Die oben genannten Sprachkorrekturen rechtfertigen keine Verkürzung auf die Teaser.
- Alle fünf im Original belegten Sekretariatsmitarbeiterinnen und die Ausbildungs-, Mitgliedschafts- und Kontaktdetails der sieben Anwälte. Im Team-Renderer derzeit nicht ausgegebene `details` sind im Inhalt weiterhin vorhanden.
- Die bewusst zurückhaltenden Texte zu nur in Navigation oder Profilen belegten Rechtsgebieten. Keine unbewiesenen Leistungskataloge, Fallbeispiele oder Fachanwaltstitel ergänzen.
- Alle neun Original-PDFs und der inhaltlich richtige Hinweis zur ausdrücklichen Mandatsannahme. Der ungewöhnliche Dateiname `schweigepfilcht-entbindung.pdf` ist kein sichtbarer Schreibfehler und soll als bestehende Adresse erhalten bleiben.
- Keine jährlichen Erfolgszahlen, Mandantenstimmen, Garantien oder zusätzlichen Qualifikationen als Ersatz für leere Kennzahl- oder Zitatbausteine erfinden.

## Abschließender unabhängiger Durchgang nach Ergänzung der vier Entwürfe

Erneut geprüft am 20. Oktober 2026: alle 29 Seiten mit 144 Abschnitten einschließlich Metadaten und wiederholter Personendaten, die Ergänzungen in `scripts/enhance-content.mjs`, sämtliche öffentlichen Varianten in `src/components/site/variants/` sowie Kontaktformular, Cookie-Dialog, Fußnavigation, Blogausgabe und die Fehlerseiten. Maßstab sind die archivierten Originalinhalte in `docs/content-data.json`; dies bleibt eine Textprüfung und keine rechtliche Aktualitätsprüfung.

**Zwei Korrekturen umgesetzt:** Auf der Strafrechtsseite passten zwei neue Akkordeonüberschriften nicht zum jeweils erhaltenen Originalabsatz. `/pages/14/sections/3/content/items/2/title` lautet nun „Verteidigung im Jugendstrafverfahren“ statt „Akteneinsicht und weiteres Vorgehen“. `/pages/14/sections/3/content/items/4/title` lautet nun „Vertretung vor den Strafgerichten“ statt „Opfer- und Zeugenvertretung“. Die Korrekturen stehen in `scripts/enhance-content.mjs` und in der daraus erzeugten `src/data/content.json`. Die Absätze selbst bleiben vollständig erhalten; die Opfer- und Zeugenvertretung steht weiterhin im dafür einschlägigen Leistungstext und in der Schwerpunktkarte. Beim gezielten Generatorlauf änderten sich ausschließlich diese beiden Titel.

**An die Hauptaufgabe für die TSX-Umsetzung gemeldet:** In allen vier Teamdarstellungen müssen die sechs Sekretariatsadressen auch sichtbar als „Sekretariat:“ gekennzeichnet sein; der bereits vorhandene zugängliche Name allein genügt dafür nicht. Die persönliche Adresse von Ulrike Wagner und die Karten der Sekretariatsmitarbeiterinnen behalten ihre bisherigen Bezeichnungen. In `panorama.tsx` muss der allgemeine Sprunglink „Weiter zum Bild“ heißen, da die betreffenden Bilder auch Porträts oder Stadtansichten zeigen. Außerdem fehlen in den Entwürfen 1 bis 3 bei Profilseiten und Rechtstexten Hauptüberschriften der Ebene `h1`, weil deren erste Abschnitte vom Typ `split` bzw. `richtext` sind; der erste sichtbare Abschnitt soll dort wie im vierten Entwurf die Seitenhauptüberschrift bilden.

**Inhaltlich bestätigt:** Die neuen Schwerpunktkarten enthalten ausschließlich in den Originaltexten belegte Leistungen. Die Fachanwaltstitel bleiben auf Hagn (Verkehrsrecht und Strafrecht), Stemmer (Miet- und Wohnungseigentumsrecht), Radlinger (Familienrecht) und Haneder (Familienrecht und Arbeitsrecht) beschränkt. Deckert, Huxmann und Wagner erhalten keinen Fachanwaltstitel. Alle drei Angaben zu 190 Euro enthalten weiter Verbraucherbezug, erstes Beratungsgespräch, fehlende gesonderte Gebührenvereinbarung, Umsatzsteuer und Abrechnung nach Aufwand. Die abweichenden Durchwahlen bleiben richtig zugeordnet. Der Blog ist deaktiviert und enthält keine Beiträge. Keine neuen Erfolgsbehauptungen, Bewertungen, Fallzahlen oder zusätzlichen Qualifikationen gefunden; keine öffentlichen Regieanweisungen in den Kanzleitexten gefunden. Die Entwurfsauswahl gehört zur ausdrücklich vorgesehenen Vorschau.

**Verifikation dieses Durchgangs:** Alle sechs vorhandenen Inhaltstests bestehen (`node --import=tsx --test tests/content.test.ts`), einschließlich Schema-, Veröffentlichungs- und Linkprüfung. Ein weiterer Lauf mit `node scripts/build-content.mjs --content-only` liefert bytegleichen Inhalt. Die Mediathek blieb unverändert. 29 Seiten, 144 Abschnitte, drei vollständige Gebührenangaben, deaktivierter Blog und null Beiträge erneut geprüft.
# Abschließende Bestätigung der neuen Gestaltungskomponenten

Ein weiterer unabhängiger Text-Subagent hat die zuletzt ergänzten Hero-, Navy- und Noir-Komponenten sowie die gemeinsame Inhaltsbasis geprüft. Ergebnis: keine neuen erfundenen Bewertungen, Qualifikationen, Erfolgsbehauptungen, AI-Floskeln oder öffentlichen Regieanweisungen gefunden. Die festen zusätzlichen Texte sind passende Bedienbeschriftungen; Kanzlei-, Personen- und Leistungstexte stammen aus den bereits geprüften 29 Seiten und 144 Abschnitten. Es waren keine weiteren Textänderungen nötig.

## Bestätigung der Google-Maps-Ergänzung

Ein eigener lesender Kontrollgang prüfte die anschließend gewünschte interaktive Karte und den ergänzten Datenschutztext. Keine konkreten sprachlichen oder technischen Widersprüche: Einmalfreigabe, Kategorie „Externe Medien“ und Widerruf entsprechen dem Verhalten. Anbieter und Datenarten wurden anhand der aktuellen [Google-Nutzungsbedingungen](https://policies.google.com/terms?hl=de&gl=de) und [Google-Datenschutzerklärung](https://policies.google.com/privacy?hl=de) kontrolliert. Dies ist keine rechtliche Zertifizierung.

