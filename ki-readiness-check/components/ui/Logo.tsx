import type React from "react";
import { colors } from "@/lib/theme";

interface LogoProps {
  height?: number;
  alt?: string;
  style?: React.CSSProperties;
}

const logoContainerBase: React.CSSProperties = {
  display: "inline-block",
  background: colors.white,
  padding: "6px 12px",
};

export default function Logo({
  height = 28,
  alt = "ZweiMeter.Consulting",
  style,
}: LogoProps) {
  return (
    <div
      style={{
        ...logoContainerBase,
        borderRadius: height > 40 ? 10 : 6,
        padding: height > 40 ? "12px 20px" : "6px 12px",
        ...style,
      }}
    >
      <img
        src="/logo.png"
        alt={alt}
        style={{ height, display: "block" }}
      />
    </div>
  );
}
