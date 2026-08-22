// Zentrale Sprachlogik für Lilac & Bergamot
// Deutsch ist die Standardsprache (ohne Präfix), Englisch liegt unter /en/.

export const languages = {
  de: 'Deutsch',
  en: 'English',
};

export const defaultLang = 'de';

// Ermittelt die Sprache aus der URL: /en/... -> 'en', sonst 'de'
export function getLangFromUrl(url) {
  const [, maybeLang] = url.pathname.split('/');
  if (maybeLang in languages) return maybeLang;
  return defaultLang;
}

// Baut einen Pfad in der Zielsprache.
// z.B. localizePath('/angebot/', 'en') -> '/en/angebot/'
//      localizePath('/angebot/', 'de') -> '/angebot/'
export function localizePath(path, lang) {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return `/${lang}${clean}`;
}

// Gibt zur aktuellen Seite den Pfad in der jeweils ANDEREN Sprache zurück
// (für den Sprachumschalter).
export function alternatePath(url, targetLang) {
  let path = url.pathname;
  // vorhandenes Sprachpräfix entfernen
  for (const code of Object.keys(languages)) {
    if (code === defaultLang) continue;
    if (path === `/${code}` || path.startsWith(`/${code}/`)) {
      path = path.slice(code.length + 1) || '/';
      break;
    }
  }
  return localizePath(path, targetLang);
}
