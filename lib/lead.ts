// Gemeinsame Lead-Datenstruktur für Client (Formular) und Server (/api/lead).
// Bewusst neutral gehalten, damit sich derselbe Lead später ohne Umbau ins
// CRM (D:\dev\crm-clean · Contact-Modell) übernehmen lässt.

export type LeadPersona = "solo" | "kmu" | "bereich";

export interface LeadDimensionScore {
  id: string;
  label: string;
  score: number; // 0..4
  weight: number;
}

export interface LeadResult {
  total: number; // gewichteter Gesamtscore 0..4
  level: number; // 1..4
  levelTitle: string; // z.B. "Weitgehend bereit"
  percent: number; // 0..100
  dimensions: LeadDimensionScore[];
  killerTriggered?: string | null;
  // Fließtexte aus der Auswertung – für das PDF (im Frontend bereits berechnet).
  assessmentText?: string;
  recommendation?: string;
}

export interface LeadPayload {
  email: string;
  name?: string;
  company?: string;
  consent: boolean;
  persona: LeadPersona;
  result: LeadResult;
  source?: string; // z.B. "ki-readiness-check"
  meta?: {
    url?: string;
    referrer?: string;
    utm?: Record<string, string>;
  };
}
