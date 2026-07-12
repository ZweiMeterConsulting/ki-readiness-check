import { NextResponse } from "next/server";
import type { LeadPayload } from "@/lib/lead";
import { renderReportHtml } from "@/lib/report-html";
import { generateReportPdf } from "@/lib/pdf";
import { sendBrevoEmail, type BrevoAttachment } from "@/lib/brevo-email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BREVO_BASE = "https://api.brevo.com/v3";

function bad(msg: string) {
  return NextResponse.json({ ok: false, error: msg }, { status: 400 });
}

async function safeText(r: Response): Promise<string> {
  try {
    return await r.text();
  } catch {
    return "";
  }
}

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Begleitmail an den Kunden (PDF liegt als Anhang bei).
function customerEmailHtml(firstName: string, scoreLine: string): string {
  const hi = firstName ? `Hallo ${esc(firstName)},` : "Hallo,";
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C3E50;font-size:14px;line-height:1.6">
    <p>${hi}</p>
    <p>vielen Dank für Ihren KI-Readiness-Check. Ihr persönliches Ergebnis${
      scoreLine ? ` (<strong>${esc(scoreLine)}</strong>)` : ""
    } finden Sie als PDF im Anhang dieser E-Mail.</p>
    <p>Der Report ordnet Ihre Selbsteinschätzung über sechs Dimensionen ein und zeigt, wo die größten Hebel liegen.
    Wenn Sie die Ergebnisse gemeinsam besprechen und konkrete nächste Schritte ableiten möchten, melden Sie sich gern.</p>
    <p>Herzliche Grüße<br/>Robert-Alexander Sonnenberger<br/>ZweiMeter.Consulting</p>
  </div>`;
}

// Interne Benachrichtigung an dich (mit Lead-Daten + PDF im Anhang).
function internalEmailHtml(body: LeadPayload, scoreLine: string): string {
  const r = body.result;
  const rows: [string, string][] = [
    ["E-Mail", body.email],
    ["Name", body.name || "—"],
    ["Unternehmen", body.company || "—"],
    ["Perspektive", body.persona],
    ["Gesamt", scoreLine || "—"],
    ["Prozent", r ? `${r.percent}%` : "—"],
    ["Killer", r?.killerTriggered || "—"],
    ["Quelle", body.source || "ki-readiness-check"],
  ];
  const table = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:3px 12px 3px 0;color:#5A6B7B">${esc(k)}</td><td style="padding:3px 0"><strong>${esc(
          v
        )}</strong></td></tr>`
    )
    .join("");
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#2C3E50;font-size:14px;line-height:1.6">
    <p>Neuer KI-Readiness-Lead:</p>
    <table style="border-collapse:collapse;font-size:13px">${table}</table>
    <p style="color:#5A6B7B;font-size:12px">Das vollständige Ergebnis liegt als PDF bei. Kontakt-Attribute wurden in Brevo aktualisiert.</p>
  </div>`;
}

export async function POST(req: Request) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return bad("Ungültiger Request-Body.");
  }

  const email = (body.email || "").trim().toLowerCase();
  if (!EMAIL_RX.test(email)) return bad("Bitte eine gültige E-Mail-Adresse angeben.");
  if (!body.consent) return bad("Für die Zusendung ist Ihre Einwilligung erforderlich.");

  // Name in Vor-/Nachname trennen (Brevo erwartet getrennte Felder)
  const nameParts = (body.name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts.length ? nameParts[0] : "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const r = body.result;
  const dims = Array.isArray(r?.dimensions) ? r.dimensions : [];
  const dimScore = (id: string): number | undefined => {
    const d = dims.find((x) => x.id === id);
    return d ? Number(d.score.toFixed(2)) : undefined;
  };

  // Brevo-Attribute (im Brevo-Account als Kontakt-Attribute anlegen)
  const attributes: Record<string, unknown> = {
    VORNAME: firstName || undefined,
    NACHNAME: lastName || undefined,
    UNTERNEHMEN: body.company?.trim() || undefined,
    KI_PERSONA: body.persona,
    KI_SCORE: r ? Number(r.total.toFixed(2)) : undefined,
    KI_PROZENT: r?.percent,
    KI_LEVEL: r?.level,
    KI_LEVEL_TITEL: r?.levelTitle,
    KI_STRATEGIE: dimScore("strategie"),
    KI_PROZESSE: dimScore("prozesse"),
    KI_DATEN: dimScore("daten"),
    KI_TECHNIK: dimScore("technik"),
    KI_MENSCHEN: dimScore("menschen"),
    KI_REGULATORIK: dimScore("regulatorik"),
    KI_KILLER: r?.killerTriggered || undefined,
    KI_QUELLE: body.source || "ki-readiness-check",
  };
  Object.keys(attributes).forEach(
    (k) => attributes[k] === undefined && delete attributes[k]
  );

  const results: Record<string, string> = {};

  // ── 1) Brevo (Lead + Follow-up-Sequenz über Liste) ──────────────────────
  const brevoKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID
    ? Number(process.env.BREVO_LIST_ID)
    : undefined;

  if (brevoKey) {
    try {
      const doiTemplate = process.env.BREVO_DOI_TEMPLATE_ID;
      if (doiTemplate && listId) {
        // Double-Opt-In (DSGVO-konform): Brevo verschickt die Bestätigungsmail.
        const resp = await fetch(`${BREVO_BASE}/contacts/doubleOptinConfirmation`, {
          method: "POST",
          headers: { "content-type": "application/json", "api-key": brevoKey },
          body: JSON.stringify({
            email,
            attributes,
            includeListIds: [listId],
            templateId: Number(doiTemplate),
            redirectionUrl:
              process.env.BREVO_DOI_REDIRECT_URL ||
              process.env.NEXT_PUBLIC_SITE_URL ||
              "https://zweimeter.consulting",
          }),
        });
        results.brevo = resp.ok ? "doi_sent" : `error_${resp.status}`;
        if (!resp.ok) {
          console.error("Brevo DOI error", resp.status, await safeText(resp));
        }
      } else {
        // Direkter Upsert (Single-Opt-In). updateEnabled → aktualisiert bestehende Kontakte.
        const resp = await fetch(`${BREVO_BASE}/contacts`, {
          method: "POST",
          headers: { "content-type": "application/json", "api-key": brevoKey },
          body: JSON.stringify({
            email,
            attributes,
            listIds: listId ? [listId] : undefined,
            updateEnabled: true,
          }),
        });
        results.brevo = resp.ok ? "upserted" : `error_${resp.status}`;
        if (!resp.ok) {
          console.error("Brevo error", resp.status, await safeText(resp));
        }
      }
    } catch (e) {
      console.error("Brevo request failed", e);
      results.brevo = "exception";
    }
  } else {
    results.brevo = "skipped_no_key";
  }

  // ── 2) PDF erzeugen + per E-Mail an Kunde und intern versenden ──────────
  // Läuft nur, wenn ein Brevo-Key da ist (Versand über Brevo Transactional).
  // Alles in try/catch: ein PDF-/Mail-Fehler darf den Lead nie kippen.
  if (brevoKey) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "robert@zweimeter.online";
    const senderName = process.env.BREVO_SENDER_NAME || "ZweiMeter.Consulting";
    const notifyEmail = process.env.LEAD_NOTIFY_EMAIL; // interne Kopie an dich
    try {
      const html = renderReportHtml(body, { generatedAt: new Date().toISOString() });
      const pdf = await generateReportPdf(html);
      const attachment: BrevoAttachment = {
        name: "KI-Readiness-Report.pdf",
        content: pdf.toString("base64"),
      };
      const scoreLine = r ? `${r.total.toFixed(1)}/4 · ${r.levelTitle}` : "";

      // a) an den Kunden
      const customer = await sendBrevoEmail({
        apiKey: brevoKey,
        senderName,
        senderEmail,
        replyToEmail: senderEmail,
        to: [{ email, name: (body.name || "").trim() || undefined }],
        subject: "Ihr KI-Readiness-Report",
        htmlContent: customerEmailHtml(firstName, scoreLine),
        attachments: [attachment],
      });
      results.mail_customer = customer.ok ? "sent" : `error_${customer.status}`;
      if (!customer.ok) console.error("Brevo mail (customer)", customer.status, customer.body);

      // b) interne Kopie an dich
      if (notifyEmail) {
        const internal = await sendBrevoEmail({
          apiKey: brevoKey,
          senderName,
          senderEmail,
          to: [{ email: notifyEmail }],
          subject: `Neuer KI-Readiness-Lead: ${email} (${scoreLine})`,
          htmlContent: internalEmailHtml(body, scoreLine),
          attachments: [attachment],
        });
        results.mail_internal = internal.ok ? "sent" : `error_${internal.status}`;
        if (!internal.ok) console.error("Brevo mail (internal)", internal.status, internal.body);
      } else {
        results.mail_internal = "skipped_no_notify_email";
      }
    } catch (e) {
      console.error("PDF/Mail failed", e);
      results.pdf_mail = "exception";
    }
  }

  // ── 3) CRM-Weiterleitung (optional – „später ins CRM") ──────────────────
  // Sobald CRM_WEBHOOK_URL gesetzt ist, wird der Lead zusätzlich dorthin
  // geschickt. Das Payload ist bereits am Contact-Modell des CRM ausgerichtet.
  const crmUrl = process.env.CRM_WEBHOOK_URL;
  if (crmUrl) {
    try {
      const resp = await fetch(crmUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(process.env.CRM_WEBHOOK_SECRET
            ? { authorization: `Bearer ${process.env.CRM_WEBHOOK_SECRET}` }
            : {}),
        },
        body: JSON.stringify({
          source: "ki-readiness-check",
          firstName: firstName || null,
          lastName: lastName || null,
          email,
          company: body.company?.trim() || null,
          persona: body.persona,
          kiReadiness: r,
          meta: body.meta ?? null,
          receivedAt: new Date().toISOString(),
        }),
      });
      results.crm = resp.ok ? "forwarded" : `error_${resp.status}`;
      if (!resp.ok) {
        console.error("CRM forward error", resp.status, await safeText(resp));
      }
    } catch (e) {
      console.error("CRM forward failed", e);
      results.crm = "exception";
    }
  }

  // Immer 200 zurückgeben: der Nutzer soll sein Ergebnis in jedem Fall sehen.
  // Der Lead-Status steht in `results` (für Debugging / Monitoring).
  return NextResponse.json({ ok: true, results });
}
