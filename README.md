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
│   └── api/report/route.ts # PDF-Erzeugung + E-Mail-Versand (Resend)
├── components/
│   └── KIReadinessCheck.tsx  # UI: Intro, Persona, Quiz, E-Mail-Gate, Ergebnis
├── lib/
│   ├── scoring.ts          # Fragen, Dimensionen, Gewichtung, Berechnung (Client + Server)
│   └── pdf/ReportDocument.tsx  # PDF-Vorlage (@react-pdf/renderer)
├── .env.example            # Vorlage für Umgebungsvariablen
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

## E-Mail-Gate, PDF-Report und Lead-Benachrichtigung (seit v1.1)

Ablauf: Intro → Persona → 24 Fragen → **E-Mail-Gate** (Name, Firma, E-Mail, Datenschutz) → Ergebnis.
Beim Absenden des Gates ruft die Komponente `POST /api/report` auf. Die Route

1. validiert Antworten und Kontaktdaten (Honeypot-Feld `website` gegen Bots),
2. berechnet das Ergebnis serverseitig neu (`lib/scoring.ts`, gleiche Logik wie im Frontend),
3. erzeugt das PDF mit `@react-pdf/renderer` (`lib/pdf/ReportDocument.tsx`, ohne Browser-Engine),
4. verschickt über **Resend** zwei Mails: an den Kunden (Ergebnis + PDF) und an `LEAD_NOTIFY_EMAIL` (Lead mit allen 24 Antworten, JSON-Rohdaten + PDF).

Schlägt der Versand fehl, sieht der Kunde sein Ergebnis trotzdem, mit Hinweis und Kontaktadresse.

### Einrichtung

1. Konto bei [resend.com](https://resend.com) anlegen, Domain (z. B. `zweimeter.consulting`) verifizieren (SPF/DKIM-DNS-Einträge), API-Key erzeugen.
2. `.env.example` nach `.env.local` kopieren und Werte eintragen. Dieselben Variablen in Vercel unter *Settings → Environment Variables* setzen.
3. `npm install` (neue Abhängigkeiten: `resend`, `@react-pdf/renderer`).
4. Test lokal: `REPORT_PREVIEW=1 npm run dev`, dann `http://localhost:3000/api/report?preview=1&persona=kmu` öffnen → Demo-PDF ohne Versand (`&value=1` erzwingt „Nicht bereit“).

### Umgebungsvariablen

| Variable | Pflicht | Bedeutung |
|---|---|---|
| `RESEND_API_KEY` | ja | API-Key von Resend |
| `MAIL_FROM` | ja | Absender, Domain muss bei Resend verifiziert sein |
| `LEAD_NOTIFY_EMAIL` | ja | Empfänger der internen Lead-Mail |
| `MAIL_REPLY_TO` | nein | Antwortadresse in der Kunden-Mail |
| `NEXT_PUBLIC_CALENDLY_URL` | nein | Calendly-Link für das Erstgespräch (Ergebnis bei „Nicht bereit“, PDF, Kunden-Mail) |
| `NEXT_PUBLIC_PRIVACY_URL` | nein | Link zur Datenschutzerklärung im Gate |
| `NEXT_PUBLIC_CTA_URL_SOLO` / `NEXT_PUBLIC_CTA_URL_BUSINESS` | nein | Ziel der CTA-Buttons im Ergebnis |
| `NEXT_PUBLIC_CONTACT_EMAIL` | nein | Kontaktadresse im Fehlerhinweis |
| `REPORT_PREVIEW` | nein | `1` = Demo-PDF unter `/api/report?preview=1` (nur Entwicklung) |

## Nächste Schritte

- [x] E-Mail-Gate vor Report (Lead-Erfassung)
- [x] PDF-Export des Ergebnisses (per E-Mail)
- [ ] Lead per Webhook an das CRM übergeben (`LEAD_WEBHOOK_URL`)
- [x] Calendly-Integration (Erstgespräch bei „Nicht bereit“, Solo-CTA, PDF, Mail)
- [ ] Analytics/Tracking (Funnel-Events)
- [ ] Brevo-Anbindung für Follow-up-Sequenzen

---

© 2026 ZweiMeter.Consulting · Strategie mit Weitblick
