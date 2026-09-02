// PDF-Vorlage für den KI-Readiness-Report.
// Wird serverseitig mit @react-pdf/renderer gerendert (keine Browser-Engine nötig).

import React from "react";
import {
  Document, Page, Text, View, StyleSheet, Image, Svg, Path, Line, Circle,
  Text as SvgText, Link,
} from "@react-pdf/renderer";
import { DIMENSIONS, getAmpel, CALENDLY_URL } from "@/lib/scoring";
import type { ReportResult } from "@/lib/scoring";

export interface ReportContact {
  name: string;
  company?: string;
  email: string;
}

interface Props {
  result: ReportResult;
  contact: ReportContact;
  /** Logo als data:-URL oder Buffer; optional */
  logo?: string | Buffer;
  createdAt: Date;
}

const NAVY = "#1A3A5C";
const ORANGE = "#E8720C";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 10, color: "#2C3E50", paddingTop: 36, paddingBottom: 48, paddingHorizontal: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#D5D8DC" },
  logo: { height: 30, width: 120, objectFit: "contain" },
  headerMeta: { fontSize: 8, color: "#888", textAlign: "right" },
  h1: { fontSize: 20, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  sub: { fontSize: 10, color: "#666", marginBottom: 14 },
  scoreBox: { borderRadius: 6, padding: 16, marginBottom: 14, flexDirection: "row", alignItems: "center" },
  scoreBig: { fontSize: 34, fontFamily: "Helvetica-Bold", color: "#fff", width: 90 },
  scoreTitle: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#fff" },
  scoreSub: { fontSize: 8, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  card: { borderWidth: 1, borderColor: "#E5E8EC", borderRadius: 6, padding: 12, marginBottom: 12 },
  h3: { fontSize: 11, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 8 },
  p: { fontSize: 9.5, lineHeight: 1.5, marginBottom: 6 },
  reco: { fontSize: 9.5, lineHeight: 1.5, color: ORANGE, fontFamily: "Helvetica-Bold" },
  killer: { backgroundColor: "#FDEDEC", borderWidth: 1, borderColor: "#F5B7B1", borderRadius: 4, padding: 8, fontSize: 9, color: "#922B21", marginBottom: 6 },
  row2: { flexDirection: "row", gap: 12, marginBottom: 12 },
  dimRow: { marginBottom: 7 },
  dimHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  dimLabel: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  bar: { height: 6, backgroundColor: "#F0F2F5", borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  ampel: { fontSize: 7.5, marginTop: 1 },
  action: { flexDirection: "row", gap: 10, marginBottom: 8, padding: 8, backgroundColor: "#FAFBFC", borderRadius: 4, borderWidth: 1, borderColor: "#EEE" },
  actionNum: { width: 20, height: 20, borderRadius: 10, color: "#fff", fontSize: 10, fontFamily: "Helvetica-Bold", textAlign: "center", paddingTop: 4 },
  cta: { backgroundColor: NAVY, borderRadius: 6, padding: 14, marginTop: 4 },
  ctaH: { color: "#fff", fontSize: 12, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  ctaP: { color: "#AED6F1", fontSize: 9, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 7.5, color: "#999", textAlign: "center" },
});

function RadarPdf({ dimScores }: { dimScores: Record<string, number> }) {
  const cx = 130, cy = 130, maxR = 90, n = DIMENSIONS.length;
  const polar = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = (v / 4) * maxR;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const ring = (lvl: number) =>
    Array.from({ length: n }, (_, i) => polar(i, lvl)).map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  const pts = DIMENSIONS.map((d, i) => polar(i, dimScores[d.id] || 0));
  const dataPath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  return (
    <Svg width={260} height={260} viewBox="0 0 260 260">
      {[1, 2, 3, 4].map((l) => (
        <Path key={l} d={ring(l)} fill="none" stroke="#D5D8DC" strokeWidth={l === 2 ? 1.5 : 0.7} strokeDasharray={l === 2 ? "4,3" : undefined} />
      ))}
      {DIMENSIONS.map((d, i) => { const e = polar(i, 4); return <Line key={d.id} x1={cx} y1={cy} x2={e.x} y2={e.y} stroke="#D5D8DC" strokeWidth={0.7} />; })}
      <Path d={dataPath} fill={NAVY} fillOpacity={0.18} stroke={NAVY} strokeWidth={2} />
      {pts.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={DIMENSIONS[i].color} stroke="#fff" strokeWidth={1.5} />)}
      {DIMENSIONS.map((d, i) => {
        const lp = polar(i, 4.9);
        return (
          <SvgText key={d.id} x={lp.x} y={lp.y + 3} textAnchor="middle" style={{ fontSize: 8, fontFamily: "Helvetica-Bold", fill: d.color }}>
            {d.shortLabel}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export function ReportDocument({ result, contact, logo, createdAt }: Props) {
  const { assessment, dimScores, weightedTotal, actionFields, personaLabel, persona } = result;
  const isSolo = persona === "solo";
  const dateStr = createdAt.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const who = contact.company ? `${contact.name} · ${contact.company}` : contact.name;

  return (
    <Document title="KI-Readiness-Report" author={assessment.ctaProduct} subject={`KI-Readiness-Check für ${who}`}>
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {logo ? <Image src={logo} style={s.logo} /> : <Text style={{ fontFamily: "Helvetica-Bold", color: NAVY }}>{assessment.ctaProduct}</Text>}
          <View>
            <Text style={s.headerMeta}>KI-Readiness-Check · {dateStr}</Text>
            <Text style={s.headerMeta}>{who}</Text>
          </View>
        </View>

        <Text style={s.h1}>Ihr KI-Readiness-Ergebnis</Text>
        <Text style={s.sub}>Perspektive: {personaLabel}</Text>

        <View style={[s.scoreBox, { backgroundColor: assessment.color }]}>
          <Text style={s.scoreBig}>{weightedTotal.toFixed(1)}</Text>
          <View>
            <Text style={s.scoreTitle}>{assessment.title}</Text>
            <Text style={s.scoreSub}>von 4,0 Punkten (gewichtet über 6 Dimensionen)</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.p}>{assessment.text}</Text>
          {assessment.killerTriggered && (
            <Text style={s.killer}>
              Killer-Dimension ausgelöst: {assessment.killerTriggered === "strategie" ? "Strategische Klarheit" : "Prozessreife"} liegt unter dem Mindestwert von 2,0.
            </Text>
          )}
          <Text style={s.reco}>{assessment.recommendation}</Text>
          {assessment.level === 1 && (
            <Link src={CALENDLY_URL} style={{ marginTop: 8, fontSize: 9.5, color: "#fff", backgroundColor: NAVY, padding: "6 10", borderRadius: 4, alignSelf: "flex-start", textDecoration: "none", fontFamily: "Helvetica-Bold" }}>
              Strategisches Erstgespräch buchen (30 Minuten, kostenlos): calendly.com/zweimeterconsulting
            </Link>
          )}
        </View>

        <View style={s.row2}>
          <View style={[s.card, { width: "48%", alignItems: "center", justifyContent: "center" }]}>
            <RadarPdf dimScores={dimScores} />
          </View>
          <View style={[s.card, { width: "52%" }]}>
            <Text style={s.h3}>Ergebnis nach Dimensionen</Text>
            {DIMENSIONS.map((d) => {
              const score = dimScores[d.id] || 0;
              const ampel = getAmpel(score);
              return (
                <View key={d.id} style={s.dimRow}>
                  <View style={s.dimHead}>
                    <Text style={s.dimLabel}>{d.shortLabel}{d.isKiller ? "  (Killer)" : ""}</Text>
                    <Text style={[s.dimLabel, { color: d.color }]}>{score.toFixed(1)}</Text>
                  </View>
                  <View style={s.bar}><View style={[s.barFill, { width: `${(score / 4) * 100}%`, backgroundColor: ampel.color }]} /></View>
                  <Text style={[s.ampel, { color: ampel.color }]}>{ampel.text}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={s.card} wrap={false}>
          <Text style={s.h3}>Wie Ihr Gesamtscore entsteht</Text>
          <Text style={s.p}>
            Nicht jede Dimension wiegt gleich schwer. Strategie (+50 %) und Prozesse (+30 %) sind K.O.-Kriterien: Liegt eine davon unter 2,0, wird das Gesamtergebnis auf „Nicht bereit“ gesetzt. Regulatorik zählt mit −20 %, weil sie sich mit externer Unterstützung am schnellsten aufholen lässt.
          </Text>
        </View>

        <View style={s.card} minPresenceAhead={140}>
          <Text style={s.h3}>Prioritäre Handlungsfelder</Text>
          {actionFields.length === 0 && (
            <Text style={[s.p, { color: "#27AE60" }]}>Alle Dimensionen im grünen Bereich – starke Ausgangslage.</Text>
          )}
          {actionFields.map((d, i) => {
            const score = dimScores[d.id] || 0;
            const ampel = getAmpel(score);
            return (
              <View key={d.id} style={s.action} wrap={false}>
                <Text style={[s.actionNum, { backgroundColor: ampel.color }]}>{i + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold" }}>
                    {d.label}  <Text style={{ color: ampel.color, fontFamily: "Helvetica" }}>{score.toFixed(1)} / 4,0</Text>
                  </Text>
                  <Text style={[s.p, { color: "#666", marginTop: 2, marginBottom: 0 }]}>{d.description[persona]}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={s.card} wrap={false}>
          <Text style={s.h3}>Ihre Antworten im Detail</Text>
          {DIMENSIONS.map((d) => (
            <View key={d.id} style={{ marginBottom: 6 }}>
              <Text style={[s.dimLabel, { color: d.color, marginBottom: 2 }]}>{d.label}</Text>
              {d.questions.map((q) => (
                <View key={q.id} style={{ flexDirection: "row", marginBottom: 1.5 }}>
                  <Text style={{ width: 16, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: NAVY }}>{result.answers?.[q.id] ?? "–"}</Text>
                  <Text style={{ flex: 1, fontSize: 8.5, color: "#555", lineHeight: 1.35 }}>{q.text[persona]}</Text>
                </View>
              ))}
            </View>
          ))}
          <Text style={{ fontSize: 7.5, color: "#999", marginTop: 4 }}>Skala: 1 = Trifft nicht zu · 2 = Trifft eher nicht zu · 3 = Trifft eher zu · 4 = Trifft voll zu</Text>
        </View>

        <View style={s.cta} wrap={false}>
          <Text style={s.ctaH}>{isSolo ? "Bereit, den nächsten Schritt zu gehen?" : "Bereit für den nächsten Schritt?"}</Text>
          <Text style={s.ctaP}>
            {isSolo
              ? "In einem persönlichen Gespräch gehen wir Ihre Ergebnisse gemeinsam durch und entwickeln einen konkreten Fahrplan für Ihren KI-Einstieg. Unverbindlich · 30 Minuten · Kostenlos."
              : "Der persönliche KI-Readiness-Check geht tiefer: Zwei Beratungstage, eine vollständige Scorecard und ein konkreter Maßnahmenplan für Ihr Unternehmen. BAFA-förderfähig · 3.500 – 4.500 € netto · Remote oder vor Ort."}
          </Text>
          <Link src={CALENDLY_URL} style={{ marginTop: 8, fontSize: 9.5, color: ORANGE, fontFamily: "Helvetica-Bold", textDecoration: "none" }}>
            Termin buchen: {CALENDLY_URL}
          </Link>
        </View>

        <Text style={s.footer} fixed render={({ pageNumber, totalPages }) =>
          `© ${createdAt.getFullYear()} ${assessment.ctaProduct} · Strategie mit Weitblick · Seite ${pageNumber} von ${totalPages}`
        } />
      </Page>
    </Document>
  );
}
