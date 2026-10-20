"""Build a compact, source-attributed migration inventory from the archive."""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

from bs4 import BeautifulSoup
from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://www.hagn-partner.de/"
ARCHIVE = ROOT / "docs/source"
raw = json.loads((ARCHIVE / "raw-inventory.json").read_text(encoding="utf-8"))


def tidy(value):
    return re.sub(r"\s+", " ", value).strip()


def page_soup(slug):
    return BeautifulSoup((ARCHIVE / f"{slug}.html").read_text(encoding="utf-8"), "html.parser")


def main(slug):
    soup = page_soup(slug)
    return soup.select_one("#maininfo") or soup.select_one("#content")


def paragraphs(slug, stop_at_shared=True):
    result = []
    for child in main(slug).find_all(recursive=False):
        text = tidy(child.get_text(" ", strip=True))
        if stop_at_shared and child.name == "h2" and text.startswith("Ihre Anwälte in Ingolstadt"):
            break
        if child.name == "p" and text and not child.get("class"):
            result.append(text)
    return result


def heading_list(slug, heading):
    for h in main(slug).find_all(["h2", "h3", "h4"]):
        if tidy(h.get_text(" ", strip=True)) == heading:
            following = h.find_next_sibling("ul")
            return [tidy(li.get_text(" ", strip=True)) for li in following.find_all("li", recursive=False)] if following else []
    return []


people_specs = [
    ("veronika-hagn", "Veronika Hagn", "Rechtsanwältin", ["Fachanwältin für Verkehrsrecht", "Fachanwältin für Strafrecht"], 2010, "Ilona Epstein", "epstein@hagn-partner.de", "+49 841 93557-20", "veronika-hagn"),
    ("niels-deckert", "Dr. iur. Niels Deckert", "Rechtsanwalt", [], 1994, "Susanna Nagel", "nagel@hagn-partner.de", "+49 841 93557-10", "niels-deckert"),
    ("markus-stemmer", "Markus Stemmer", "Rechtsanwalt", ["Fachanwalt für Miet- und Wohnungseigentumsrecht", "IGZ-geprüfter Zwangsverwalter"], 2002, "Aylin Durgut", "durgut@hagn-partner.de", "+49 841 93557-22", "markus-stemmer"),
    ("gabriele-radlinger", "Gabriele Radlinger", "Rechtsanwältin", ["Fachanwältin für Familienrecht"], 1994, "Monika Kürzinger", "kuerzinger@hagn-partner.de", "+49 841 93557-21", "gabriela-radlinger"),
    ("maria-haneder", "Maria Haneder", "Rechtsanwältin", ["Fachanwältin für Familienrecht", "Fachanwältin für Arbeitsrecht"], 1999, "Ilona Epstein", "epstein@hagn-partner.de", "+49 841 93557-20", "maria-haneder"),
    ("eva-huxmann", "Eva Huxmann", "Rechtsanwältin", ["Dipl. Verwaltungswirtin (FH)"], 2025, "Annalena Baumanis", "baumanis@hagn-partner.de", "+49 841 93557-17", "eva-huxmann"),
    ("ulrike-wagner", "Ulrike Wagner", "Rechtsanwältin", [], 2024, "Annalena Baumanis", "rain.wagner@hagn-partner.de", "+49 841 93557-25", "ulrike-wagner"),
]
people = []
for person_id, name, role, qualifications, year, secretary, email, phone, image_slug in people_specs:
    slug = person_id + "-anwalt-ingolstadt"
    people.append({
        "id": person_id, "name": name, "role": role, "qualifications": qualifications,
        "admissionYear": year, "focusAreas": heading_list(slug, "Tätigkeitsschwerpunkte"),
        "education": heading_list(slug, "Ausbildung"), "memberships": heading_list(slug, "Mitgliedschaften"),
        "contact": {"secretariatName": secretary, "email": email, "phone": phone, "fax": "+49 841 93557-44", "emailIsPersonalLawyerAddress": person_id == "ulrike-wagner"},
        "portrait": f"/images/anwalt-ingolstadt-{image_slug}.jpg",
        "cardPortrait": f"/images/rechtsanwalt-ingolstadt-{image_slug}.jpg",
        "introPortrait": f"/images/intro-{person_id}-{'anwalt' if role == 'Rechtsanwalt' else 'anwaeltin'}-ingolstadt.jpg",
        "imageAlt": f"{name}, {role} bei Hagn, Deckert, Stemmer & Partner in Ingolstadt",
        "recommendedCrop": {"grid": "top-center", "objectPosition": "50% 0%", "rationale": "Kopf und Gesicht im oberen Bilddrittel erhalten; Originalbreite 650 px, nicht stark hochskalieren."},
        "sourceUrl": BASE + slug,
    })

