// Automatische Bild-Erkennung
// -----------------------------------------------------------
// Schaut beim Bauen der Seite selbst im Ordner public/images nach,
// welche Bilder für eine Seite vorhanden sind – ohne Code-Änderung.
//
// Regeln (Beispiel Seite "galerien"):
//   1) Liegen galerien-1 / galerien-2 / galerien-3 dort?
//      -> Triptychon (mehrere Bilder nebeneinander)
//   2) Sonst: liegt galerien dort?
//      -> Einzelbild
//   3) Sonst: kein Bild (Seite bleibt heil, zeigt einfach keins)
//
// Endungen .jpg, .jpeg, .png und .webp werden alle erkannt.

import fs from 'node:fs';
import path from 'node:path';

const IMAGE_DIR = path.join(process.cwd(), 'public', 'images');
const EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG'];
const MAX_NUMBERED = 8; // bis zu 8 nummerierte Bilder pro Seite

// Dateiliste einmal einlesen (schnell, passiert nur beim Bauen)
let files = [];
try {
  files = fs.readdirSync(IMAGE_DIR);
} catch {
  files = [];
}

// ------------------------------------------------------------
// Bildmaße lesen (nur Header, ohne ganze Datei zu dekodieren).
// Damit weiß die Seite beim Bauen, ob ein Foto quer oder hochkant ist,
// und kann automatisch das passende Layout wählen.
// Unterstützt JPG, PNG und WEBP.
// ------------------------------------------------------------
const dimCache = new Map();

function readDimensions(absPath) {
  if (dimCache.has(absPath)) return dimCache.get(absPath);
  let result = null;
  try {
    const fd = fs.openSync(absPath, 'r');
    const buf = Buffer.alloc(65536);
    const bytes = fs.readSync(fd, buf, 0, 65536, 0);
    fs.closeSync(fd);
    result = parseDimensions(buf, bytes);
  } catch {
    result = null;
  }
  dimCache.set(absPath, result);
  return result;
}

function parseDimensions(buf, len) {
  // PNG
  if (len > 24 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // WEBP (VP8/VP8L/VP8X)
  if (len > 30 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const fmt = buf.toString('ascii', 12, 16);
    try {
      if (fmt === 'VP8 ') {
        return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
      } else if (fmt === 'VP8L') {
        const b0 = buf[21], b1 = buf[22], b2 = buf[23], b3 = buf[24];
        const w = 1 + (((b1 & 0x3f) << 8) | b0);
        const h = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
        return { width: w, height: h };
      } else if (fmt === 'VP8X') {
        const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
        const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
        return { width: w, height: h };
      }
    } catch { return null; }
  }
  // JPEG: SOF-Marker suchen
  if (len > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < len - 8) {
      if (buf[offset] !== 0xff) { offset++; continue; }
      const marker = buf[offset + 1];
      // SOF0..SOF15 (außer DHT/JPG/DAC), enthalten Höhe/Breite
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
      }
      const segLen = buf.readUInt16BE(offset + 2);
      offset += 2 + segLen;
    }
  }
  return null;
}

/** Ergänzt einen Bildpfad um Orientierung: 'quer' | 'hochkant' | 'quadratisch'. */
function orientationFor(imgPath) {
  if (!imgPath) return null;
  const abs = path.join(process.cwd(), 'public', imgPath.replace(/^\/+/, ''));
  const dim = readDimensions(abs);
  if (!dim || !dim.width || !dim.height) return 'unbekannt';
  const ratio = dim.width / dim.height;
  if (ratio > 1.15) return 'quer';
  return 'hochkant';   // alles andere (inkl. quadratisch) asymmetrisch behandeln
}

/** Aus einem Bildpfad ein Objekt mit Pfad + Orientierung machen. */
function withMeta(imgPath) {
  if (!imgPath) return null;
  return { src: imgPath, orientation: orientationFor(imgPath) };
}

/** Findet die Datei für einen Namen.
 *  Hinweis: Ein Vergleich nach Änderungsdatum funktioniert hier NICHT –
 *  beim Bauen über GitHub bekommen alle Dateien denselben Zeitstempel.
 *  Deshalb feste Reihenfolge: .jpg, .jpeg, .png, .webp. */
function findFile(baseName) {
  for (const ext of EXTENSIONS) {
    const candidate = `${baseName}.${ext}`;
    if (files.includes(candidate)) return `/images/${candidate}`;
  }
  return null;
}

/**
 * Liefert die Bilder für eine Seite – jetzt inklusive Orientierung,
 * damit die Seite automatisch quer (Banner) von hochkant (asymmetrisch)
 * unterscheiden kann.
 * @param {string} base - z.B. "galerien" oder "hochzeiten"
 * @returns {{ mode, images, image, meta, metaList }}
 *   meta      = { src, orientation } fürs Einzelbild (oder null)
 *   metaList  = Array von { src, orientation } fürs Set
 */
export function getPageImages(base) {
  // 1) Nummerierte Bilder suchen (galerien-1, galerien-2, ...)
  const numbered = [];
  for (let i = 1; i <= MAX_NUMBERED; i++) {
    const found = findFile(`${base}-${i}`);
    if (found) numbered.push(found);
    else if (i > 1) break; // Lücke -> aufhören
  }
  if (numbered.length > 1) {
    return { mode: 'set', images: numbered, image: null,
             metaList: numbered.map(withMeta), meta: null };
  }
  if (numbered.length === 1) {
    return { mode: 'single', images: [], image: numbered[0],
             metaList: [], meta: withMeta(numbered[0]) };
  }

  // 2) Einzelbild ohne Nummer suchen
  const single = findFile(base);
  if (single) return { mode: 'single', images: [], image: single,
                       metaList: [], meta: withMeta(single) };

  // 3) Nichts gefunden
  return { mode: 'none', images: [], image: null, metaList: [], meta: null };
}

/** Leitet den Bild-Namen aus dem Seitenpfad ab: "/angebot/galerien/" -> "galerien" */
export function baseFromPath(pagePath = '') {
  return pagePath.replace(/\/+$/, '').split('/').filter(Boolean).pop() || '';
}

/**
 * Sammelt ALLE durchnummerierten Bilder zu einem Namen.
 * Beispiel: getNumberedImages('banner') findet banner-1, banner-2, ... banner-24.
 * Lücken werden übersprungen (fehlt banner-3, geht es bei banner-4 weiter).
 * @param {string} base - z.B. "banner"
 * @param {number} max  - wie weit gesucht wird (Standard 24)
 */
export function getNumberedImages(base, max = 24) {
  const found = [];
  for (let i = 1; i <= max; i++) {
    const file = findFile(`${base}-${i}`);
    if (file) found.push(file);
  }
  return found;
}

/** Sucht gezielt NUR die Datei ohne Nummer, z.B. "ueber-uns.jpg".
 *  Unabhängig davon, ob es zusätzlich nummerierte Bilder gibt. */
export function getSingleImage(base) {
  return findFile(base);
}
