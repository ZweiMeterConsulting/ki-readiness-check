"use client";

import { useState, useMemo } from "react";

// ── Typen ──────────────────────────────────────────────
type PersonaId = "solo" | "kmu" | "bereich";
type Phase = "intro" | "persona" | "quiz" | "result";

interface PersonaConfig {
  id: PersonaId;
  label: string;
  description: string;
  icon: string;
  funnel: string;
}

interface PersonaTexts {
  solo: string;
  kmu: string;
  bereich: string;
}

interface Question {
  id: string;
  text: PersonaTexts;
}

interface Dimension {
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

interface Assessment {
  level: number;
  title: string;
  color: string;
  text: string;
  recommendation: string;
  killerTriggered?: string | null;
  ctaProduct: string;
}

// ── Persona-Konfiguration ──────────────────────────────
const PERSONAS: PersonaConfig[] = [
  {
    id: "solo",
    label: "Einzelunternehmer / Freiberufler",
    description: "Ich nutze den Check für mich und mein eigenes Unternehmen.",
    icon: "solo",
    funnel: "zweimeter.online",
  },
  {
    id: "kmu",
    label: "Unternehmen (bis 250 Mitarbeitende)",
    description: "Ich prüfe die KI-Bereitschaft meines gesamten Unternehmens.",
    icon: "kmu",
    funnel: "ZweiMeter.Consulting",
  },
  {
    id: "bereich",
    label: "Bereich / Abteilung",
    description: "Ich prüfe die KI-Bereitschaft meines Bereichs in einem größeren Unternehmen.",
    icon: "bereich",
    funnel: "ZweiMeter.Consulting",
  },
];

function PersonaIcon({ type }: { type: string }) {
  const base: React.CSSProperties = {
    width: 40, height: 40, borderRadius: 8, display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
    background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
  };
  if (type === "solo") {
    return (
      <div style={base}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AED6F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    );
  }
  if (type === "kmu") {
    return (
      <div style={base}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AED6F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22V12h6v10" />
          <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01" />
        </svg>
      </div>
    );
  }
  return (
    <div style={base}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AED6F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  );
}

// ── Dimensions-Konfiguration ───────────────────────────
const DIMENSIONS: Dimension[] = [
  {
    id: "strategie",
    label: "Strategische Klarheit und Zielreife",
    shortLabel: "Strategie",
    weight: 1.5,
    isKiller: true,
    killerThreshold: 2.0,
    killerEffect: "override",
    color: "#1A3A5C",
    description: {
      solo: "Haben Sie eine klare Vorstellung davon, warum und wofür Sie KI einsetzen wollen?",
      kmu: "Hat Ihr Unternehmen eine klare Vorstellung davon, warum und wofür es KI einsetzen will?",
      bereich: "Hat Ihr Bereich eine klare Vorstellung davon, warum und wofür KI eingesetzt werden soll?",
    },
    questions: [
      {
        id: "F1.1",
        text: {
          solo: "Ich kann klar formulieren, welches Ziel ich mit dem Einsatz von KI erreichen will.",
          kmu: "Wir können klar formulieren, welches Ziel wir mit dem Einsatz von KI in unserem Unternehmen erreichen wollen.",
          bereich: "Wir können in unserem Bereich klar formulieren, welches Ziel wir mit dem Einsatz von KI erreichen wollen.",
        },
      },
      {
        id: "F1.2",
        text: {
          solo: "Ich habe mindestens einen konkreten Bereich oder Ablauf identifiziert, in dem KI mir einen spürbaren Mehrwert bringen könnte.",
          kmu: "Wir haben mindestens einen konkreten Bereich oder Ablauf identifiziert, in dem KI einen spürbaren Mehrwert schaffen könnte.",
          bereich: "Wir haben in unserem Bereich mindestens einen konkreten Ablauf identifiziert, in dem KI einen spürbaren Mehrwert schaffen könnte.",
        },
      },
      {
        id: "F1.3",
        text: {
          solo: "Meine Motivation für KI basiert auf einem konkreten Verbesserungsziel – nicht auf dem Gefühl, etwas tun zu müssen, weil alle es tun.",
          kmu: "Unsere Motivation für KI basiert auf einem konkreten Verbesserungsziel – nicht auf dem Gefühl, etwas tun zu müssen, weil alle es tun.",
          bereich: "Die Motivation unseres Bereichs für KI basiert auf einem konkreten Verbesserungsziel – nicht auf dem Gefühl, etwas tun zu müssen, weil alle es tun.",
        },
      },
      {
        id: "F1.4",
        text: {
          solo: "Ich bin bereit, Zeit und Ressourcen in eine strukturierte KI-Einführung zu investieren.",
          kmu: "Unsere Geschäftsführung steht hinter dem Vorhaben und ist bereit, Zeit und Ressourcen für eine strukturierte Einführung bereitzustellen.",
          bereich: "Die Leitung unseres Bereichs steht hinter dem Vorhaben und ist bereit, Zeit und Ressourcen für eine strukturierte Einführung bereitzustellen.",
        },
      },
    ],
  },
  {
    id: "prozesse",
    label: "Prozessreife",
    shortLabel: "Prozesse",
    weight: 1.3,
    isKiller: true,
    killerThreshold: 2.0,
    killerEffect: "downgrade",
    color: "#2E6DA4",
    description: {
      solo: "Sind Ihre Arbeitsabläufe so strukturiert, dass sie als Grundlage für KI-gestützte Optimierung dienen können?",
      kmu: "Sind Ihre Geschäftsprozesse so strukturiert und dokumentiert, dass sie als Grundlage für KI-gestützte Optimierung dienen können?",
      bereich: "Sind die Prozesse in Ihrem Bereich so strukturiert und dokumentiert, dass sie als Grundlage für KI-gestützte Optimierung dienen können?",
    },
    questions: [
      {
        id: "F2.1",
        text: {
          solo: "Meine wesentlichen Arbeitsabläufe sind so strukturiert, dass ich sie jederzeit nachvollziehen und reproduzieren kann.",
          kmu: "Unsere wesentlichen Geschäftsprozesse sind dokumentiert und für neue Mitarbeitende nachvollziehbar.",
          bereich: "Die wesentlichen Prozesse unseres Bereichs sind dokumentiert und für neue Teammitglieder nachvollziehbar.",
        },
      },
      {
        id: "F2.2",
        text: {
          solo: "Ich weiß, welche meiner Abläufe besonders zeitintensiv oder fehleranfällig sind.",
          kmu: "Wir wissen, welche Abläufe in unserem Unternehmen besonders zeitintensiv oder fehleranfällig sind.",
          bereich: "Wir wissen, welche Abläufe in unserem Bereich besonders zeitintensiv oder fehleranfällig sind.",
        },
      },
      {
        id: "F2.3",
        text: {
          solo: "Wiederkehrende Aufgaben erledige ich nach einem festen Ablauf – nicht jedes Mal anders.",
          kmu: "Wiederkehrende Aufgaben laufen bei uns nach einem einheitlichen Standard ab – nicht je nach Person unterschiedlich.",
          bereich: "Wiederkehrende Aufgaben laufen in unserem Bereich nach einem einheitlichen Standard ab – nicht je nach Person unterschiedlich.",
        },
      },
      {
        id: "F2.4",
        text: {
          solo: "Meine Arbeitsabläufe sind weitgehend digital – ich arbeite nicht mehr überwiegend mit Papier, manuellen Listen oder isolierten Einzeldateien.",
          kmu: "Unsere Arbeitsabläufe sind weitgehend digitalisiert – wir arbeiten nicht mehr überwiegend mit Papier, manuellen Listen oder isolierten Einzeldateien.",
          bereich: "Die Arbeitsabläufe in unserem Bereich sind weitgehend digitalisiert – wir arbeiten nicht mehr überwiegend mit Papier, manuellen Listen oder isolierten Einzeldateien.",
        },
      },
    ],
  },
  {
    id: "daten",
    label: "Datenverfügbarkeit und -qualität",
    shortLabel: "Daten",
    weight: 1.0,
    isKiller: false,
    color: "#3498DB",
    description: {
      solo: "Verfügen Sie über die Datengrundlage, die für sinnvolle KI-Anwendungen erforderlich ist?",
      kmu: "Verfügt Ihr Unternehmen über die Datengrundlage, die für sinnvolle KI-Anwendungen erforderlich ist?",
      bereich: "Verfügt Ihr Bereich über die Datengrundlage, die für sinnvolle KI-Anwendungen erforderlich ist?",
    },
    questions: [
      {
        id: "F3.1",
        text: {
          solo: "Ich verfüge über strukturierte digitale Daten zu meinen Kunden, Produkten oder Geschäftsvorgängen.",
          kmu: "Wir verfügen über strukturierte digitale Daten zu unseren Kunden, Produkten oder Geschäftsvorgängen.",
          bereich: "In unserem Bereich verfügen wir über strukturierte digitale Daten zu den relevanten Vorgängen.",
        },
      },
      {
        id: "F3.2",
        text: {
          solo: "Meine Daten sind aktuell, vollständig und werden regelmäßig gepflegt.",
          kmu: "Unsere Daten sind aktuell, vollständig und werden regelmäßig gepflegt.",
          bereich: "Die Daten in unserem Bereich sind aktuell, vollständig und werden regelmäßig gepflegt.",
        },
      },
      {
        id: "F3.3",
        text: {
          solo: "Meine Daten sind zentral zugänglich – nicht über verschiedene Ordner, Geräte oder Dienste verstreut.",
          kmu: "Unsere Daten sind an zentraler Stelle zugänglich – nicht über verschiedene Systeme, Ordner oder Einzelpersonen verstreut.",
          bereich: "Die Daten unseres Bereichs sind zentral zugänglich – nicht über verschiedene Systeme oder Einzelpersonen verstreut.",
        },
      },
      {
        id: "F3.4",
        text: {
          solo: "Ich nutze meine vorhandenen Daten bereits aktiv für Auswertungen, Berichte oder Entscheidungen.",
          kmu: "Wir nutzen unsere vorhandenen Daten bereits aktiv für Auswertungen, Berichte oder Entscheidungen.",
          bereich: "Wir nutzen die vorhandenen Daten unseres Bereichs bereits aktiv für Auswertungen oder Entscheidungen.",
        },
      },
    ],
  },
  {
    id: "technik",
    label: "Technische Infrastruktur",
    shortLabel: "Technik",
    weight: 1.0,
    isKiller: false,
    color: "#1ABC9C",
    description: {
      solo: "Ist Ihre technische Basis geeignet, um KI-Werkzeuge sinnvoll einzusetzen?",
      kmu: "Ist die technische Basis vorhanden, um KI-Werkzeuge sinnvoll einzusetzen und zu integrieren?",
      bereich: "Ist die technische Basis in Ihrem Bereich vorhanden, um KI-Werkzeuge sinnvoll einzusetzen?",
    },
    questions: [
      {
        id: "F4.1",
        text: {
          solo: "Ich arbeite mit zeitgemäßen digitalen Werkzeugen, die regelmäßig aktualisiert werden.",
          kmu: "Wir arbeiten mit zeitgemäßen IT-Systemen, die regelmäßig aktualisiert und gewartet werden.",
          bereich: "In unserem Bereich arbeiten wir mit zeitgemäßen IT-Systemen, die regelmäßig aktualisiert und gewartet werden.",
        },
      },
      {
        id: "F4.2",
        text: {
          solo: "Meine Werkzeuge lassen sich miteinander verbinden oder über Schnittstellen verknüpfen.",
          kmu: "Unsere Systeme verfügen über Schnittstellen oder lassen sich mit anderen Werkzeugen verbinden.",
          bereich: "Die Systeme unseres Bereichs verfügen über Schnittstellen oder lassen sich mit anderen Werkzeugen verbinden.",
        },
      },
      {
        id: "F4.3",
        text: {
          solo: "Ich habe Zugang zu technischer Unterstützung, wenn ich neue digitale Werkzeuge einführen will.",
          kmu: "Wir haben intern oder extern Zugang zu IT-Kompetenz, die neue digitale Werkzeuge einführen und betreuen kann.",
          bereich: "Wir haben in unserem Bereich intern oder extern Zugang zu IT-Kompetenz, die neue Werkzeuge einführen und betreuen kann.",
        },
      },
      {
        id: "F4.4",
        text: {
          solo: "Ich kann neue Software oder Cloud-Dienste ohne größere Hürden in meinen Arbeitsalltag integrieren.",
          kmu: "Unsere IT-Infrastruktur ermöglicht es, neue Software oder Cloud-Dienste ohne größere Hürden einzuführen.",
          bereich: "Die IT-Infrastruktur unseres Bereichs ermöglicht es, neue Software oder Cloud-Dienste ohne größere Hürden einzuführen.",
        },
      },
    ],
  },
  {
    id: "menschen",
    label: "Mitarbeiterkompetenz und Veränderungsbereitschaft",
    shortLabel: "Menschen",
    weight: 1.0,
    isKiller: false,
    color: "#8E44AD",
    description: {
      solo: "Sind Sie bereit und in der Lage, mit KI-gestützten Werkzeugen zu arbeiten?",
      kmu: "Sind Ihre Mitarbeitenden bereit und in der Lage, mit KI-gestützten Werkzeugen zu arbeiten?",
      bereich: "Sind die Mitarbeitenden in Ihrem Bereich bereit und in der Lage, mit KI-gestützten Werkzeugen zu arbeiten?",
    },
    questions: [
      {
        id: "F5.1",
        text: {
          solo: "Ich stehe neuen digitalen Werkzeugen grundsätzlich offen gegenüber.",
          kmu: "Unsere Mitarbeitenden stehen neuen digitalen Werkzeugen grundsätzlich offen gegenüber.",
          bereich: "Die Mitarbeitenden in unserem Bereich stehen neuen digitalen Werkzeugen grundsätzlich offen gegenüber.",
        },
      },
      {
        id: "F5.2",
        text: {
          solo: "Ich nutze bereits eigenständig KI-Werkzeuge wie ChatGPT, Copilot oder ähnliche Anwendungen.",
          kmu: "Im Unternehmen gibt es bereits Mitarbeitende, die eigenständig KI-Werkzeuge wie ChatGPT, Copilot oder ähnliche Anwendungen nutzen.",
          bereich: "In unserem Bereich gibt es bereits Mitarbeitende, die eigenständig KI-Werkzeuge wie ChatGPT, Copilot oder ähnliche Anwendungen nutzen.",
        },
      },
      {
        id: "F5.3",
        text: {
          solo: "Ich investiere regelmäßig in meine eigene Weiterbildung im digitalen Bereich.",
          kmu: "Wir investieren regelmäßig in Weiterbildung und Kompetenzentwicklung im digitalen Bereich.",
          bereich: "In unserem Bereich wird regelmäßig in Weiterbildung und Kompetenzentwicklung im digitalen Bereich investiert.",
        },
      },
      {
        id: "F5.4",
        text: {
          solo: "Veränderungen in meinen Werkzeugen und Abläufen sehe ich als Chance zur Verbesserung – nicht als Belastung.",
          kmu: "Veränderungen in Abläufen und Werkzeugen werden bei uns als Chance zur Verbesserung wahrgenommen – nicht als Bedrohung.",
          bereich: "Veränderungen in Abläufen und Werkzeugen werden in unserem Bereich als Chance zur Verbesserung wahrgenommen – nicht als Bedrohung.",
        },
      },
    ],
  },
  {
    id: "regulatorik",
    label: "Regulatorische Bereitschaft",
    shortLabel: "Regulatorik",
    weight: 0.8,
    isKiller: false,
    color: "#E8720C",
    description: {
      solo: "Sind Sie sich der rechtlichen Rahmenbedingungen für den KI-Einsatz bewusst?",
      kmu: "Ist sich Ihr Unternehmen der rechtlichen Rahmenbedingungen für den KI-Einsatz bewusst?",
      bereich: "Ist sich Ihr Bereich der rechtlichen Rahmenbedingungen für den KI-Einsatz bewusst?",
    },
    questions: [
      {
        id: "F6.1",
        text: {
          solo: "Ich weiß, dass es mit dem EU AI Act gesetzliche Vorgaben für den Einsatz von KI gibt.",
          kmu: "Wir wissen, dass es mit dem EU AI Act gesetzliche Vorgaben für den Einsatz von KI in Unternehmen gibt.",
          bereich: "In unserem Bereich ist bekannt, dass es mit dem EU AI Act gesetzliche Vorgaben für den Einsatz von KI gibt.",
        },
      },
      {
        id: "F6.2",
        text: {
          solo: "Ich habe klare Regeln für den Umgang mit personenbezogenen Daten und setze die DSGVO aktiv um.",
          kmu: "Wir haben klare Regeln für den Umgang mit personenbezogenen Daten und setzen die DSGVO aktiv um.",
          bereich: "In unserem Bereich gibt es klare Regeln für den Umgang mit personenbezogenen Daten und die DSGVO wird aktiv umgesetzt.",
        },
      },
      {
        id: "F6.3",
        text: {
          solo: "Ich habe mich bereits damit beschäftigt, welche Vorgaben des EU AI Act für meine Tätigkeit gelten könnten.",
          kmu: "Wir haben uns bereits damit beschäftigt, welche Vorgaben des EU AI Act für unsere Branche oder unseren KI-Einsatz gelten könnten.",
          bereich: "Wir haben uns in unserem Bereich bereits damit beschäftigt, welche Vorgaben des EU AI Act für unseren KI-Einsatz gelten könnten.",
        },
      },
      {
        id: "F6.4",
        text: {
          solo: "Ich wäre in der Lage, die Nutzung von KI-Werkzeugen gegenüber Kunden oder Partnern transparent zu erklären.",
          kmu: "Wir wären in der Lage, die Nutzung von KI-Werkzeugen in unserem Unternehmen gegenüber Kunden, Partnern oder Aufsichtsbehörden transparent zu erklären.",
          bereich: "Wir wären in der Lage, die Nutzung von KI-Werkzeugen in unserem Bereich gegenüber internen Stakeholdern oder Aufsichtsbehörden transparent zu erklären.",
        },
      },
    ],
  },
];

const SCALE_OPTIONS = [
  { value: 1, label: "Trifft nicht zu" },
  { value: 2, label: "Trifft eher nicht zu" },
  { value: 3, label: "Trifft eher zu" },
  { value: 4, label: "Trifft voll zu" },
];

const TOTAL_WEIGHT = DIMENSIONS.reduce((s, d) => s + d.weight, 0);
const TOTAL_QUESTIONS = DIMENSIONS.reduce((s, d) => s + d.questions.length, 0);

// ── Berechnungen ───────────────────────────────────────
function calcDimensionScore(answers: Record<string, number>, dim: Dimension): number {
  const vals = dim.questions.map((q) => answers[q.id]).filter(Boolean);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function calcWeightedTotal(dimScores: Record<string, number>): number {
  let weightedSum = 0;
  DIMENSIONS.forEach((d) => { weightedSum += (dimScores[d.id] || 0) * d.weight; });
  return weightedSum / TOTAL_WEIGHT;
}

function getAmpel(score: number) {
  if (score < 2.0) return { color: "#E74C3C", label: "Rot", text: "Erheblicher Handlungsbedarf" };
  if (score < 3.0) return { color: "#F39C12", label: "Gelb", text: "Gezielte Maßnahmen empfohlen" };
  return { color: "#27AE60", label: "Grün", text: "Gute Voraussetzungen" };
}

function getOverallAssessment(
  weightedScore: number,
  dimScores: Record<string, number>,
  persona: PersonaId | null
): Assessment {
  const strategieScore = dimScores["strategie"] || 0;
  const prozesseScore = dimScores["prozesse"] || 0;
  const isSolo = persona === "solo";
  const ctaProduct = isSolo ? "zweimeter.online" : "ZweiMeter.Consulting";

  if (strategieScore < 2.0) {
    return {
      level: 1, title: "Nicht bereit", color: "#E74C3C",
      text: isSolo
        ? "Ihre strategische Klarheit liegt unter dem Mindestwert. Ohne ein klares Warum und Wofür ist jeder KI-Einsatz zum Scheitern verurteilt."
        : "Ihre strategische Klarheit liegt unter dem Mindestwert. Ohne ein klares Warum und Wofür ist jede KI-Einführung zum Scheitern verurteilt.",
      recommendation: isSolo
        ? "Empfehlung: Klären Sie zuerst Ihre Ziele. Ein unverbindliches Erstgespräch kann hier den entscheidenden Impuls setzen."
        : "Empfehlung: Klären Sie zuerst Ihre strategischen Ziele. Ein Strategisches Erstgespräch kann hier den entscheidenden Impuls setzen.",
      killerTriggered: "strategie", ctaProduct,
    };
  }

  let effectiveScore = weightedScore;
  let downgraded = false;
  if (prozesseScore < 2.0) { effectiveScore = Math.min(effectiveScore, 1.99); downgraded = true; }

  if (effectiveScore < 2.0) {
    return {
      level: 1, title: "Nicht bereit", color: "#E74C3C",
      text: downgraded
        ? isSolo
          ? "Ihre Arbeitsabläufe sind noch nicht ausreichend strukturiert. Ohne klare Abläufe gibt es nichts, was KI sinnvoll unterstützen könnte."
          : "Ihre Prozessreife liegt unter dem Mindestwert. Ohne dokumentierte und standardisierte Abläufe gibt es nichts, was KI sinnvoll optimieren könnte."
        : "Grundlegende Voraussetzungen müssen zuerst geschaffen werden.",
      recommendation: isSolo
        ? "Empfehlung: Strukturieren Sie zuerst Ihre Abläufe, bevor Sie in KI investieren."
        : "Empfehlung: Starten Sie mit einer Digitalisierungs-Roadmap, bevor Sie in KI investieren.",
      killerTriggered: downgraded ? "prozesse" : null, ctaProduct,
    };
  }
  if (effectiveScore < 2.5) {
    return {
      level: 2, title: "Bedingt bereit", color: "#E67E22",
      text: "Einzelne Bereiche zeigen Potenzial, aber zentrale Lücken bremsen noch.",
      recommendation: isSolo
        ? "Empfehlung: Gezielte Vorbereitung in den schwächsten Bereichen. Ein persönliches Gespräch hilft, die konkreten nächsten Schritte zu definieren."
        : "Empfehlung: Gezielte Vorbereitung in den schwächsten Dimensionen. Der persönliche KI-Readiness-Check hilft, die konkreten nächsten Schritte zu definieren.",
      ctaProduct,
    };
  }
  if (effectiveScore < 3.0) {
    return {
      level: 3, title: "Weitgehend bereit", color: "#F39C12",
      text: "Solide Basis vorhanden, punktueller Nachholbedarf in einzelnen Bereichen.",
      recommendation: isSolo
        ? "Empfehlung: Ein gezieltes Beratungsgespräch identifiziert die verbleibenden Lücken und gibt Ihnen einen klaren Fahrplan."
        : "Empfehlung: Der persönliche KI-Readiness-Check identifiziert die verbleibenden Lücken und gibt Ihnen einen klaren Maßnahmenplan.",
      ctaProduct,
    };
  }
  return {
    level: 4, title: "Bereit", color: "#27AE60",
    text: "Starke Ausgangslage für einen strukturierten KI-Einsatz.",
    recommendation: isSolo
      ? "Empfehlung: Legen Sie los! Ein Beratungsgespräch hilft, die richtigen KI-Werkzeuge für Ihren Arbeitsalltag zu identifizieren."
      : "Empfehlung: Steigen Sie direkt in die KI-Strategieberatung ein, um Ihre Anwendungsfälle zu priorisieren und das erste Pilotprojekt aufzusetzen.",
    ctaProduct,
  };
}

// ── Radar-Chart (SVG) ──────────────────────────────────
function RadarChart({ dimScores }: { dimScores: Record<string, number> }) {
  const cx = 160, cy = 160, maxR = 120;
  const n = DIMENSIONS.length;

  function polarToXY(index: number, value: number) {
    const angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    const r = (value / 4) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const gridLevels = [1, 2, 3, 4];
  const dataPoints = DIMENSIONS.map((d, i) => polarToXY(i, dimScores[d.id] || 0));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: 360 }}>
      {gridLevels.map((level) => {
        const pts = Array.from({ length: n }, (_, i) => polarToXY(i, level));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
        return <path key={level} d={path} fill="none" stroke="#D5D8DC" strokeWidth={level === 2 ? 1.5 : 0.7} strokeDasharray={level === 2 ? "4,3" : "none"} />;
      })}
      {DIMENSIONS.map((d, i) => {
        const end = polarToXY(i, 4);
        return <line key={d.id} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="#D5D8DC" strokeWidth={0.7} />;
      })}
      <path d={dataPath} fill="rgba(26,58,92,0.18)" stroke="#1A3A5C" strokeWidth={2.5} />
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={5} fill={DIMENSIONS[i].color} stroke="#fff" strokeWidth={2} />
      ))}
      {DIMENSIONS.map((d, i) => {
        const lp = polarToXY(i, 4.85);
        return (
          <text key={d.id} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="central"
            style={{ fontSize: 10.5, fontWeight: 700, fill: d.color, fontFamily: "'DM Sans', sans-serif" }}>
            {d.shortLabel}
          </text>
        );
      })}
      {gridLevels.map((level) => {
        const p = polarToXY(0, level);
        return (
          <text key={level} x={p.x + 8} y={p.y - 4} style={{ fontSize: 8.5, fill: "#999", fontFamily: "'DM Sans', sans-serif" }}>
            {level}
          </text>
        );
      })}
    </svg>
  );
}

