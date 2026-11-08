// POST /api/report
// Nimmt Antworten + Kontaktdaten entgegen, berechnet das Ergebnis serverseitig neu,
// erzeugt das PDF und verschickt zwei E-Mails über Resend:
//   1. an den Kunden (Ergebnis + PDF im Anhang)
//   2. an LEAD_NOTIFY_EMAIL (Lead-Benachrichtigung mit allen Antworten + PDF)
// Zusätzlich wird der Lead als Kontakt mit KI_*-Attributen nach Brevo
// synchronisiert (Marketing-Sales-Bridge, siehe lib/brevo-contacts.ts).
//
// GET /api/report?preview=1 liefert ein Demo-PDF (nur wenn REPORT_PREVIEW=1 gesetzt ist).

import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import { Resend } from "resend";
import React from "react";
import fs from "node:fs";
import path from "node:path";
import { computeResult, validateAnswers, DIMENSIONS, PERSONAS, SCALE_OPTIONS, CALENDLY_URL } from "@/lib/scoring";
import type { PersonaId, ReportResult } from "@/lib/scoring";
import { ReportDocument } from "@/lib/pdf/ReportDocument";
import type { ReportContact } from "@/lib/pdf/ReportDocument";
import { syncLeadToBrevo } from "@/lib/brevo-contacts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

// ── Konfiguration über Umgebungsvariablen ──────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const MAIL_FROM = process.env.MAIL_FROM ?? "KI-Readiness-Check <check@zweimeter.consulting>";
const LEAD_NOTIFY_EMAIL = process.env.LEAD_NOTIFY_EMAIL ?? "robert@zweimeter.online";
const REPLY_TO = process.env.MAIL_REPLY_TO ?? LEAD_NOTIFY_EMAIL;

// ── Hilfsfunktionen ────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function esc(v: string) {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}

function loadLogo(): Buffer | undefined {
  try {
    return fs.readFileSync(path.join(process.cwd(), "public", "logo.png"));
  } catch {
    return undefined;
  }
}

async function buildPdf(result: ReportResult, contact: ReportContact) {
  const element = React.createElement(ReportDocument, {
    result, contact, logo: loadLogo(), createdAt: new Date(),
  }) as unknown as React.ReactElement<DocumentProps>;
  return renderToBuffer(element);
}

function scaleLabel(v: number) {
  return SCALE_OPTIONS.find((o) => o.value === v)?.label ?? String(v);
}

function customerHtml(result: ReportResult, contact: ReportContact) {
  const { assessment, weightedTotal, dimScores, actionFields } = result;
  const isSolo = result.persona === "solo";
  const dims = DIMENSIONS.map((d) =>
    `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee">${esc(d.shortLabel)}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;color:${d.color}">${(dimScores[d.id] || 0).toFixed(1)}</td></tr>`
  ).join("");
  const fields = actionFields.length
    ? `<ol>${actionFields.map((d) => `<li>${esc(d.label)} (${(dimScores[d.id] || 0).toFixed(1)} / 4,0)</li>`).join("")}</ol>`
    : "<p>Alle Dimensionen im grünen Bereich – starke Ausgangslage.</p>";
  return `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2C3E50;max-width:620px">
  <p>Guten Tag ${esc(contact.name)},</p>
  <p>vielen Dank, dass Sie den KI-Readiness-Check gemacht haben. Ihr vollständiger Report liegt dieser E-Mail als PDF bei.</p>
  <div style="background:${assessment.color};color:#fff;border-radius:8px;padding:18px 24px;margin:20px 0">
    <div style="font-size:34px;font-weight:bold">${weightedTotal.toFixed(1)} <span style="font-size:14px;font-weight:normal;opacity:.8">von 4,0</span></div>
    <div style="font-size:16px;font-weight:bold;margin-top:4px">${esc(assessment.title)}</div>
  </div>
  <p>${esc(assessment.text)}</p>
  <p style="color:#E8720C;font-weight:bold">${esc(assessment.recommendation)}</p>
  ${assessment.level === 1 ? `<p><a href="${CALENDLY_URL}" style="display:inline-block;background:#1A3A5C;color:#fff;text-decoration:none;border-radius:8px;padding:12px 22px;font-weight:bold">Strategisches Erstgespräch buchen – 30 Minuten, kostenlos</a></p>` : ""}
  <h3 style="color:#1A3A5C;margin-top:24px">Ergebnis nach Dimensionen</h3>
  <table style="border-collapse:collapse;width:100%;max-width:360px">${dims}</table>
  <h3 style="color:#1A3A5C;margin-top:24px">Prioritäre Handlungsfelder</h3>
  ${fields}
  <p style="margin-top:28px">${isSolo
    ? "Wenn Sie möchten, gehen wir Ihre Ergebnisse in einem unverbindlichen 30-minütigen Gespräch gemeinsam durch. Antworten Sie einfach auf diese E-Mail."
    : "Wenn Sie tiefer einsteigen möchten: Der persönliche KI-Readiness-Check (zwei Beratungstage, vollständige Scorecard, konkreter Maßnahmenplan) ist BAFA-förderfähig. Antworten Sie einfach auf diese E-Mail."}</p>
  <p><a href="${CALENDLY_URL}" style="display:inline-block;background:#E8720C;color:#fff;text-decoration:none;border-radius:8px;padding:12px 22px;font-weight:bold">Kennenlerngespräch buchen (30 Minuten)</a></p>
  <p>Mit besten Grüßen<br><strong>Robert-Alexander Sonnenberger</strong><br>${esc(assessment.ctaProduct)} · Strategie mit Weitblick</p>
</div>`;
}

