import type React from "react";
import { colors } from "@/lib/theme";

const iconBase: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  background: colors.whiteOverlay10,
  border: `1px solid ${colors.whiteOverlay20}`,
};

const svgProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: colors.lightBlue,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function PersonaIcon({ type }: { type: string }) {
  if (type === "solo") {
    return (
      <div style={iconBase}>
        <svg {...svgProps}>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
    );
  }
  if (type === "kmu") {
    return (
      <div style={iconBase}>
        <svg {...svgProps}>
          <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
          <path d="M9 22V12h6v10" />
          <path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01" />
        </svg>
      </div>
    );
  }
  return (
    <div style={iconBase}>
      <svg {...svgProps}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    </div>
  );
}