// ── Haupt-Komponente ───────────────────────────────────
export default function KIReadinessCheck() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [persona, setPersona] = useState<PersonaId | null>(null);
  const [currentDim, setCurrentDim] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [animating, setAnimating] = useState(false);

  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / TOTAL_QUESTIONS) * 100;

  const dim = DIMENSIONS[currentDim];
  const question = dim?.questions[currentQ];

  const getQuestionText = (q: Question) => q.text[persona || "kmu"];
  const getDimDescription = (d: Dimension) => d.description[persona || "kmu"];

  function selectAnswer(value: number) {
    if (animating) return;
    const newAnswers = { ...answers, [question.id]: value };
    setAnswers(newAnswers);
    setAnimating(true);

    setTimeout(() => {
      if (currentQ < dim.questions.length - 1) {
        setCurrentQ(currentQ + 1);
      } else if (currentDim < DIMENSIONS.length - 1) {
        setCurrentDim(currentDim + 1);
        setCurrentQ(0);
      } else {
        setPhase("result");
      }
      setAnimating(false);
    }, 400);
  }

  function goBack() {
    if (phase === "quiz") {
      if (currentQ > 0) {
        setCurrentQ(currentQ - 1);
      } else if (currentDim > 0) {
        setCurrentDim(currentDim - 1);
        setCurrentQ(DIMENSIONS[currentDim - 1].questions.length - 1);
      } else {
        setPhase("persona");
      }
    }
  }

  const dimScores = useMemo(() => {
    const scores: Record<string, number> = {};
    DIMENSIONS.forEach((d) => { scores[d.id] = calcDimensionScore(answers, d); });
    return scores;
  }, [answers]);

  const weightedTotal = useMemo(() => calcWeightedTotal(dimScores), [dimScores]);
  const assessment = useMemo(() => getOverallAssessment(weightedTotal, dimScores, persona), [weightedTotal, dimScores, persona]);

  const sortedDims = useMemo(() =>
    [...DIMENSIONS].sort((a, b) => (dimScores[a.id] || 0) - (dimScores[b.id] || 0)),
  [dimScores]);

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #0D1B2A 0%, #1A3A5C 50%, #2E6DA4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
          <div style={{ display: "inline-block", background: "#fff", borderRadius: 10, padding: "12px 20px", marginBottom: 32, boxShadow: "0 2px 16px rgba(0,0,0,0.15)" }}>
            <img
              src="/logo.png"
              alt="ZweiMeter.Consulting"
              style={{ height: 56, display: "block" }}
            />
          </div>
          <h1 style={{ color: "#fff", fontSize: 32, fontWeight: 700, lineHeight: 1.25, margin: "0 0 16px" }}>
            KI-Readiness-Check
          </h1>
          <p style={{ color: "#AED6F1", fontSize: 15, lineHeight: 1.7, marginTop: 0, marginBottom: 32, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            Finden Sie in 12 bis 15 Minuten heraus, wie bereit Sie für den Einsatz von Künstlicher Intelligenz sind. 24 Fragen, 6 Dimensionen, eine ehrliche Standortbestimmung.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
            {DIMENSIONS.map((d) => (
              <span key={d.id} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#D6EAF8", fontWeight: 500 }}>
                {d.shortLabel}
              </span>
            ))}
          </div>
          <button
            onClick={() => setPhase("persona")}
            style={{ background: "#E8720C", color: "#fff", border: "none", borderRadius: 8, padding: "16px 48px", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "transform 0.15s", letterSpacing: 0.3 }}
            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.transform = "scale(1.04)"}
            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.transform = "scale(1)"}
          >
            Check starten
          </button>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 24 }}>
            {"Kostenlos \u00B7 Keine Registrierung \u00B7 Sofortergebnis"}
          </p>
        </div>
      </div>
    );
  }

  // ── PERSONA-AUSWAHL ──
  if (phase === "persona") {
    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(170deg, #0D1B2A 0%, #1A3A5C 50%, #2E6DA4 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 640, width: "100%", textAlign: "center" }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: "#AED6F1", textTransform: "uppercase", fontWeight: 700, marginBottom: 24 }}>
            Bevor es losgeht
          </div>
          <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: "0 0 8px" }}>
            In welcher Rolle wollen Sie den Check nutzen?
          </h2>
          <p style={{ color: "#AED6F1", fontSize: 14, lineHeight: 1.6, margin: "0 0 32px" }}>
            Damit wir die Fragen passend auf Ihre Situation zuschneiden können.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "0 auto" }}>
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                onClick={() => { setPersona(p.id); setPhase("quiz"); }}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
                  background: "rgba(255,255,255,0.06)", border: "2px solid rgba(255,255,255,0.15)",
                  borderRadius: 10, cursor: "pointer", textAlign: "left",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "#E8720C"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                <PersonaIcon type={p.icon} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: "#AED6F1", lineHeight: 1.4 }}>{p.description}</div>
                </div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setPhase("intro")}
            style={{ marginTop: 24, background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}
          >
            {"\u2190 Zurück"}
          </button>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (phase === "quiz") {
    const globalQIndex = DIMENSIONS.slice(0, currentDim).reduce((s, d) => s + d.questions.length, 0) + currentQ;
    const isFirst = currentDim === 0 && currentQ === 0;

    return (
      <div style={{ minHeight: "100vh", background: "#F0F2F5", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#1A3A5C", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#AED6F1", fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>KI-Readiness-Check</span>
          <span style={{ color: "#AED6F1", fontSize: 12 }}>{totalAnswered} / {TOTAL_QUESTIONS}</span>
        </div>
        <div style={{ height: 4, background: "#D5D8DC" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, #1A3A5C, ${dim.color})`, transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", gap: 2, padding: "16px 24px 0", overflowX: "auto" }}>
          {DIMENSIONS.map((d, i) => {
            const done = i < currentDim;
            const active = i === currentDim;
            return (
              <div key={d.id} style={{
                padding: "8px 14px", borderRadius: "6px 6px 0 0", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                background: active ? "#fff" : done ? "rgba(39,174,96,0.12)" : "rgba(0,0,0,0.04)",
                color: active ? d.color : done ? "#27AE60" : "#999",
                borderBottom: active ? `3px solid ${d.color}` : "3px solid transparent",
              }}>
                {done ? "\u2713 " : ""}{d.shortLabel}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ maxWidth: 640, width: "100%", background: "#fff", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", padding: "40px 36px", opacity: animating ? 0.4 : 1, transition: "opacity 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: dim.color }} />
              <span style={{ fontSize: 12, color: dim.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
                {dim.label}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 28, lineHeight: 1.5 }}>{getDimDescription(dim)}</p>
            <div style={{ fontSize: 12, color: "#AAA", marginBottom: 8 }}>Frage {globalQIndex + 1} von {TOTAL_QUESTIONS}</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: "#1A3A5C", lineHeight: 1.5, marginBottom: 32, minHeight: 54 }}>
              {getQuestionText(question)}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SCALE_OPTIONS.map((opt) => {
                const selected = answers[question.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => selectAnswer(opt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 20px", borderRadius: 8, border: `2px solid ${selected ? dim.color : "#E5E8EC"}`,
                      background: selected ? `${dim.color}0D` : "#FAFBFC", cursor: "pointer",
                      fontSize: 14, color: selected ? dim.color : "#2C3E50", fontWeight: selected ? 600 : 400,
                      transition: "all 0.15s", textAlign: "left" as const,
                    }}
                    onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.borderColor = dim.color + "66"; e.currentTarget.style.background = "#F8F9FA"; } }}
                    onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.borderColor = "#E5E8EC"; e.currentTarget.style.background = "#FAFBFC"; } }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: selected ? dim.color : "#E5E8EC", color: selected ? "#fff" : "#999",
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {opt.value}
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button onClick={goBack} style={{
              marginTop: 24, background: "none", border: "none", color: "#999", fontSize: 13,
              cursor: "pointer", padding: "4px 0",
            }}>
              {isFirst ? "\u2190 Rollenauswahl ändern" : "\u2190 Vorherige Frage"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  const personaInfo = PERSONAS.find((p) => p.id === persona);
  const isSolo = persona === "solo";

  return (
    <div style={{ minHeight: "100vh", background: "#F0F2F5" }}>
      <div style={{ background: "#1A3A5C", padding: "20px 24px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: "#fff", borderRadius: 6, padding: "6px 12px", marginBottom: 10 }}>
          <img
            src="/logo.png"
            alt={assessment.ctaProduct}
            style={{ height: 28, display: "block" }}
          />
        </div>
        <h1 style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginTop: 4 }}>Ihr KI-Readiness-Ergebnis</h1>
        <div style={{ color: "#AED6F1", fontSize: 12, marginTop: 4 }}>
          Perspektive: {personaInfo?.label}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
        {/* Gesamtergebnis */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 28 }}>
          <div style={{ background: assessment.color, padding: "28px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: "#fff" }}>{weightedTotal.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>von 4.0 Punkten (gewichtet)</div>
            <div style={{
              display: "inline-block", marginTop: 12, background: "rgba(255,255,255,0.2)",
              borderRadius: 20, padding: "6px 20px", fontSize: 14, fontWeight: 700, color: "#fff",
            }}>
              {assessment.title}
            </div>
          </div>
          <div style={{ padding: "24px 32px" }}>
            <p style={{ fontSize: 15, color: "#2C3E50", lineHeight: 1.6, marginBottom: 12 }}>{assessment.text}</p>
            {assessment.killerTriggered && (
              <div style={{ background: "#FDEDEC", border: "1px solid #F5B7B1", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "#922B21", marginBottom: 12 }}>
                <strong>Killer-Dimension ausgelöst:</strong> {assessment.killerTriggered === "strategie" ? "Strategische Klarheit" : "Prozessreife"} liegt unter dem Mindestwert von 2,0.
              </div>
            )}
            <p style={{ fontSize: 14, color: "#E8720C", fontWeight: 600, lineHeight: 1.6 }}>{assessment.recommendation}</p>
          </div>
        </div>

        {/* Radar + Scores */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", padding: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RadarChart dimScores={dimScores} />
          </div>
          <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", padding: "24px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1A3A5C", marginBottom: 20 }}>Ergebnis nach Dimensionen</h3>
            {DIMENSIONS.map((d) => {
              const score = dimScores[d.id] || 0;
              const ampel = getAmpel(score);
              return (
                <div key={d.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2C3E50" }}>
                      {d.shortLabel}
                      {d.isKiller && <span style={{ fontSize: 9, color: "#E74C3C", marginLeft: 4 }}>KILLER</span>}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{score.toFixed(1)}</span>
                  </div>
                  <div style={{ height: 8, background: "#F0F2F5", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(score / 4) * 100}%`, background: ampel.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ fontSize: 10, color: ampel.color, fontWeight: 600, marginTop: 2 }}>{ampel.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gewichtungserklärung */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", padding: "28px 32px", marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1A3A5C", marginBottom: 8 }}>Wie Ihr Gesamtscore entsteht</h3>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20 }}>
            Nicht jede Dimension wiegt gleich schwer. Ohne strategische Klarheit ist jede KI-Einführung zum Scheitern verurteilt – und ohne saubere Prozesse gibt es nichts zu optimieren. Deshalb gewichten wir diese beiden Dimensionen stärker. Regulatorische Bereitschaft ist wichtig, lässt sich aber mit externer Unterstützung am schnellsten aufholen.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DIMENSIONS.map((d) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                background: "#F8F9FA", borderRadius: 6, border: "1px solid #EEE",
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 12, color: "#2C3E50", fontWeight: 500 }}>{d.shortLabel}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: d.weight > 1.0 ? "#E74C3C" : d.weight < 1.0 ? "#999" : "#2C3E50",
                }}>
                  {d.weight > 1.0 ? `+${((d.weight - 1) * 100).toFixed(0)}%` : d.weight < 1.0 ? `${((d.weight - 1) * 100).toFixed(0)}%` : "Basis"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Handlungsfelder */}
        <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 20px rgba(0,0,0,0.06)", padding: "28px 32px", marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1A3A5C", marginBottom: 20 }}>Prioritäre Handlungsfelder</h3>
          {sortedDims.filter((d) => (dimScores[d.id] || 0) < 3.0).map((d, i) => {
            const score = dimScores[d.id] || 0;
            const ampel = getAmpel(score);
            return (
              <div key={d.id} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16, padding: "12px 16px", background: i === 0 ? "#FDF2F2" : "#FAFBFC", borderRadius: 8, border: `1px solid ${i === 0 ? "#F5B7B1" : "#EEE"}` }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: ampel.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#2C3E50" }}>
                    {d.label}
                    <span style={{ fontSize: 12, color: ampel.color, marginLeft: 8 }}>{score.toFixed(1)} / 4.0</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.5 }}>{getDimDescription(d)}</p>
                </div>
              </div>
            );
          })}
          {sortedDims.filter((d) => (dimScores[d.id] || 0) < 3.0).length === 0 && (
            <p style={{ fontSize: 14, color: "#27AE60", fontWeight: 500 }}>Alle Dimensionen im grünen Bereich – starke Ausgangslage.</p>
          )}
        </div>

        {/* CTA */}
        <div style={{ background: "linear-gradient(135deg, #1A3A5C, #2E6DA4)", borderRadius: 12, padding: "36px 32px", textAlign: "center" }}>
          <h3 style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {isSolo ? "Bereit, den nächsten Schritt zu gehen?" : "Bereit für den nächsten Schritt?"}
          </h3>
          <p style={{ color: "#AED6F1", fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            {isSolo
              ? "In einem persönlichen Gespräch gehen wir Ihre Ergebnisse gemeinsam durch und entwickeln einen konkreten Fahrplan für Ihren KI-Einstieg."
              : "Der persönliche KI-Readiness-Check geht tiefer: Zwei Beratungstage, eine vollständige Scorecard und ein konkreter Maßnahmenplan für Ihr Unternehmen."
            }
          </p>
          <button style={{
            background: "#E8720C", color: "#fff", border: "none", borderRadius: 8,
            padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer",
            letterSpacing: 0.3,
          }}>
            {isSolo ? "Erstgespräch vereinbaren" : "Persönlichen Check anfragen"}
          </button>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 16 }}>
            {isSolo
              ? "Unverbindlich · 30 Minuten · Kostenlos"
              : "BAFA-förderfähig · 3.500 – 4.500 € netto · Remote oder vor Ort"
            }
          </p>
        </div>

        <div style={{ textAlign: "center", padding: "24px 0 12px", color: "#999", fontSize: 11 }}>
          {"\u00A9 2026 "}{assessment.ctaProduct}{" \u00B7 Strategie mit Weitblick"}
        </div>
      </div>
    </div>
  );
}