secretariat_specs = [
    ("susanna-nagel", "Susanna Nagel", "Rechtsanwaltsfachangestellte, Bürovorsteherin und geprüfte Rechtsfachwirtin", 1989, "+49 841 93557-10", "nagel@hagn-partner.de"),
    ("ilona-epstein", "Ilona Epstein", "Rechtsanwaltsfachangestellte und Sachbearbeiterin für Arbeitsrecht, Zwangsvollstreckung und Familienrecht", 1999, "+49 841 93557-20", "epstein@hagn-partner.de"),
    ("monika-kuerzinger", "Monika Kürzinger", "Rechtsanwaltsfachangestellte", None, "+49 841 93557-21", "kuerzinger@hagn-partner.de"),
    ("annalena-baumanis", "Annalena Baumanis", "Rechtsanwaltsfachangestellte und geprüfte Rechtsfachwirtin", None, "+49 841 93557-25", "baumanis@hagn-partner.de"),
    ("aylin-durgut", "Aylin Durgut", "Rechtsanwaltsfachangestellte", None, "+49 841 93557-22", "durgut@hagn-partner.de"),
]
secretariat = [{"id": i, "name": n, "role": r, "withFirmSince": y, "phone": t, "email": e, "fax": "+49 841 93557-44", "portrait": f"/images/rechtsanwalt-ingolstadt-{i}.jpg", "imageAlt": f"{n}, Sekretariat Hagn, Deckert, Stemmer & Partner", "recommendedCrop": {"grid": "top-center", "objectPosition": "50% 0%"}, "sourceUrl": BASE + "ingolstadt-anwaltskanzlei"} for i, n, r, y, t, e in secretariat_specs]

service_specs = [
    ("verkehrsrecht", "Verkehrsrecht", "verkehrsrecht-rechtsanwalt-ingolstadt", ["veronika-hagn", "markus-stemmer", "gabriele-radlinger", "maria-haneder", "ulrike-wagner"], ["Verkehrsunfallrecht und Schadensregulierung", "Verkehrsstrafrecht", "Ordnungswidrigkeitenrecht", "Fahrerlaubnisrecht", "Verkehrsvertragsrecht", "Kfz-Versicherungsrecht"]),
    ("mietrecht", "Miet- und Wohnungseigentumsrecht", "mietrecht-rechtsanwalt-ingolstadt", ["markus-stemmer"], ["Mietverträge", "Kündigungen und Räumungsklagen", "Mietzahlungen und Nebenkosten", "Mietminderung und Mieterhöhung", "Hausgeldabrechnungen und Wirtschaftspläne", "Beschlüsse und Hausverwaltung"]),
    ("arbeitsrecht", "Arbeitsrecht", "arbeitsrecht-rechtsanwalt-ingolstadt", ["maria-haneder"], ["Arbeitsverträge", "Kündigungen und Kündigungsschutz", "Aufhebungs- und Abwicklungsverträge", "Abmahnungen", "Zeugnisse, Lohn und Urlaub", "Betriebsumstrukturierung und Betriebsübergang"]),
    ("strafrecht", "Strafrecht", "strafrecht-rechtsanwalt-ingolstadt", ["veronika-hagn", "eva-huxmann"], ["Ermittlungsverfahren", "Akteneinsicht und Verteidigungsstrategie", "Straf- und Ordnungswidrigkeitenverfahren", "Jugendstrafrecht", "Untersuchungshaft", "Strafbefehlsverfahren", "Interessenvertretung von Opfern und Zeugen"]),
    ("familienrecht", "Familienrecht", "familienrecht-rechtsanwalt-ingolstadt", ["gabriele-radlinger", "maria-haneder", "eva-huxmann", "ulrike-wagner"], ["Scheidung", "Zugewinn", "Unterhalt", "Sorgerecht"]),
    ("immobilienrecht", "Immobilienrecht", None, ["niels-deckert"], []),
    ("handels-gesellschaftsrecht", "Handels- und Gesellschaftsrecht", None, ["niels-deckert"], []),
    ("zivilrecht", "Zivilrecht allgemein", None, ["niels-deckert", "gabriele-radlinger", "veronika-hagn", "ulrike-wagner"], []),
    ("zwangsverwaltung", "Zwangsverwaltung", None, ["markus-stemmer"], []),
    ("opfervertretung", "Opfervertretung", None, ["veronika-hagn"], []),
    ("erbrecht", "Erbrecht", None, [], []),
    ("privates-baurecht", "Privates Baurecht", None, [], []),
    ("forderungsmanagement", "Forderungsmanagement", None, [], []),
    ("verwaltungsrecht", "Verwaltungsrecht", None, ["eva-huxmann"], []),
]
services = []
for service_id, name, slug, person_ids, topics in service_specs:
    body = paragraphs(slug) if slug else []
    # Detailed service pages append a lawyer profile; use only the service body.
    if slug and slug != "arbeitsrecht-rechtsanwalt-ingolstadt":
        service_main = main(slug)
        body = []
        for child in service_main.find_all(recursive=False):
            if child.name == "h4" and "anwalt" in child.get("class", []):
                break
            if child.name == "h2" and tidy(child.get_text(" ", strip=True)).startswith("Ihre Anwälte"):
                break
            if child.name == "p" and child.get_text(strip=True):
                body.append(tidy(child.get_text(" ", strip=True)))
    services.append({"id": service_id, "name": name, "people": person_ids, "topics": topics, "sourceParagraphs": body,
        "sourceUrl": BASE + (slug or "rechtsgebiete-anwalt-ingolstadt"),
        "additionalSourceUrls": [p["sourceUrl"] for p in people if p["id"] in person_ids],
        "sourceCoverage": "dedicated-page" if slug else ("profile-focus" if person_ids and service_id not in {"opfervertretung"} else "navigation-and-criminal-page" if service_id == "opfervertretung" else "navigation-only"),
        "listedInMainNavigation": service_id != "verwaltungsrecht"})

