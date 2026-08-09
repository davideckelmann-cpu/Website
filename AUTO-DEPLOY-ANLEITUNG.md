# Lilac & Bergamot — Auto-Deploy einrichten (ohne Node auf dem Mac)

Dein Mac (macOS 10.13) kann modernes Node nicht ausführen — kein Problem.
Mit diesem Weg baut **GitHub in der Cloud** die Seite und lädt sie automatisch
zu Bunny hoch. Du brauchst auf deinem Rechner **kein Node, kein Terminal**.

Ergebnis: Jede Änderung, die du zu GitHub hochlädst, geht automatisch live.

---

## Überblick (was passiert)

1. Projekt zu einem GitHub-Repository hochladen.
2. In Bunny die Website-Hosting-Zonen anlegen (Storage + Pull Zone).
3. In GitHub 4 Zugangsdaten („Secrets") von Bunny hinterlegen.
4. Fertig — ab jetzt baut & veröffentlicht GitHub bei jedem Upload automatisch.

Die Automatik-Datei liegt schon im Projekt: `.github/workflows/deploy.yml`.
Du musst sie nicht anfassen — nur die Zugangsdaten hinterlegen.

---

## Teil A — Projekt zu GitHub hochladen

Du hast schon einen GitHub-Account. Am einfachsten ohne Terminal:

### A1. Neues Repository anlegen
1. Auf github.com einloggen → oben rechts **+** → **New repository**.
2. Name z. B. `lilac-bergamot-website`. Sichtbarkeit: **Private** (empfohlen).
3. **Create repository** klicken. (Nichts weiter ankreuzen.)

### A2. Dateien hochladen (per Browser, Drag & Drop)
1. Im leeren Repo auf **„uploading an existing file"** klicken
   (Link mitten auf der Seite).
2. Das Projekt aus der ZIP **vorher entpacken**. Dann den **Inhalt** des
   Projektordners (nicht den Ordner selbst) ins Browserfenster ziehen.
   - Wichtig: die versteckten Ordner `.github` müssen mit hochgeladen werden.
     Falls dein Finder versteckte Dateien nicht zeigt: mit `Cmd + Shift + .`
     (Punkt) einblenden.
   - `node_modules` und `dist` musst du NICHT hochladen (die entstehen beim Build).
3. Unten **Commit changes** klicken. Die Dateien liegen jetzt in GitHub.

> Alternative, falls Drag & Drop hakt: GitHub Desktop-App — läuft aber ggf. nicht
> auf macOS 10.13. Der Browser-Weg oben funktioniert immer.

---

## Teil B — Bunny einrichten

### B1. Storage Zone (Dateispeicher)
1. Auf bunny.net einloggen → **Storage → Add Storage Zone**.
2. Name: z. B. `lilac-bergamot`. Region: **Europe / Falkenstein (DE)**.
3. **Add Storage Zone**.

### B2. Pull Zone (liefert die Seite aus)
1. **CDN → Add Pull Zone**.
2. Name: z. B. `lilac-bergamot`.
3. **Origin Type: Storage Zone** → die eben erstellte Zone wählen.
4. **Add Pull Zone**.

### B3. Die 4 Zugangsdaten sammeln
Notiere dir diese vier Werte — die kommen gleich in GitHub:

1. **BUNNY_STORAGE_NAME** = der Name deiner Storage Zone (z. B. `lilac-bergamot`).
2. **BUNNY_STORAGE_PASSWORD** = Storage Zone → **FTP & API Access** →
   das **Password** (das mit Schreibrechten, NICHT das Read-Only).
3. **BUNNY_API_KEY** = dein Account-API-Key:
   dash.bunny.net → **Account Settings** → **API** → API-Key kopieren.
4. **BUNNY_PULL_ZONE_ID** = die Zahl in der URL deiner Pull Zone.
   Beispiel-URL: `https://dash.bunny.net/cdn/1511557` → **1511557** ist die ID.

---

## Teil C — Zugangsdaten in GitHub hinterlegen (Secrets)

Damit GitHub zu Bunny hochladen darf, hinterlegst du die 4 Werte sicher.
Sie sind danach verschlüsselt und für niemanden sichtbar.

1. Im GitHub-Repo: **Settings** (Reiter oben) →
   links **Secrets and variables** → **Actions**.
2. **New repository secret** klicken. Nun 4-mal je einen anlegen:

   | Name (exakt so)          | Wert                                   |
   |--------------------------|----------------------------------------|
   | `BUNNY_STORAGE_NAME`     | Name der Storage Zone                  |
   | `BUNNY_STORAGE_PASSWORD` | Storage-Passwort (Schreibrechte)       |
   | `BUNNY_API_KEY`          | Account-API-Key                        |
   | `BUNNY_PULL_ZONE_ID`     | Pull-Zone-ID (die Zahl)                |

   Jeweils Name + Wert eintragen → **Add secret**.
   Die Namen müssen **exakt** so geschrieben sein (Groß-/Kleinschreibung zählt).

---

## Teil D — Loslegen

- Sobald die Secrets stehen, den Deploy **einmal manuell starten**:
  Repo → **Actions** → links „Build & Deploy to Bunny" → **Run workflow**.
- GitHub baut jetzt die Seite (~1–2 Min.) und lädt sie zu Bunny.
- Grüner Haken = erfolgreich. Rotes X = Fehler (draufklicken zeigt die Meldung —
  meistens ein falsch geschriebenes Secret).

Ab jetzt gilt: **Jede Änderung, die du zu GitHub hochlädst, geht automatisch
live.** Du musst nie wieder etwas bauen.

---

## Teil E — Domain verbinden (wenn die Seite läuft)

Erst wenn du die Seite über die Bunny-Test-URL gesehen hast:
- Pull Zone → **Hostnames** → `www.lilac-bergamot.com` hinzufügen → CNAME kopieren.
- Bei **Strato**: alte Wix-Umleitung entfernen, CNAME `www` → Bunny-Wert setzen,
  Root-Domain → www weiterleiten.
- In Bunny **Free SSL + Force SSL** aktivieren.
- 301-Redirects aus `bunny-redirects.json` als Edge Rules anlegen.

Details dazu stehen in `lilac-bergamot-deployment-dns.md`.

---

## Wenn etwas klemmt

- **Roter Fehler „secret not found"** → Secret-Name falsch geschrieben. Genau
  die Namen aus der Tabelle oben verwenden.
- **Upload-Fehler / 401** → falsches Storage-Passwort (nicht das Read-Only nehmen).
- **Seite lädt, aber ohne Bilder/Style** → Cache leeren (Pull Zone → Purge) und
  kurz warten.
- **Formular sendet nicht** → Web3Forms-Key sitzt schon im Projekt; beim ersten
  echten Absenden kommt eine Bestätigungsmail an hello@lilac-bergamot.com
  (auch Spam prüfen).

Du kannst mir jederzeit sagen, an welchem Schritt du bist — ich helfe weiter.
