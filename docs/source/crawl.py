"""Archive user-requested source website and download its owned public assets.

Read-only crawl of hagn-partner.de; output only under docs/source, public/images,
public/downloads. Run from repository root with Python 3.
"""
from __future__ import annotations

import concurrent.futures
import hashlib
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "docs/source"
IMAGE_DIR = ROOT / "public/images"
DOWNLOAD_DIR = ROOT / "public/downloads"
BASE = "https://www.hagn-partner.de/"
HOSTS = {"hagn-partner.de", "www.hagn-partner.de"}
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; HagnWebsiteContentMigration/1.0)"}
for folder in [ARCHIVE, IMAGE_DIR, DOWNLOAD_DIR]:
    folder.mkdir(parents=True, exist_ok=True)


def get(url: str):
    request = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=35) as response:
        return response.read(), response.headers.get_content_type(), response.url


def norm(url: str, relative: str = BASE):
    joined = urllib.parse.urljoin(relative, url)
    parts = urllib.parse.urlsplit(joined)
    if parts.netloc in HOSTS:
        path = re.sub(r"/+", "/", parts.path) or "/"
        return urllib.parse.urlunsplit(("https", "www.hagn-partner.de", path.rstrip("/") or "/", parts.query, ""))
    return urllib.parse.urldefrag(joined)[0]


def slug_for(url: str):
    path = urllib.parse.urlsplit(url).path.strip("/") or "home"
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", path)


pages = {}
pending = [BASE]
assets = {}
styles = set()
external_links = set()
errors = []
while pending:
    url = pending.pop(0)
    if url in pages:
        continue
    try:
        raw, content_type, final_url = get(url)
        if content_type != "text/html":
            assets[url] = {"url": url, "type": content_type}
            continue
        html = raw.decode("utf-8", errors="replace")
        soup = BeautifulSoup(html, "html.parser")
        slug = slug_for(url)
        (ARCHIVE / f"{slug}.html").write_text(html, encoding="utf-8")
        for tag in soup.select("script, style, noscript"):
            tag.decompose()
        all_text = "\n".join(line.strip() for line in soup.get_text("\n").splitlines() if line.strip())
        (ARCHIVE / f"{slug}.txt").write_text(all_text + "\n", encoding="utf-8")
        main = soup.select_one("#content, main, .content, #main")
        headings = [{"level": h.name, "text": h.get_text(" ", strip=True)} for h in soup.select("h1, h2, h3, h4")]
        image_urls = set()
        for image in soup.select("img"):
            for attr in ["src", "data-src", "data-lazy-src"]:
                if image.get(attr):
                    image_url = norm(image[attr], url)
                    image_urls.add(image_url)
                    assets.setdefault(image_url, {"url": image_url, "type": "image", "pages": []})
                    assets[image_url].setdefault("pages", []).append(url)
            for candidate in image.get("srcset", "").split(","):
                if candidate.strip():
                    image_url = norm(candidate.strip().split()[0], url)
                    assets.setdefault(image_url, {"url": image_url, "type": "image", "pages": []})
                    assets[image_url].setdefault("pages", []).append(url)
        for element in soup.select("[style]"):
            for candidate in re.findall(r"url\(['\"]?([^)'\"]+)", element["style"]):
                image_url = norm(candidate, url)
                assets.setdefault(image_url, {"url": image_url, "type": "image", "pages": []})
                assets[image_url].setdefault("pages", []).append(url)
        links = []
        for link in soup.select("a[href], link[href]"):
            target = norm(link["href"], url)
            parts = urllib.parse.urlsplit(target)
            text = link.get_text(" ", strip=True)
            links.append({"text": text, "url": target})
            if parts.netloc not in HOSTS:
                if target.startswith(("https://", "http://", "mailto:", "tel:")):
                    external_links.add(target)
                continue
            ext = Path(parts.path).suffix.lower()
            if ext in {".css"}:
                styles.add(target)
            elif ext in {".pdf", ".doc", ".docx", ".zip", ".jpg", ".png", ".webp", ".jpeg", ".svg"}:
                assets.setdefault(target, {"url": target, "type": "download" if ext in {".pdf", ".doc", ".docx", ".zip"} else "image", "label": text, "pages": []})
                assets[target].setdefault("pages", []).append(url)
            elif ext in {"", ".html", ".htm", ".php"} and target not in pages and target not in pending:
                pending.append(target)
        description = soup.select_one('meta[name="description"]')
        pages[url] = {"url": url, "finalUrl": final_url, "slug": slug, "title": soup.title.get_text(strip=True) if soup.title else "", "description": description.get("content", "") if description else "", "headings": headings, "images": sorted(image_urls), "links": links, "text": all_text}
        print(f"PAGE {len(pages):02d}: {url}", flush=True)
    except Exception as error:
        errors.append({"url": url, "error": str(error)})