function leadHtml(result: ReportResult, contact: ReportContact, meta: { ip: string; ua: string }) {
  const { assessment, weightedTotal, dimScores } = result;
  const rows = DIMENSIONS.map((d) => {
    const qs = d.questions.map((q) => {
      const v = result.answers[q.id];
      return `<tr><td style="padding:3px 6px;border-bottom:1px solid #eee;width:28px;text-align:center;font-weight:bold">${v}</td><td style="padding:3px 6px;border-bottom:1px solid #eee;color:#666;font-size:12px">${esc(q.text[result.persona])}<br><span style="color:#999">${esc(scaleLabel(v))}</span></td></tr>`;
    }).join("");
    return `<tr><td colspan="2" style="padding:8px 6px 3px;font-weight:bold;color:${d.color}">${esc(d.label)} – ${(dimScores[d.id] || 0).toFixed(2)}${d.isKiller ? " (Killer)" : ""}</td></tr>${qs}`;
  }).join("");
  return `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#2C3E50;max-width:720px">
  <h2 style="color:#1A3A5C;margin:0 0 8px">Neuer Lead aus dem KI-Readiness-Check</h2>
  <table style="border-collapse:collapse;margin-bottom:16px">
    <tr><td style="padding:2px 10px 2px 0;color:#888">Name</td><td><strong>${esc(contact.name)}</strong></td></tr>
    <tr><td style="padding:2px 10px 2px 0;color:#888">Firma</td><td>${esc(contact.company || "–")}</td></tr>
    <tr><td style="padding:2px 10px 2px 0;color:#888">E-Mail</td><td><a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a></td></tr>
    <tr><td style="padding:2px 10px 2px 0;color:#888">Persona</td><td>${esc(result.personaLabel)} → Funnel: ${esc(assessment.ctaProduct)}</td></tr>
    <tr><td style="padding:2px 10px 2px 0;color:#888">Ergebnis</td><td><strong style="color:${assessment.color}">${weightedTotal.toFixed(2)} / 4,0 – ${esc(assessment.title)}</strong>${assessment.killerTriggered ? ` (Killer: ${assessment.killerTriggered})` : ""}</td></tr>
    <tr><td style="padding:2px 10px 2px 0;color:#888">Zeit</td><td>${new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" })}</td></tr>
    <tr><td style="padding:2px 10px 2px 0;color:#888">IP / Browser</td><td style="color:#999;font-size:12px">${esc(meta.ip)} · ${esc(meta.ua.slice(0, 120))}</td></tr>
  </table>
  <h3 style="color:#1A3A5C">Alle 24 Antworten</h3>
  <table style="border-collapse:collapse;width:100%">${rows}</table>
  <p style="color:#999;font-size:12px;margin-top:16px">Das Kunden-PDF liegt im Anhang. JSON-Rohdaten:<br><code style="font-size:11px">${esc(JSON.stringify({ persona: result.persona, answers: result.answers, dimScores, weightedTotal }))}</code></p>
</div>`;
}

