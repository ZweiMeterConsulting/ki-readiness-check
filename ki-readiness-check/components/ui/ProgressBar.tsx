import type React from "react";
import { colors } from "@/lib/theme";

interface ProgressBarProps {
  percent: number;
  height?: number;
  trackColor?: string;
  fillColor?: string;
  gradient?: string;
  borderRadius?: number;
  style?: React.CSSProperties;
}

export default function ProgressBar({
  percent,
  height = 8,
  trackColor = colors.pageBg,
  fillColor,
  gradient,
  borderRadius = 4,
  style,
}: ProgressBarProps) {
  const fillStyle: React.CSSProperties = {
    height: "100%",
    width: `${percent}%`,
    background: gradient ?? fillColor ?? colors.primary,
    borderRadius,
    transition: "width 0.8s ease",
  };

  return (
    <div
      style={{
        height,
        background: trackColor,
        borderRadius,
        overflow: "hidden",
        ...style,
      }}
    >
      <div style={fillStyle} />
    </div>
  );
}