contact = {
    "legalName": "Hagn, Deckert, Stemmer & Partner PartG mbB", "displayName": "Hagn & Partner", "city": "Ingolstadt",
    "address": {"street": "Bergbräustraße 7", "postalCode": "85049", "city": "Ingolstadt", "country": "DE"},
    "addressSourceSpelling": "Bergbräustr. 7, 85049 Ingolstadt",
    "phone": "+49 841 93557-0", "phoneUri": "tel:+49841935570", "fax": "+49 841 93557-44", "email": "info@hagn-partner.de",
    "officeHours": [
        {"day": "Montag", "schemaDay": "Monday", "periods": [["08:00", "12:00"], ["14:00", "17:00"]]},
        {"day": "Dienstag", "schemaDay": "Tuesday", "periods": [["08:00", "12:00"], ["14:00", "17:00"]]},
        {"day": "Mittwoch", "schemaDay": "Wednesday", "periods": [["08:00", "12:00"]]},
        {"day": "Donnerstag", "schemaDay": "Thursday", "periods": [["08:00", "12:00"], ["14:00", "17:00"]]},
        {"day": "Freitag", "schemaDay": "Friday", "periods": [["08:00", "12:00"]]},
    ],
    "appointmentNote": "Termine nach Vereinbarung", "directions": "Die Kanzlei befindet sich im Herzen Ingolstadts, direkt neben der Tiefgarage „Am Münster“.",
    "urgentContactNote": "In dringenden Fällen empfiehlt sich ein Anruf in unserer Kanzlei.",
    "sourceUrl": BASE + "impressum", "directionsSourceUrl": BASE + "anwaltskanzlei-ingolstadt",
    "legacyExternalServices": [
        {"label": "Sicherer Mandantenbereich", "url": "https://secure.e-consult-ag.de/e.consult.537/webakte/home/index", "status": "only observed inside commented legacy navigation; not functionally tested"},
        {"label": "Erstanfrage über e.Consult", "url": "https://secure.e-consult-ag.de//e.consult.537/ExternalRequest/Start?FormId=507325", "status": "only observed inside commented legacy navigation; not functionally tested"}
    ],
}

downloads = []
pdf_dir = ARCHIVE / "pdf"
pdf_dir.mkdir(exist_ok=True)
for a in raw["assets"]:
    if a.get("type") != "download" or not a.get("localPath"):
        continue
    path = ROOT / "public" / a["localPath"].lstrip("/")
    reader = PdfReader(path)
    text = "\n\n".join(page.extract_text() or "" for page in reader.pages)
    (pdf_dir / (path.stem + ".txt")).write_text(text, encoding="utf-8")
    label = a.get("label", "").removesuffix(" »").removeprefix("Formular: ")
    downloads.append({"label": label, "path": a["localPath"], "sourceUrl": a["sourceUrl"], "bytes": a["bytes"], "pages": len(reader.pages), "format": "PDF", "category": "Vollmachten" if "vollmacht" in path.stem else "Formulare", "sha256": a["sha256"]})

