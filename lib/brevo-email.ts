// Dünner Wrapper um Brevos Transaktions-E-Mail-API (POST /v3/smtp/email).
// Wird für den PDF-Versand an Kunde + interne Kopie genutzt.

const BREVO_BASE = "https://api.brevo.com/v3";

export interface BrevoAttachment {
  name: string; // Dateiname inkl. Endung
  content: string; // Base64
}

export interface SendEmailArgs {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  replyToEmail?: string;
  attachments?: BrevoAttachment[];
}

export async function sendBrevoEmail(
  args: SendEmailArgs
): Promise<{ ok: boolean; status: number; body?: string }> {
  const resp = await fetch(`${BREVO_BASE}/smtp/email`, {
    method: "POST",
    headers: { "content-type": "application/json", "api-key": args.apiKey },
    body: JSON.stringify({
      sender: { name: args.senderName, email: args.senderEmail },
      to: args.to,
      subject: args.subject,
      htmlContent: args.htmlContent,
      ...(args.replyToEmail ? { replyTo: { email: args.replyToEmail } } : {}),
      ...(args.attachments && args.attachments.length
        ? { attachment: args.attachments }
        : {}),
    }),
  });

  let body: string | undefined;
  if (!resp.ok) {
    try {
      body = await resp.text();
    } catch {
      body = undefined;
    }
  }
  return { ok: resp.ok, status: resp.status, body };
}
