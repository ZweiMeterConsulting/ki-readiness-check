// Serverseitiges, druckoptimiertes HTML für das KI-Readiness-PDF.
// Wird von /api/report (Download) und /api/lead (E-Mail-Versand) genutzt und
// via puppeteer-core (setContent) zu PDF gerendert. Bewusst self-contained:
// kein externer Fetch, alle Styles inline → funktioniert offline im Container.

import type { LeadPayload } from "@/lib/lead";

const BRAND = {
  navy: "#1A3A5C",
  blue: "#2E6DA4",
  text: "#2C3E50",
  muted: "#5A6B7B",
  line: "#E1E7ED",
  bg: "#F0F2F5",
  orange: "#E8720C",
};

const PERSONA_LABEL: Record<string, string> = {
  solo: "Einzelunternehmer / Freiberufler",
  kmu: "Unternehmen (bis 250 Mitarbeitende)",
  bereich: "Bereich / Abteilung",
};

const DIM_FULL: Record<string, string> = {
  strategie: "Strategische Klarheit und Zielreife",
  prozesse: "Prozessreife",
  daten: "Datenreife",
  technik: "Technische Infrastruktur",
  menschen: "Menschen und Kompetenzen",
  regulatorik: "Regulatorik und Governance",
};

// Ampel wie im Frontend (getAmpel): <2.0 rot, <3.0 gelb, sonst grün.
function ampel(score: number) {
  if (score < 2.0) return { color: "#E74C3C", label: "Erheblicher Handlungsbedarf" };
  if (score < 3.0) return { color: "#F39C12", label: "Gezielte Maßnahmen empfohlen" };
  return { color: "#27AE60", label: "Gute Voraussetzungen" };
}

