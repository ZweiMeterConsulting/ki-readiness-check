// Leichtgewichtiges Funnel-Tracking.
// Sendet Events an Plausible und/oder GA4 – aber nur, wenn im Layout ein
// entsprechendes Script geladen wurde (env NEXT_PUBLIC_PLAUSIBLE_DOMAIN /
// NEXT_PUBLIC_GA_ID). Ohne Konfiguration ist track() ein No-op (nur Dev-Log).
// Tracking darf die App niemals blockieren oder zum Absturz bringen.

export type FunnelEvent =
  | "check_started"
  | "persona_selected"
  | "quiz_completed"
  | "lead_submitted"
  | "lead_captured"
  | "lead_error"
  | "report_viewed"
  | "pdf_exported"
  | "cta_clicked"
  | "calendly_opened"
  | "check_restarted";

type Props = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    plausible?: (
      event: string,
      opts?: { props?: Props; callback?: () => void }
    ) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function track(event: FunnelEvent, props?: Props): void {
  if (typeof window === "undefined") return;
  try {
    window.plausible?.(event, props ? { props } : undefined);
    window.gtag?.("event", event, props ?? {});
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.debug("[track]", event, props ?? {});
    }
  } catch {
    /* Analytics darf nie die App brechen */
  }
}
