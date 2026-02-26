# KI-Readiness-Check · ZweiMeter.Consulting

Interaktives Web-Assessment-Tool zur Bestimmung der KI-Bereitschaft von Unternehmen.

## Features

- **3 Persona-Varianten:** Einzelunternehmer, KMU, Bereich/Abteilung
- **24 Fragen** in 6 gewichteten Dimensionen (72 Fragevarianten gesamt)
- **4er-Skala** ohne Mitte (erzwungene Richtungsentscheidung)
- **Killer-Dimensionen-Logik:** Strategie und Prozesse als K.O.-Kriterien
- **Radar-Chart** (SVG) mit 6 Achsen
- **Persona-abhängige Reports** mit differenzierten Handlungsempfehlungen
- **Funnel-Steuerung:** Solo → zweimeter.online, KMU/Bereich → ZweiMeter.Consulting

## Tech Stack

- Next.js 15 mit App Router
- React 19
- TypeScript
- Vercel Deployment

## Deployment auf Vercel

### Option A: Über GitHub (empfohlen)

1. Repository auf GitHub erstellen (z.B. `ki-readiness-check`)
2. Diesen Ordner als Repository pushen:
   ```bash
   git init
   git add .
   git commit -m "Initial: KI-Readiness-Check v1.0"
   git remote add origin https://github.com/DEIN-USER/ki-readiness-check.git
   git push -u origin main
   ```
3. Auf [vercel.com](https://vercel.com) einloggen
4. "Add New Project" → GitHub-Repository auswählen
5. Framework: Next.js (wird automatisch erkannt)
6. Deploy klicken

### Option B: Über Vercel CLI

```bash
npm install -g vercel
cd ki-readiness-check
npm install
vercel
```

### Domain konfigurieren

Nach dem Deployment in den Vercel-Projekteinstellungen:
- Settings → Domains → `ki-check.zweimeter.consulting` hinzufügen
- DNS-Eintrag beim Domain-Provider setzen (CNAME auf `cname.vercel-dns.com`)

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000)

## Projektstruktur

```
ki-readiness-check/
├── app/
│   ├── layout.tsx          # Root-Layout mit DM Sans Font & Metadaten
│   └── page.tsx            # Hauptseite (rendert KIReadinessCheck)
├── components/
│   └── KIReadinessCheck.tsx  # Komplette App-Logik (854 Zeilen)
├── public/                 # Statische Assets (leer, für Logo etc.)
├── package.json
├── tsconfig.json
├── next.config.mjs
└── README.md
```

## Auswertungslogik

```
Dimensionsscore = (F1 + F2 + F3 + F4) / 4
Gesamtscore     = (D1×1.5 + D2×1.3 + D3×1.0 + D4×1.0 + D5×1.0 + D6×0.8) / 5.6
```

### Gewichtungen

| Dimension   | Gewicht | Killer |
|-------------|---------|--------|
| Strategie   | 1.5     | Ja (Override bei < 2.0) |
| Prozesse    | 1.3     | Ja (Downgrade bei < 2.0) |
| Daten       | 1.0     | Nein |
| Technik     | 1.0     | Nein |
| Menschen    | 1.0     | Nein |
| Regulatorik | 0.8     | Nein |

## Nächste Schritte (nach Launch)

- [ ] E-Mail-Gate vor Report (Lead-Erfassung)
- [ ] PDF-Export des Ergebnisses
- [ ] Calendly-Integration im CTA
- [ ] Analytics/Tracking (Funnel-Events)
- [ ] Brevo-Anbindung für Follow-up-Sequenzen

---

© 2026 ZweiMeter.Consulting · Strategie mit Weitblick
