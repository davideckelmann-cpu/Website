# Lilac & Bergamot — Website

Statische Website (Astro) für Lilac & Bergamot, Floristik in Berlin.
Gebaut für Hosting auf **Bunny.net** (CDN + Storage Zone).

- **Schnell:** statisch generiert, weltweit über Bunny Edge ausgeliefert
- **SEO-sicher:** saubere URLs, Meta-Tags, Sitemap, strukturierte Daten, 301-Redirect-Map
- **Dezent animiert:** Scroll-Einblendungen + weiche Hover-Effekte (respektiert `prefers-reduced-motion`)

---

## Lokale Entwicklung

```bash
npm install        # Abhängigkeiten installieren
npm run dev        # Dev-Server auf http://localhost:4321
npm run build      # Produktions-Build nach dist/
npm run preview    # Build lokal ansehen
```

Node 18+ empfohlen.

---

## Projektstruktur

```
src/
  layouts/Base.astro       # Grundgerüst: SEO-Meta, Fonts, Scroll-Reveal-Script
  components/Nav.astro      # Navigation (sticky, Hover-Unterstrich, Mobile-Menü)
  components/Footer.astro   # Footer mit Kontaktdaten
  pages/
    index.astro            # Startseite (Hero, Angebot, Editorial, Kontakt)
    angebot/index.astro    # Cluster: Angebot
    events/index.astro     # Cluster: Events
    ueber-uns.astro
    abo.astro
    kontakt.astro
  styles/global.css        # Design-Tokens (Flieder/Bergamotte) + Base
public/
  images/                  # Fotos
  robots.txt
bunny-redirects.json       # 301-Weiterleitungen für den Wix->Bunny Umzug
astro.config.mjs           # site-URL, trailingSlash, Sitemap
```

Neue Unterseite = neue `.astro`-Datei unter `src/pages/`. Der Dateipfad wird
zur URL (z.B. `src/pages/events/hochzeiten.astro` → `/events/hochzeiten/`).

---

## Design-System

Alle Farben, Schriften und Abstände sind Tokens in `src/styles/global.css`
(`:root`). Palette: Flieder (`--lilac-*`) + Bergamotte (`--bergamot-*`) +
Neutrals. Schriften: Cormorant Garamond (Display) + Jost (Text).

---

## Deployment auf Bunny.net

1. **Build erzeugen:** `npm run build` → alles Nötige liegt in `dist/`.
2. **Storage Zone anlegen** in Bunny (z.B. `lilac-bergamot`).
3. **`dist/`-Inhalt hochladen** in die Storage Zone (per Bunny-Dashboard,
   FTP, oder `bunnycdn`-CLI / API).
4. **Pull/CDN-Zone** mit der Storage Zone als Origin verbinden.
5. **Eigene Domain** (`www.lilac-bergamot.com`) auf die Pull Zone zeigen lassen
   (CNAME) und SSL aktivieren.

### Wichtig für SEO beim Umzug von Wix

- **301-Weiterleitungen** aus `bunny-redirects.json` in Bunny als *Edge Rules*
  (Redirect) anlegen. Vor Launch mit den **echten alten Wix-URLs** füllen —
  siehe SEO-Relaunch-Plan.
- **Domain behalten**, nur die Plattform wechseln.
- Nach Launch: `sitemap-index.xml` in der Google Search Console einreichen,
  auf 404-Fehler prüfen und fehlende Redirects nachziehen.

### Optionaler Auto-Deploy

Ein GitHub Actions Workflow kann bei jedem Push nach `dist/` bauen und via
Bunny Storage API hochladen. Kann bei Bedarf ergänzt werden.

---

## Formular-Hinweis

Das Kontaktformular auf der Startseite ist aktuell nur Markup. Für echten
Versand einen statischen Form-Dienst anbinden (z.B. Formspree, Basin, Web3Forms)
oder eine Bunny Edge Function — je nach Wunsch.


## Kontaktformular aktivieren (1 Minute)

Das Formular nutzt **Web3Forms** (kostenlos, kein Account, DSGVO-freundlich).
Damit es echte Nachrichten sendet:

1. Auf https://web3forms.com die eigene E-Mail eintragen → Access-Key kommt per Mail.
2. In `src/components/ContactForm.astro` die Zeile
   `const ACCESS_KEY = "DEIN-WEB3FORMS-KEY";` durch den echten Key ersetzen.
3. `npm run build` — fertig. Anfragen landen dann in eurem Postfach.

Solange der Platzhalter drinsteht, zeigt das Formular einen Hinweis und sendet nicht.
Empfehlung: bei Web3Forms in den Einstellungen die EU-Region wählen (Datenschutz).
