import type React from "react";

// ── Color Palette ──────────────────────────────────────
export const colors = {
  primary: "#1A3A5C",
  primaryDark: "#0D1B2A",
  primaryMid: "#2E6DA4",
  accent: "#E8720C",
  textDark: "#2C3E50",
  textMuted: "#666",
  textLight: "#999",
  textSubtle: "#AAA",
  lightBlue: "#AED6F1",
  lightBlueBg: "#D6EAF8",
  success: "#27AE60",
  warning: "#F39C12",
  warningDark: "#E67E22",
  danger: "#E74C3C",
  dangerDark: "#922B21",
  dangerBg: "#FDEDEC",
  dangerBorder: "#F5B7B1",
  pageBg: "#F0F2F5",
  cardBg: "#fff",
  barBg: "#D5D8DC",
  inputBg: "#FAFBFC",
  inputBorder: "#E5E8EC",
  sectionBg: "#F8F9FA",
  sectionBorder: "#EEE",
  white: "#fff",
  whiteOverlay06: "rgba(255,255,255,0.06)",
  whiteOverlay08: "rgba(255,255,255,0.08)",
  whiteOverlay10: "rgba(255,255,255,0.1)",
  whiteOverlay12: "rgba(255,255,255,0.12)",
  whiteOverlay15: "rgba(255,255,255,0.15)",
  whiteOverlay20: "rgba(255,255,255,0.2)",
  whiteOverlay35: "rgba(255,255,255,0.35)",
  whiteOverlay40: "rgba(255,255,255,0.4)",
  whiteOverlay70: "rgba(255,255,255,0.7)",
  blackOverlay04: "rgba(0,0,0,0.04)",
  blackOverlay06: "rgba(0,0,0,0.06)",
  blackOverlay15: "rgba(0,0,0,0.15)",
  successOverlay12: "rgba(39,174,96,0.12)",
} as const;

export const gradients = {
  page: `linear-gradient(170deg, ${colors.primaryDark} 0%, ${colors.primary} 50%, ${colors.primaryMid} 100%)`,
  cta: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryMid})`,
} as const;

// ── Reusable Style Objects ─────────────────────────────
export const pageStyles: Record<string, React.CSSProperties> = {
  gradientPage: {
    minHeight: "100vh",
    background: gradients.page,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  centeredContainer: {
    maxWidth: 640,
    width: "100%",
    textAlign: "center",
  },
};

export const cardStyle: React.CSSProperties = {
  background: colors.cardBg,
  borderRadius: 12,
  boxShadow: `0 2px 20px ${colors.blackOverlay06}`,
};

export const backButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: colors.textLight,
  fontSize: 13,
  cursor: "pointer",
  padding: "4px 0",
};

export const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: 3,
  color: colors.lightBlue,
  textTransform: "uppercase",
  fontWeight: 700,
};

export const subtitleStyle: React.CSSProperties = {
  color: colors.lightBlue,
  fontSize: 14,
  lineHeight: 1.6,
  margin: "0 0 32px",
};
