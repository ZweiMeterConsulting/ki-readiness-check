"use client";

import { useState, useMemo } from "react";

import type { PersonaId, Phase, Question, Dimension } from "@/lib/types";
import { colors, gradients, cardStyle, backButtonStyle, labelStyle, subtitleStyle } from "@/lib/theme";
import { DIMENSIONS, PERSONAS, SCALE_OPTIONS, TOTAL_WEIGHT, TOTAL_QUESTIONS } from "@/lib/data";
import { calcDimensionScore, calcWeightedTotal, getAmpel, getDimScore, getOverallAssessment } from "@/lib/scoring";

import Card from "@/components/ui/Card";
import GradientPage from "@/components/ui/GradientPage";
import Logo from "@/components/ui/Logo";
import ProgressBar from "@/components/ui/ProgressBar";
import PersonaIcon from "@/components/ui/PersonaIcon";
import RadarChart from "@/components/ui/RadarChart";

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

  const weightedTotal = useMemo(() => calcWeightedTotal(dimScores, DIMENSIONS, TOTAL_WEIGHT), [dimScores]);
  const assessment = useMemo(() => getOverallAssessment(weightedTotal, dimScores, persona), [weightedTotal, dimScores, persona]);

  const sortedDims = useMemo(() =>
    [...DIMENSIONS].sort((a, b) => getDimScore(dimScores, a.id) - getDimScore(dimScores, b.id)),
  [dimScores]);

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <GradientPage>
        <Logo
          height={56}
          style={{ marginBottom: 32, boxShadow: `0 2px 16px ${colors.blackOverlay15}` }}
        />
        <h1 style={{ color: colors.white, fontSize: 32, fontWeight: 700, lineHeight: 1.25, margin: "0 0 16px" }}>
          KI-Readiness-Check
        </h1>
        <p style={{ color: colors.lightBlue, fontSize: 15, lineHeight: 1.7, marginTop: 0, marginBottom: 32, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
          Finden Sie in 12 bis 15 Minuten heraus, wie bereit Sie für den Einsatz von Künstlicher Intelligenz sind. 24 Fragen, 6 Dimensionen, eine ehrliche Standortbestimmung.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {DIMENSIONS.map((d) => (
            <span key={d.id} style={{ background: colors.whiteOverlay08, border: `1px solid ${colors.whiteOverlay15}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, color: colors.lightBlueBg, fontWeight: 500 }}>
              {d.shortLabel}
            </span>
          ))}
        </div>
        <button
          onClick={() => setPhase("persona")}
          style={{ background: colors.accent, color: colors.white, border: "none", borderRadius: 8, padding: "16px 48px", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "transform 0.15s", letterSpacing: 0.3 }}
          onMouseEnter={(e) => (e.target as HTMLButtonElement).style.transform = "scale(1.04)"}
          onMouseLeave={(e) => (e.target as HTMLButtonElement).style.transform = "scale(1)"}
        >
          Check starten
        </button>
        <p style={{ color: colors.whiteOverlay35, fontSize: 11, marginTop: 24 }}>
          {"Kostenlos \u00B7 Keine Registrierung \u00B7 Sofortergebnis"}
        </p>
      </GradientPage>
    );
  }

  // ── PERSONA-AUSWAHL ──
  if (phase === "persona") {
    return (
      <GradientPage>
        <div style={{ ...labelStyle, marginBottom: 24 }}>
          Bevor es losgeht
        </div>
        <h2 style={{ color: colors.white, fontSize: 24, fontWeight: 700, lineHeight: 1.3, margin: "0 0 8px" }}>
          In welcher Rolle wollen Sie den Check nutzen?
        </h2>
        <p style={subtitleStyle}>
          Damit wir die Fragen passend auf Ihre Situation zuschneiden können.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 480, margin: "0 auto" }}>
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => { setPersona(p.id); setPhase("quiz"); }}
              style={{
                display: "flex", alignItems: "center", gap: 16, padding: "20px 24px",
                background: colors.whiteOverlay06, border: `2px solid ${colors.whiteOverlay15}`,
                borderRadius: 10, cursor: "pointer", textAlign: "left",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.whiteOverlay12; e.currentTarget.style.borderColor = colors.accent; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = colors.whiteOverlay06; e.currentTarget.style.borderColor = colors.whiteOverlay15; }}
            >
              <PersonaIcon type={p.icon} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: colors.white, marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: colors.lightBlue, lineHeight: 1.4 }}>{p.description}</div>
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => setPhase("intro")}
          style={{ ...backButtonStyle, marginTop: 24, color: colors.whiteOverlay40 }}
        >
          {"\u2190 Zurück"}
        </button>
      </GradientPage>
    );
  }

  // ── QUIZ ──
  if (phase === "quiz") {
    const globalQIndex = DIMENSIONS.slice(0, currentDim).reduce((s, d) => s + d.questions.length, 0) + currentQ;
    const isFirst = currentDim === 0 && currentQ === 0;

    return (
      <div style={{ minHeight: "100vh", background: colors.pageBg, display: "flex", flexDirection: "column" }}>
        <div style={{ background: colors.primary, padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: colors.lightBlue, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>KI-Readiness-Check</span>
          <span style={{ color: colors.lightBlue, fontSize: 12 }}>{totalAnswered} / {TOTAL_QUESTIONS}</span>
        </div>
        <ProgressBar
          percent={progress}
          height={4}
          trackColor={colors.barBg}
          gradient={`linear-gradient(90deg, ${colors.primary}, ${dim.color})`}
          borderRadius={0}
          style={{ transition: "width 0.5s ease" }}
        />
        <div style={{ display: "flex", gap: 2, padding: "16px 24px 0", overflowX: "auto" }}>
          {DIMENSIONS.map((d, i) => {
            const done = i < currentDim;
            const active = i === currentDim;
            return (
              <div key={d.id} style={{
                padding: "8px 14px", borderRadius: "6px 6px 0 0", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                background: active ? colors.white : done ? colors.successOverlay12 : colors.blackOverlay04,
                color: active ? d.color : done ? colors.success : colors.textLight,
                borderBottom: active ? `3px solid ${d.color}` : "3px solid transparent",
              }}>
                {done ? "\u2713 " : ""}{d.shortLabel}
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <Card style={{ maxWidth: 640, width: "100%", padding: "40px 36px", opacity: animating ? 0.4 : 1, transition: "opacity 0.2s" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: dim.color }} />
              <span style={{ fontSize: 12, color: dim.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5 }}>
                {dim.label}
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#888", marginBottom: 28, lineHeight: 1.5 }}>{getDimDescription(dim)}</p>
            <div style={{ fontSize: 12, color: colors.textSubtle, marginBottom: 8 }}>Frage {globalQIndex + 1} von {TOTAL_QUESTIONS}</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.primary, lineHeight: 1.5, marginBottom: 32, minHeight: 54 }}>
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
                      padding: "14px 20px", borderRadius: 8, border: `2px solid ${selected ? dim.color : colors.inputBorder}`,
                      background: selected ? `${dim.color}0D` : colors.inputBg, cursor: "pointer",
                      fontSize: 14, color: selected ? dim.color : colors.textDark, fontWeight: selected ? 600 : 400,
                      transition: "all 0.15s", textAlign: "left" as const,
                    }}
                    onMouseEnter={(e) => { if (!selected) { e.currentTarget.style.borderColor = dim.color + "66"; e.currentTarget.style.background = colors.sectionBg; } }}
                    onMouseLeave={(e) => { if (!selected) { e.currentTarget.style.borderColor = colors.inputBorder; e.currentTarget.style.background = colors.inputBg; } }}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: selected ? dim.color : colors.inputBorder, color: selected ? colors.white : colors.textLight,
                      fontSize: 13, fontWeight: 700, flexShrink: 0,
                    }}>
                      {opt.value}
                    </div>
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button onClick={goBack} style={{ ...backButtonStyle, marginTop: 24 }}>
              {isFirst ? "\u2190 Rollenauswahl ändern" : "\u2190 Vorherige Frage"}
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  const personaInfo = PERSONAS.find((p) => p.id === persona);
  const isSolo = persona === "solo";

  return (
    <div style={{ minHeight: "100vh", background: colors.pageBg }}>
      <div style={{ background: colors.primary, padding: "20px 24px", textAlign: "center" }}>
        <Logo alt={assessment.ctaProduct} style={{ marginBottom: 10 }} />
        <h1 style={{ color: colors.white, fontSize: 22, fontWeight: 700, marginTop: 4 }}>Ihr KI-Readiness-Ergebnis</h1>
        <div style={{ color: colors.lightBlue, fontSize: 12, marginTop: 4 }}>
          Perspektive: {personaInfo?.label}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 20px" }}>
        {/* Gesamtergebnis */}
        <Card style={{ overflow: "hidden", marginBottom: 28 }}>
          <div style={{ background: assessment.color, padding: "28px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: colors.white }}>{weightedTotal.toFixed(1)}</div>
            <div style={{ fontSize: 12, color: colors.whiteOverlay70, marginTop: 2 }}>von 4.0 Punkten (gewichtet)</div>
            <div style={{
              display: "inline-block", marginTop: 12, background: colors.whiteOverlay20,
              borderRadius: 20, padding: "6px 20px", fontSize: 14, fontWeight: 700, color: colors.white,
            }}>
              {assessment.title}
            </div>
          </div>
          <div style={{ padding: "24px 32px" }}>
            <p style={{ fontSize: 15, color: colors.textDark, lineHeight: 1.6, marginBottom: 12 }}>{assessment.text}</p>
            {assessment.killerTriggered && (
              <div style={{ background: colors.dangerBg, border: `1px solid ${colors.dangerBorder}`, borderRadius: 8, padding: "12px 16px", fontSize: 13, color: colors.dangerDark, marginBottom: 12 }}>
                <strong>Killer-Dimension ausgelöst:</strong> {assessment.killerTriggered === "strategie" ? "Strategische Klarheit" : "Prozessreife"} liegt unter dem Mindestwert von 2,0.
              </div>
            )}
            <p style={{ fontSize: 14, color: colors.accent, fontWeight: 600, lineHeight: 1.6 }}>{assessment.recommendation}</p>
          </div>
        </Card>

        {/* Radar + Scores */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
          <Card style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RadarChart dimScores={dimScores} />
          </Card>
          <Card style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 20 }}>Ergebnis nach Dimensionen</h3>
            {DIMENSIONS.map((d) => {
              const score = getDimScore(dimScores, d.id);
              const ampel = getAmpel(score);
              return (
                <div key={d.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: colors.textDark }}>
                      {d.shortLabel}
                      {d.isKiller && <span style={{ fontSize: 9, color: colors.danger, marginLeft: 4 }}>KILLER</span>}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{score.toFixed(1)}</span>
                  </div>
                  <ProgressBar percent={(score / 4) * 100} fillColor={ampel.color} />
                  <div style={{ fontSize: 10, color: ampel.color, fontWeight: 600, marginTop: 2 }}>{ampel.text}</div>
                </div>
              );
            })}
          </Card>
        </div>

        {/* Gewichtungserklärung */}
        <Card style={{ padding: "28px 32px", marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>Wie Ihr Gesamtscore entsteht</h3>
          <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6, marginBottom: 20 }}>
            Nicht jede Dimension wiegt gleich schwer. Ohne strategische Klarheit ist jede KI-Einführung zum Scheitern verurteilt – und ohne saubere Prozesse gibt es nichts zu optimieren. Deshalb gewichten wir diese beiden Dimensionen stärker. Regulatorische Bereitschaft ist wichtig, lässt sich aber mit externer Unterstützung am schnellsten aufholen.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DIMENSIONS.map((d) => (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 14px",
                background: colors.sectionBg, borderRadius: 6, border: `1px solid ${colors.sectionBorder}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: d.color }} />
                <span style={{ fontSize: 12, color: colors.textDark, fontWeight: 500 }}>{d.shortLabel}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, color: d.weight > 1.0 ? colors.danger : d.weight < 1.0 ? colors.textLight : colors.textDark,
                }}>
                  {d.weight > 1.0 ? `+${((d.weight - 1) * 100).toFixed(0)}%` : d.weight < 1.0 ? `${((d.weight - 1) * 100).toFixed(0)}%` : "Basis"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Handlungsfelder */}
        <Card style={{ padding: "28px 32px", marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: colors.primary, marginBottom: 20 }}>Prioritäre Handlungsfelder</h3>
          {sortedDims.filter((d) => getDimScore(dimScores, d.id) < 3.0).map((d, i) => {
            const score = getDimScore(dimScores, d.id);
            const ampel = getAmpel(score);
            return (
              <div key={d.id} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16, padding: "12px 16px", background: i === 0 ? "#FDF2F2" : colors.inputBg, borderRadius: 8, border: `1px solid ${i === 0 ? colors.dangerBorder : colors.sectionBorder}` }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: ampel.color, color: colors.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.textDark }}>
                    {d.label}
                    <span style={{ fontSize: 12, color: ampel.color, marginLeft: 8 }}>{score.toFixed(1)} / 4.0</span>
                  </div>
                  <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }}>{getDimDescription(d)}</p>
                </div>
              </div>
            );
          })}
          {sortedDims.filter((d) => getDimScore(dimScores, d.id) < 3.0).length === 0 && (
            <p style={{ fontSize: 14, color: colors.success, fontWeight: 500 }}>Alle Dimensionen im grünen Bereich – starke Ausgangslage.</p>
          )}
        </Card>

        {/* CTA */}
        <div style={{ background: gradients.cta, borderRadius: 12, padding: "36px 32px", textAlign: "center" }}>
          <h3 style={{ color: colors.white, fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            {isSolo ? "Bereit, den nächsten Schritt zu gehen?" : "Bereit für den nächsten Schritt?"}
          </h3>
          <p style={{ color: colors.lightBlue, fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
            {isSolo
              ? "In einem persönlichen Gespräch gehen wir Ihre Ergebnisse gemeinsam durch und entwickeln einen konkreten Fahrplan für Ihren KI-Einstieg."
              : "Der persönliche KI-Readiness-Check geht tiefer: Zwei Beratungstage, eine vollständige Scorecard und ein konkreter Maßnahmenplan für Ihr Unternehmen."
            }
          </p>
          <button style={{
            background: colors.accent, color: colors.white, border: "none", borderRadius: 8,
            padding: "14px 40px", fontSize: 15, fontWeight: 700, cursor: "pointer",
            letterSpacing: 0.3,
          }}>
            {isSolo ? "Erstgespräch vereinbaren" : "Persönlichen Check anfragen"}
          </button>
          <p style={{ color: colors.whiteOverlay35, fontSize: 11, marginTop: 16 }}>
            {isSolo
              ? "Unverbindlich · 30 Minuten · Kostenlos"
              : "BAFA-förderfähig · 3.500 – 4.500 € netto · Remote oder vor Ort"
            }
          </p>
        </div>

        <div style={{ textAlign: "center", padding: "24px 0 12px", color: colors.textLight, fontSize: 11 }}>
          {"\u00A9 2026 "}{assessment.ctaProduct}{" \u00B7 Strategie mit Weitblick"}
        </div>
      </div>
    </div>
  );
}