// ── POST ───────────────────────────────────────────────
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültige Anfrage." }, { status: 400 });
  }

  const b = (body ?? {}) as Record<string, unknown>;
  const contactRaw = (b.contact ?? {}) as Record<string, unknown>;

  // Honeypot: echte Nutzer füllen dieses Feld nie aus.
  if (typeof contactRaw.website === "string" && contactRaw.website.trim() !== "") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const persona = b.persona as PersonaId;
  if (!PERSONAS.some((p) => p.id === persona)) {
    return NextResponse.json({ ok: false, error: "Unbekannte Perspektive." }, { status: 400 });
  }
  if (!validateAnswers(b.answers)) {
    return NextResponse.json({ ok: false, error: "Es sind nicht alle 24 Fragen beantwortet." }, { status: 400 });
  }

  const name = String(contactRaw.name ?? "").trim().slice(0, 120);
  const company = String(contactRaw.company ?? "").trim().slice(0, 160);
  const email = String(contactRaw.email ?? "").trim().toLowerCase().slice(0, 200);
  const consent = contactRaw.consent === true;

  if (name.length < 2) return NextResponse.json({ ok: false, error: "Bitte geben Sie Ihren Namen an." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Bitte geben Sie eine gültige E-Mail-Adresse an." }, { status: 400 });
  if (!consent) return NextResponse.json({ ok: false, error: "Bitte stimmen Sie der Datenverarbeitung zu." }, { status: 400 });

  if (!RESEND_API_KEY) {
    console.error("[report] RESEND_API_KEY fehlt – E-Mail-Versand nicht konfiguriert.");
    return NextResponse.json({ ok: false, error: "E-Mail-Versand ist auf dem Server nicht konfiguriert." }, { status: 500 });
  }

  const contact: ReportContact = { name, company: company || undefined, email };
  const result = computeResult(b.answers, persona);

  let pdf: Buffer;
  try {
    pdf = await buildPdf(result, contact);
  } catch (err) {
    console.error("[report] PDF-Erzeugung fehlgeschlagen:", err);
    return NextResponse.json({ ok: false, error: "Der PDF-Report konnte nicht erzeugt werden." }, { status: 500 });
  }

  const dateTag = new Date().toISOString().slice(0, 10);
  const safeName = (company || name).replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 40) || "Report";
  const filename = `KI-Readiness-Report_${safeName}_${dateTag}.pdf`;
  const meta = {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unbekannt",
    ua: req.headers.get("user-agent") || "",
  };

  const resend = new Resend(RESEND_API_KEY);
  const attachments = [{ filename, content: pdf }];

  const [toCustomer, toOwner, brevoSync] = await Promise.allSettled([
    resend.emails.send({
      from: MAIL_FROM,
      to: email,
      replyTo: REPLY_TO,
      subject: `Ihr KI-Readiness-Ergebnis: ${result.weightedTotal.toFixed(1)} von 4,0 – ${result.assessment.title}`,
      html: customerHtml(result, contact),
      attachments,
    }),
    resend.emails.send({
      from: MAIL_FROM,
      to: LEAD_NOTIFY_EMAIL,
      replyTo: email,
      subject: `[Lead] KI-Check ${result.weightedTotal.toFixed(1)} · ${company || name} · ${result.personaLabel}`,
      html: leadHtml(result, contact, meta),
      attachments,
    }),
    // Kontakt + KI_*-Attribute nach Brevo (Marketing-Sales-Bridge). Fehler
    // werden nur geloggt – der Report-Versand darf daran nie scheitern.
    syncLeadToBrevo(contact, result),
  ]);

  const brevoStatus = brevoSync.status === "fulfilled" ? brevoSync.value : "exception";
  if (brevoStatus !== "upserted" && brevoStatus !== "skipped_no_key") {
    console.error("[report] Brevo-Kontaktsync fehlgeschlagen:", brevoStatus);
  }

  const customerOk = toCustomer.status === "fulfilled" && !toCustomer.value.error;
  const ownerOk = toOwner.status === "fulfilled" && !toOwner.value.error;
  if (!customerOk) console.error("[report] Kunden-Mail fehlgeschlagen:", toCustomer.status === "rejected" ? toCustomer.reason : toCustomer.value.error);
  if (!ownerOk) console.error("[report] Lead-Mail fehlgeschlagen:", toOwner.status === "rejected" ? toOwner.reason : toOwner.value.error);

  if (!customerOk) {
    return NextResponse.json({ ok: false, error: "Die E-Mail konnte nicht zugestellt werden. Bitte prüfen Sie die Adresse." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, leadNotified: ownerOk, brevo: brevoStatus });
}

// ── GET (Vorschau) ─────────────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (process.env.REPORT_PREVIEW !== "1" || url.searchParams.get("preview") !== "1") {
    return NextResponse.json({ ok: false, error: "Nicht verfügbar." }, { status: 404 });
  }
  const persona = (url.searchParams.get("persona") as PersonaId) || "kmu";
  const answers: Record<string, number> = {};
  const fixed = Number(url.searchParams.get("value")); // z. B. value=1 für "Nicht bereit"
  DIMENSIONS.forEach((d, di) => d.questions.forEach((q, qi) => { answers[q.id] = fixed >= 1 && fixed <= 4 ? fixed : ((di + qi) % 4) + 1; }));
  const result = computeResult(answers, PERSONAS.some((p) => p.id === persona) ? persona : "kmu");
  const pdf = await buildPdf(result, { name: "Max Mustermann", company: "Muster GmbH", email: "max@example.com" });
  return new NextResponse(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": 'inline; filename="KI-Readiness-Report_Vorschau.pdf"' },
  });
}
