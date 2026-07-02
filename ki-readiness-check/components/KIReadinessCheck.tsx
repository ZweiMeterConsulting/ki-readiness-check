"use client";

import { useState, useMemo } from "react";
import {
  type PersonaId,
  type Question,
  type Dimension,
  PERSONAS,
  DIMENSIONS,
  SCALE_OPTIONS,
  TOTAL_QUESTIONS,
  calcDimensionScore,
  calcWeightedTotal,
  getAmpel,
  getOverallAssessment,
} from "@/lib/scoring";

type Phase = "intro" | "persona" | "quiz" | "result";

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