image_inventory = []
for a in raw["assets"]:
    if not a.get("width") or a.get("localPath", "").endswith("captcha.php"):
        continue
    image_inventory.append({k: a[k] for k in ["localPath", "sourceUrl", "width", "height", "bytes", "sha256"] if k in a} | {"credit": "Stefan Bösl Fotografie, Ingolstadt" if a.get("contentType", "").startswith("image/jpeg") else "Hagn, Deckert, Stemmer & Partner / ursprüngliches Webdesign", "origin": "original-site"})

unsplash_specs = [
    ("ingolstadt-architektur-unsplash-dieter-k.jpg", "Ingolstadt Nordbahnhof: Betonwand, Haltestellenschild und Sitzbank", "Dieter K", "https://unsplash.com/@dieter_muenchen", "https://unsplash.com/photos/white-and-black-wall-mounted-device-y0Y5DUr4CcQ", "https://images.unsplash.com/photo-1622394539922-0af849170b66?auto=format&fit=crop&fm=jpg&q=85&w=2400"),
    ("ingolstadt-altstadt-unsplash-nelson-wong.jpg", "Brunnen und historische Architektur in Ingolstadt", "Nelson Wong", "https://unsplash.com/@nelsonwongisme", "https://unsplash.com/photos/a-statue-of-a-person-on-a-horse-in-a-fountain-VMN5eDumrCo", "https://images.unsplash.com/photo-1650801589343-97beba2f9f7b?auto=format&fit=crop&fm=jpg&q=85&w=2400"),
]
for filename, alt, author, author_url, page_url, image_url in unsplash_specs:
    path = ROOT / "public/images" / filename
    im = Image.open(path)
    image_inventory.append({"localPath": "/images/" + filename, "sourceUrl": image_url, "sourcePage": page_url, "width": im.width, "height": im.height, "bytes": path.stat().st_size, "sha256": hashlib.sha256(path.read_bytes()).hexdigest(), "credit": author + " / Unsplash", "creditUrl": author_url, "license": "Unsplash License", "licenseUrl": "https://unsplash.com/license", "origin": "unsplash", "alt": alt, "optional": True, "usageNote": "Zusätzliches lokales Kontextmotiv. Nicht als Foto des Kanzleigebäudes bezeichnen."})

canonical_pages = []
for p in raw["pages"]:
    if p.get("archivedOrCommentedLink") or "/anwaelte-ingolstadt/" in p["url"]:
        continue
    slug = p["slug"]
    m = main(slug)
    clean_text = m.get_text("\n", strip=True) if m else ""
    (ARCHIVE / (slug + ".main.txt")).write_text(clean_text + "\n", encoding="utf-8")
    blocks = [{"type": c.name, "text": tidy(c.get_text(" ", strip=True))} for c in m.find_all(recursive=False) if c.name in {"h1", "h2", "h3", "h4", "p", "ul"} and c.get_text(strip=True)]
    canonical_pages.append({"sourceUrl": p["url"], "sourceSlug": slug, "sourceTitle": p["title"], "sourceDescription": p.get("description", ""), "mainText": clean_text, "sourceBlocks": blocks, "legacyDuplicate": slug == "anwaltskanzlei-in-ingolstadt"})

