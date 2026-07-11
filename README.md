# KI-Readiness-Check · ZweiMeter.Consulting

Interaktives Web-Assessment-Tool zur Bestimmung der KI-Bereitschaft von Unternehmen.

## Features

- **3 Persona-Varianten:** Einzelunternehmer, KMU, Bereich/Abteilung
- **24 Fragen** in 6 gewichteten Dimensionen (72 Fragevarianten gesamt)
- **4er-Skala** ohne Mitte (erzwungene Richtungsentscheidung)
- **Killer-Dimensionen-Logik:** Strategie und Prozesse als K.O.-Kriterien
- **Radar-Chart** (SVG) mit 6 Achsen
- **Persona-abhängige Reports** mit differenzierten Handlungsempfehlungen
- **E-Mail-Gate:** Pflicht-Lead-Erfassung vor dem Ergebnis (max. Lead-Quote)
- **Brevo-Anbindung:** Leads landen inkl. Scores in einer Liste → Follow-up-Automation
- **PDF-Export:** branded A4-Report per „Als PDF speichern" (Browser-Druck)
- **Calendly-CTA:** persona-abhängige Terminbuchung, mit vorausgefüllten Daten
- **Funnel-Tracking:** Plausible/GA4-Events über den gesamten Funnel
- **Funnel-Steuerung:** Solo → zweimeter.online, KMU/Bereich → ZweiMeter.Consulting

## Lead-Flow & Monetarisierung

Der Check ist als **Leuchtturmprodukt** aufgebaut: kostenlos, hoher Wahrnehmungswert,
und er füllt die Pipeline für die Beratung.

```
Intro → Persona → 24 Fragen → E-Mail-Gate (Lead → Brevo) → Report → CTA (Calendly)
```

- **Leads** werden serverseitig über `/api/lead` in **Brevo** angelegt (inkl. aller
  Dimensions-Scores als Kontakt-Attribute). Die Ziel-Liste triggert deine Follow-up-Sequenz.
- **Umsatz** entsteht über gebuchte **Calendly**-Termine (Erstgespräch → bezahlter Check).
- **Später ins CRM:** Sobald `CRM_WEBHOOK_URL` gesetzt ist, wird jeder Lead zusätzlich
  als JSON an das CRM (`D:\dev\crm-clean`) geschickt – am `Contact`-Modell ausgerichtet.

### Konfiguration

Alle Zugänge laufen über Umgebungsvariablen. Kopiere `.env.example` → `.env.local`
und trage deine Werte ein (Details siehe Kommentare in der Datei):

| Variable | Zweck |
|----------|-------|
| `BREVO_API_KEY` | Brevo v3 API-Key (Lead-Upsert) |
| `BREVO_LIST_ID` | Ziel-Liste für Leads (triggert Follow-up) |
| `BREVO_DOI_TEMPLATE_ID` / `BREVO_DOI_REDIRECT_URL` | optional: Double-Opt-In |
| `NEXT_PUBLIC_CALENDLY_URL_SOLO` / `_BUSINESS` | Terminlinks je Persona |
| `NEXT_PUBLIC_PRIVACY_URL` | Datenschutz-Link im Gate |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_GA_ID` | optionales Tracking |
| `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` | optional: CRM-Weiterleitung (später) |

**Ohne Keys** läuft die App vollständig (Gate akzeptiert die Eingabe, Report erscheint) –
der Lead wird nur nicht verschickt (Server-Log: `skipped_no_key`). Ideal für lokale Tests.

**Brevo-Attribute** vorab anlegen (Kontakte → Einstellungen → Attribute): `VORNAME`,
`NACHNAME`, `FIRMA` (Text), `KI_PERSONA`, `KI_LEVEL_TITEL`, `KI_KILLER`, `KI_QUELLE` (Text),
sowie `KI_SCORE`, `KI_PROZENT`, `KI_LEVEL`, `KI_STRATEGIE`, `KI_PROZESSE`, `KI_DATEN`,
`KI_TECHNIK`, `KI_MENSCHEN`, `KI_REGULATORIK` (Zahl).

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

- [x] E-Mail-Gate vor Report (Lead-Erfassung)
- [x] PDF-Export des Ergebnisses
- [x] Calendly-Integration im CTA
- [x] Analytics/Tracking (Funnel-Events)
- [x] Brevo-Anbindung für Follow-up-Sequenzen
- [ ] CRM-Weiterleitung aktivieren (`CRM_WEBHOOK_URL` setzen, sobald CRM live)
- [ ] Brevo-Follow-up-Automation gestalten (Willkommensmail + Nurture-Strecke)
- [ ] A/B-Test Gate-Wording / Conversion-Optimierung

---

© 2026 ZweiMeter.Consulting · Strategie mit Weitblick