// Gesamtfarbe nach Reifegrad-Level (1..4).
function levelColor(level: number) {
  if (level <= 1) return "#E74C3C";
  if (level === 2) return "#F39C12";
  if (level === 3) return BRAND.blue;
  return "#27AE60";
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface ReportMeta {
  generatedAt?: string; // ISO oder bereits formatiert; wenn leer → ohne Datum
}

export function renderReportHtml(payload: LeadPayload, meta: ReportMeta = {}): string {
  const r = payload.result;
  const dims = Array.isArray(r?.dimensions) ? r.dimensions : [];
  const lvlColor = levelColor(r?.level ?? 1);
  const personaLabel = PERSONA_LABEL[payload.persona] || "";
  const name = (payload.name || "").trim();
  const company = (payload.company || "").trim();

  const dateStr = meta.generatedAt
    ? new Date(meta.generatedAt).toLocaleDateString("de-DE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const dimRows = dims
    .map((d) => {
      const a = ampel(d.score);
      const pct = Math.max(0, Math.min(100, (d.score / 4) * 100));
      const full = DIM_FULL[d.id] || d.label;
      return `
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:42%">
          <div style="font-size:12.5px;font-weight:600;color:${BRAND.text}">${esc(full)}</div>
          <div style="font-size:10.5px;color:${BRAND.muted};margin-top:2px">Gewichtung ${esc(
        d.weight
      )}</div>
        </td>
        <td style="padding:10px 0;vertical-align:middle;width:40%">
          <div style="background:${BRAND.line};border-radius:6px;height:10px;overflow:hidden">
            <div style="height:10px;width:${pct.toFixed(0)}%;background:${a.color}"></div>
          </div>
        </td>
        <td style="padding:10px 0 10px 14px;vertical-align:middle;width:18%;text-align:right">
          <span style="font-size:15px;font-weight:700;color:${a.color}">${d.score.toFixed(1)}</span>
          <span style="font-size:10.5px;color:${BRAND.muted}"> / 4.0</span>
        </td>
      </tr>`;
    })
    .join("");

  const killerBlock = r?.killerTriggered
    ? `<div style="background:#FDEDEC;border:1px solid #F5B7B1;border-radius:8px;padding:12px 16px;font-size:12px;color:#922B21;margin:0 0 14px">
         <strong>Killer-Dimension ausgelöst:</strong> ${esc(
           r.killerTriggered === "strategie" ? "Strategische Klarheit" : "Prozessreife"
         )} liegt unter dem Mindestwert von 2,0. Ohne dieses Fundament ist ein produktiver KI-Einsatz nicht belastbar.
       </div>`
    : "";

  const assessmentP = r?.assessmentText
    ? `<p style="font-size:13px;color:${BRAND.text};line-height:1.65;margin:0 0 12px">${esc(
        r.assessmentText
      )}</p>`
    : "";

  const recommendationP = r?.recommendation
    ? `<p style="font-size:13px;color:${BRAND.orange};font-weight:600;line-height:1.6;margin:0">${esc(
        r.recommendation
      )}</p>`
    : "";

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<style>
  @page { size: A4; margin: 16mm 14mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: ${BRAND.text}; }
  .card { background:#fff; border:1px solid ${BRAND.line}; border-radius:12px; }
  h2 { font-size:14px; color:${BRAND.navy}; margin:0 0 12px; }
</style>
</head>
<body>

  <!-- Kopf -->
  <table style="width:100%;border-collapse:collapse;border-bottom:3px solid ${BRAND.navy};padding-bottom:8px">
    <tr>
      <td style="vertical-align:bottom">
        <div style="font-size:11px;letter-spacing:1px;color:${BRAND.muted};text-transform:uppercase">ZweiMeter.Consulting</div>
        <div style="font-size:23px;font-weight:700;color:${BRAND.navy};margin-top:2px">KI-Readiness-Check</div>
      </td>
      <td style="vertical-align:bottom;text-align:right;font-size:11px;color:${BRAND.muted};line-height:1.6">
        ${dateStr ? `Erstellt am ${esc(dateStr)}<br/>` : ""}
        ${personaLabel ? `Perspektive: ${esc(personaLabel)}` : ""}
      </td>
    </tr>
  </table>

  <!-- Empfänger -->
  ${
    name || company
      ? `<div style="margin:14px 0 4px;font-size:13px;color:${BRAND.text}">
           ${name ? `<strong>${esc(name)}</strong>` : ""}${name && company ? " · " : ""}${
          company ? esc(company) : ""
        }
         </div>`
      : ""
  }

  <!-- Gesamtergebnis -->
  <div class="card" style="overflow:hidden;margin:16px 0 20px">
    <div style="background:${lvlColor};padding:22px 26px;text-align:center;color:#fff">
      <div style="font-size:40px;font-weight:700;line-height:1">${(r?.total ?? 0).toFixed(1)}</div>
      <div style="font-size:11px;opacity:.85;margin-top:2px">von 4.0 Punkten (gewichtet) · ${esc(
        r?.percent ?? 0
      )}%</div>
      <div style="display:inline-block;margin-top:12px;background:rgba(255,255,255,.2);border-radius:20px;padding:6px 20px;font-size:13px;font-weight:700">
        ${esc(r?.levelTitle || "")}
      </div>
    </div>
    <div style="padding:20px 26px">
      ${killerBlock}
      ${assessmentP}
      ${recommendationP}
    </div>
  </div>

  <!-- Dimensionen -->
  <div class="card" style="padding:18px 26px;margin:0 0 20px">
    <h2>Ihre Ergebnisse im Detail</h2>
    <table style="width:100%;border-collapse:collapse">
      ${dimRows}
    </table>
  </div>

  <!-- Fuß -->
  <div style="border-top:1px solid ${BRAND.line};padding-top:12px;font-size:10.5px;color:${BRAND.muted};line-height:1.6">
    Dieser Report wurde automatisch auf Basis Ihrer Selbsteinschätzung erstellt und ersetzt keine individuelle Beratung.
    Nächster Schritt: ein gemeinsames Gespräch, in dem wir Ihre Ergebnisse einordnen und konkrete Maßnahmen ableiten.
    <br/>ZweiMeter.Consulting · robert@zweimeter.online
  </div>

</body>
</html>`;
}