cost_paragraphs = paragraphs("anwalt-ingolstadt")
data = {
    "source": BASE, "retrievedAt": raw["retrievedAt"], "contentLanguage": "de-DE",
    "contact": contact,
    "firm": {"foundedOn": "1978-06-01", "atCurrentAddressSince": 1990, "lawyerCount": 7, "sourceUrl": BASE + "anwaltskanzlei-ingolstadt", "conceptParagraphs": paragraphs("anwalt-in-ingolstadt"), "sourceClaim": "Vor allem aber sind wir alle Juristen aus Überzeugung."},
    "people": people, "secretariat": secretariat, "services": services,
    "firstAppointment": {"sourceUrl": BASE + "anwalt-ingolstadt", "documents": ["Verträge", "Schriftverkehr mit der gegnerischen Versicherung", "Daten des Unfallgegners", "Gutachten", "Schreiben von Behörden, Polizei, Staatsanwaltschaft oder Gericht", "Kündigungsschreiben", "Daten der Rechtsschutzversicherung, soweit vorhanden"], "deadlineNote": "Sollten bereits Fristen laufen, dürfen wir Sie bitten, uns dies bereits bei der ersten Kontaktaufnahme mitzuteilen.", "sourceParagraphs": cost_paragraphs},
    "costs": {"consumerInitialConsultationMaximumNetEur": 190, "taxNote": "zzgl. der gesetzlichen Mehrwertsteuer", "billingNote": "Erstberatungsgespräche rechnen wir nach tatsächlichem Zeit- und Beratungsaufwand ab.", "rvg": True, "legalInsuranceInquiryAvailable": True, "sourceUrl": BASE + "anwalt-ingolstadt"},
    "downloads": downloads,
    "mandateNote": "Durch die Übersendung eines oder mehrerer der nachstehenden Dokumente wird kein Vertragsverhältnis mit der Rechtsanwaltskanzlei Hagn, Deckert, Stemmer & Partner begründet. Hierzu bedarf es der ausdrücklichen Annahme bzw. Bestätigung durch den Anwalt.",
    "legal": {"sourceImprintUrl": BASE + "impressum", "sourcePrivacyUrl": BASE + "datenschutz", "register": "Partnerschaftsregister des Amtsgerichts Ingolstadt, PR 1", "taxNumber": "124/162/02409", "representativePartners": ["Dr. iur. Niels Deckert", "Markus Stemmer", "Gabriele Radlinger", "Veronika Hagn"], "professionalTitle": "Rechtsanwälte der Bundesrepublik Deutschland", "chamber": {"name": "Rechtsanwaltskammer München", "sourceAddress": "Tal 33, 80331 München", "sourcePhone": "+49 89 532944-0"}, "photoCredit": {"name": "Stefan Bösl Fotografie, Ingolstadt", "url": "http://www.stefanboesl.de/"}, "originalDesignCredit": {"name": "Beckett Werbeagentur, Ingolstadt", "url": "https://www.beckett.design"}, "sourceTextNeedsStackSpecificRevision": True, "notes": ["Bestehende Datenschutzerklärung enthält Angaben zu alten Tracking-/Werbediensten. Nur tatsächlich eingesetzte Dienste auf die neue Seite übernehmen.", "Bestehendes Impressum verweist auf TMG und RStV; Rohquelle als Nachweis archiviert, keine Behauptung einer juristischen Aktualitätsprüfung."]},
    "pages": canonical_pages, "images": image_inventory,
    "migrationNotes": [
        "Öffentlich sichtbare Quellen enthalten sieben Anwälte; die ältere Duplikatseite anwaltskanzlei-in-ingolstadt nennt sechs und lässt Eva Huxmann weg.",
        "Die auf Profilseiten veröffentlichten E-Mail-Adressen sind überwiegend Sekretariatskontakte. Keine nicht veröffentlichten persönlichen Anwalt-E-Mails ableiten.",
        "Fachanwaltstitel nur laut Personenprofil verwenden. Insbesondere Deckert, Huxmann und Wagner tragen in der Quelle keinen Fachanwaltstitel.",
        "Die meisten kleineren Rechtsgebiete werden nur in der Navigation oder den Profilen genannt. Keine zusätzliche Zulassung, Fallzahl oder Erfolgsgarantie ableiten.",
        "Ältere, nur aus auskommentierter Navigation erreichbare Mandanteninformation zum Widerrufsjoker archiviert; nicht ungeprüft als aktuelle Rechtsinformation veröffentlichen.",
        "Die Pfade karriere, baurecht-rechtsanwalt-ingolstadt und anwalt-ingolstadt-partner liefern in der Quelle die Homepage als Soft-404. Kein Stellenangebot und keine gesonderte Baurechtseite erfinden.",
        "Alle Fotos und PDFs wurden unverändert von der Originalquelle geladen. Original-Impressum nennt Stefan Bösl Fotografie für Kanzleifotografie und Porträts und behält alle Urheberrechte vor. Die Migration wurde vom Nutzer beauftragt; kein darüber hinausgehender Bildlizenzvertrag liegt in den Quellen vor.",
        "E.Consult-Links stammen aus auskommentierter älterer Navigation und wurden nicht funktional getestet.",
    ],
}
(ROOT / "docs/content-data.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({"canonicalPages": len(canonical_pages), "lawyers": len(people), "secretariat": len(secretariat), "serviceAreas": len(services), "pdfs": len(downloads), "images": len(image_inventory)}, ensure_ascii=False))
