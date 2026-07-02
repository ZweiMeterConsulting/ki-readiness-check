export type PersonaId = "solo" | "kmu" | "bereich";
export type Phase = "intro" | "persona" | "quiz" | "result";

export interface PersonaConfig {
  id: PersonaId;
  label: string;
  description: string;
  icon: string;
  funnel: string;
}

export interface PersonaTexts {
  solo: string;
  kmu: string;
  bereich: string;
}

export interface Question {
  id: string;
  text: PersonaTexts;
}

export interface Dimension {
  id: string;
  label: string;
  shortLabel: string;
  weight: number;
  isKiller: boolean;
  killerThreshold?: number;
  killerEffect?: "override" | "downgrade";
  color: string;
  description: PersonaTexts;
  questions: Question[];
}

export interface Assessment {
  level: number;
  title: string;
  color: string;
  text: string;
  recommendation: string;
  killerTriggered?: string | null;
  ctaProduct: string;
}

export interface ScaleOption {
  value: number;
  label: string;
}

export interface Ampel {
  color: string;
  label: string;
  text: string;
}