for url in sorted(styles):
    try:
        raw, content_type, final_url = get(url)
        css = raw.decode("utf-8", errors="replace")
        (ARCHIVE / slug_for(url)).write_text(css, encoding="utf-8")
        for candidate in re.findall(r"url\(['\"]?([^)'\"]+)", css):
            asset_url = norm(candidate, url)
            if not asset_url.startswith("data:"):
                assets.setdefault(asset_url, {"url": asset_url, "type": "css-asset", "pages": []})
    except Exception as error:
        errors.append({"url": url, "error": str(error)})


def download(item):
    url, meta = item
    try:
        raw, content_type, final_url = get(url)
        ext = Path(urllib.parse.urlsplit(url).path).suffix.lower()
        if meta["type"] == "download" or ext in {".pdf", ".doc", ".docx", ".zip"}:
            directory = DOWNLOAD_DIR
            filename = Path(urllib.parse.urlsplit(url).path).name
        elif content_type.startswith("image/"):
            directory = IMAGE_DIR
            path = urllib.parse.urlsplit(url).path
            filename = path.strip("/").removeprefix("images/").replace("/", "-")
        else:
            return None
        local = directory / filename
        local.write_bytes(raw)
        result = {**meta, "contentType": content_type, "sourceUrl": url, "localPath": "/" + local.relative_to(ROOT / "public").as_posix(), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
        result["pages"] = sorted(set(result.get("pages", [])))
        if content_type.startswith("image/"):
            try:
                image = Image.open(io.BytesIO(raw))
                result.update({"width": image.width, "height": image.height, "format": image.format})
            except Exception:
                pass
        return result
    except Exception as error:
        return {**meta, "error": str(error)}


with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
    downloaded = [item for item in executor.map(download, assets.items()) if item]

raw_inventory = {"source": BASE, "retrievedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "pages": list(pages.values()), "assets": downloaded, "externalLinks": sorted(external_links), "errors": errors}
(ARCHIVE / "raw-inventory.json").write_text(json.dumps(raw_inventory, ensure_ascii=False, indent=2), encoding="utf-8")

# Contact sheet is an inspection-only artifact: source images stay unchanged.
images = [item for item in downloaded if item.get("width", 0) >= 200 and item.get("height", 0) >= 150]
tile_width, tile_height, columns = 260, 220, 4
sheet = Image.new("RGB", (tile_width * columns, tile_height * ((len(images) + columns - 1) // columns)), "#eeeeee")
draw = ImageDraw.Draw(sheet)
for index, meta in enumerate(images):
    photo = Image.open(ROOT / "public" / meta["localPath"].lstrip("/")).convert("RGB")
    photo.thumbnail((tile_width - 12, tile_height - 44))
    x, y = (index % columns) * tile_width, (index // columns) * tile_height
    sheet.paste(photo, (x + (tile_width - photo.width) // 2, y + 4))
    label = f"{index}: {Path(meta['localPath']).name}\n{meta['width']} x {meta['height']}"
    draw.text((x + 6, y + tile_height - 38), label, fill="#111111")
sheet.save(ARCHIVE / "image-contact-sheet.jpg", quality=85)
print(json.dumps({"pages": len(pages), "assets": len(downloaded), "errors": errors}, ensure_ascii=False), flush=True)
