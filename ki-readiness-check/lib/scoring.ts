import type { Dimension, Assessment, PersonaId, Ampel } from "./types";
import { colors } from "./theme";

export function calcDimensionScore(
  answers: Record<string, number>,
  dim: Dimension
): number {
  const vals = dim.questions.map((q) => answers[q.id]).filter(Boolean);
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function calcWeightedTotal(
  dimScores: Record<string, number>,
  dimensions: Dimension[],
  totalWeight: number
): number {
  let weightedSum = 0;
  dimensions.forEach((d) => {
    weightedSum += (dimScores[d.id] || 0) * d.weight;
  });
  return weightedSum / totalWeight;
}

export function getAmpel(score: number): Ampel {
  if (score < 2.0)
    return {
      color: colors.danger,
      label: "Rot",
      text: "Erheblicher Handlungsbedarf",
    };
  if (score < 3.0)
    return {
      color: colors.warning,
      label: "Gelb",
      text: "Gezielte Maßnahmen empfohlen",
    };
  return {
    color: colors.success,
    label: "Grün",
    text: "Gute Voraussetzungen",
  };
}

export function getDimScore(
  dimScores: Record<string, number>,
  dimId: string
): number {
  return dimScores[dimId] || 0;
}

export function getOverallAssessment(
  weightedScore: number,
  dimScores: Record<string, number>,
  persona: PersonaId | null
): Assessment {
  const strategieScore = getDimScore(dimScores, "strategie");
  const prozesseScore = getDimScore(dimScores, "prozesse");
  const isSolo = persona === "solo";
  const ctaProduct = isSolo ? "zweimeter.online" : "ZweiMeter.Consulting";

  if (strategieScore < 2.0) {
    return {
      level: 1,
      title: "Nicht bereit",
      color: colors.danger,
      text: isSolo
        ? "Ihre strategische Klarheit liegt unter dem Mindestwert. Ohne ein klares Warum und Wofür ist jeder KI-Einsatz zum Scheitern verurteilt."
        : "Ihre strategische Klarheit liegt unter dem Mindestwert. Ohne ein klares Warum und Wofür ist jede KI-Einführung zum Scheitern verurteilt.",
      recommendation: isSolo
        ? "Empfehlung: Klären Sie zuerst Ihre Ziele. Ein unverbindliches Erstgespräch kann hier den entscheidenden Impuls setzen."
        : "Empfehlung: Klären Sie zuerst Ihre strategischen Ziele. Ein Strategisches Erstgespräch kann hier den entscheidenden Impuls setzen.",
      killerTriggered: "strategie",
      ctaProduct,
    };
  }

  let effectiveScore = weightedScore;
  let downgraded = false;
  if (prozesseScore < 2.0) {
    effectiveScore = Math.min(effectiveScore, 1.99);
    downgraded = true;
  }

  if (effectiveScore < 2.0) {
    return {
      level: 1,
      title: "Nicht bereit",
      color: colors.danger,
      text: downgraded
        ? isSolo
          ? "Ihre Arbeitsabläufe sind noch nicht ausreichend strukturiert. Ohne klare Abläufe gibt es nichts, was KI sinnvoll unterstützen könnte."
          : "Ihre Prozessreife liegt unter dem Mindestwert. Ohne dokumentierte und standardisierte Abläufe gibt es nichts, was KI sinnvoll optimieren könnte."
        : "Grundlegende Voraussetzungen müssen zuerst geschaffen werden.",
      recommendation: isSolo
        ? "Empfehlung: Strukturieren Sie zuerst Ihre Abläufe, bevor Sie in KI investieren."
        : "Empfehlung: Starten Sie mit einer Digitalisierungs-Roadmap, bevor Sie in KI investieren.",
      killerTriggered: downgraded ? "prozesse" : null,
      ctaProduct,
    };
  }

  if (effectiveScore < 2.5) {
    return {
      level: 2,
      title: "Bedingt bereit",
      color: colors.warningDark,
      text: "Einzelne Bereiche zeigen Potenzial, aber zentrale Lücken bremsen noch.",
      recommendation: isSolo
        ? "Empfehlung: Gezielte Vorbereitung in den schwächsten Bereichen. Ein persönliches Gespräch hilft, die konkreten nächsten Schritte zu definieren."
        : "Empfehlung: Gezielte Vorbereitung in den schwächsten Dimensionen. Der persönliche KI-Readiness-Check hilft, die konkreten nächsten Schritte zu definieren.",
      ctaProduct,
    };
  }

  if (effectiveScore < 3.0) {
    return {
      level: 3,
      title: "Weitgehend bereit",
      color: colors.warning,
      text: "Solide Basis vorhanden, punktueller Nachholbedarf in einzelnen Bereichen.",
      recommendation: isSolo
        ? "Empfehlung: Ein gezieltes Beratungsgespräch identifiziert die verbleibenden Lücken und gibt Ihnen einen klaren Fahrplan."
        : "Empfehlung: Der persönliche KI-Readiness-Check identifiziert die verbleibenden Lücken und gibt Ihnen einen klaren Maßnahmenplan.",
      ctaProduct,
    };
  }

  return {
    level: 4,
    title: "Bereit",
    color: colors.success,
    text: "Starke Ausgangslage für einen strukturierten KI-Einsatz.",
    recommendation: isSolo
      ? "Empfehlung: Legen Sie los! Ein Beratungsgespräch hilft, die richtigen KI-Werkzeuge für Ihren Arbeitsalltag zu identifizieren."
      : "Empfehlung: Steigen Sie direkt in die KI-Strategieberatung ein, um Ihre Anwendungsfälle zu priorisieren und das erste Pilotprojekt aufzusetzen.",
    ctaProduct,
  };
}
