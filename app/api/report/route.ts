// Erzeugt aus einem LeadPayload das gebrandete KI-Readiness-PDF und liefert es
// als Download aus. Wird vom "Als PDF speichern"-Button (Frontend) genutzt.
import type { LeadPayload } from "@/lib/lead";
import { renderReportHtml } from "@/lib/report-html";
import { generateReportPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: Request) {
  let payload: LeadPayload;
  try {
    payload = (await req.json()) as LeadPayload;
  } catch {
    return new Response("Ungültiger Request-Body.", { status: 400 });
  }

  if (!payload?.result) {
    return new Response("Kein Ergebnis im Payload.", { status: 400 });
  }

  try {
    const html = renderReportHtml(payload, { generatedAt: new Date().toISOString() });
    const pdf = await generateReportPdf(html);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="ki-readiness-report.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[KI-PDF] Erzeugung fehlgeschlagen:", e);
    return new Response("PDF konnte nicht erstellt werden.", { status: 500 });
  }
}
