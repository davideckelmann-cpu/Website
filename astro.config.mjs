import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Basis-URL der Seite – wird für kanonische Links, Open Graph und die
  // Sitemap gebraucht. OHNE diese Angabe bricht der Build mit "Invalid URL" ab.
  site: 'https://www.lilac-bergamot.com',

  // Statische Ausgabe (wird als Dateien nach dist/ gebaut und zu Bunny geladen)
  output: 'static',

  // Die Seiten-URLs enden auf "/" (z. B. /abo/, /angebot/salons/).
  // 'always' hält das konsistent und vermeidet doppelte URLs / Redirect-Probleme.
  trailingSlash: 'always',

  build: {
    // erzeugt /abo/index.html statt /abo.html – passt zu trailingSlash 'always'
    format: 'directory',
  },
});
