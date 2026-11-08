// Brevo-Kontaktsync für die Marketing-Sales-Bridge.
// Legt den Lead als Kontakt in Brevo an bzw. aktualisiert ihn (Upsert) und
// schreibt die KI_*-Attribute, die scripts/brevo-setup.sh (Tag
// juli-2026-brevo-puppeteer) im Brevo-Account angelegt hat. Der Mailversand
// läuft weiterhin über Resend – Brevo dient nur als Kontakt-/Lead-Store.
//
// Env-Variablen:
//   BREVO_API_KEY  (Pflicht für den Sync; fehlt er, wird der Sync übersprungen)
//   BREVO_LIST_ID  (optional; Kontaktliste "KI-Readiness-Leads")

import type { ReportResult } from "@/lib/scoring";

const BREVO_BASE = "https://api.brevo.com/v3";

export interface BrevoSyncContact {
  name: string;
  company?: string;
  email: string;
}

export type BrevoSyncStatus = "upserted" | "skipped_no_key" | `error_${number}` | "exception";

export async function syncLeadToBrevo(
  contact: BrevoSyncContact,
  result: ReportResult,
  source = "ki-readiness-check"
): Promise<BrevoSyncStatus> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return "skipped_no_key";

  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;

  // Brevo führt Vor- und Nachname getrennt.
  const nameParts = contact.name.trim().split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

  const dim = (id: string): number | undefined => {
    const v = result.dimScores[id];
    return typeof v === "number" ? Number(v.toFixed(2)) : undefined;
  };

  const attributes: Record<string, unknown> = {
    VORNAME: firstName || undefined,
    NACHNAME: lastName || undefined,
    UNTERNEHMEN: contact.company || undefined,
    KI_PERSONA: result.persona,
    KI_SCORE: Number(result.weightedTotal.toFixed(2)),
    KI_PROZENT: Number(((result.weightedTotal / 4) * 100).toFixed(1)),
    KI_LEVEL: result.assessment.level,
    KI_LEVEL_TITEL: result.assessment.title,
    KI_STRATEGIE: dim("strategie"),
    KI_PROZESSE: dim("prozesse"),
    KI_DATEN: dim("daten"),
    KI_TECHNIK: dim("technik"),
    KI_MENSCHEN: dim("menschen"),
    KI_REGULATORIK: dim("regulatorik"),
    KI_KILLER: result.assessment.killerTriggered || undefined,
    KI_QUELLE: source,
  };
  Object.keys(attributes).forEach((k) => attributes[k] === undefined && delete attributes[k]);

  try {
    // updateEnabled: true → bestehender Kontakt wird aktualisiert statt 400 zu liefern.
    const resp = await fetch(`${BREVO_BASE}/contacts`, {
      method: "POST",
      headers: { "content-type": "application/json", "api-key": apiKey },
      body: JSON.stringify({
        email: contact.email,
        attributes,
        listIds: listId ? [listId] : undefined,
        updateEnabled: true,
      }),
    });
    if (!resp.ok) {
      let detail = "";
      try { detail = await resp.text(); } catch { /* ignorieren */ }
      console.error("[brevo] Kontakt-Upsert fehlgeschlagen:", resp.status, detail.slice(0, 500));
      return `error_${resp.status}`;
    }
    return "upserted";
  } catch (err) {
    console.error("[brevo] Request fehlgeschlagen:", err);
    return "exception";
  }
}
