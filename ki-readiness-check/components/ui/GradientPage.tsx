import type React from "react";
import { pageStyles } from "@/lib/theme";

interface GradientPageProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export default function GradientPage({
  children,
  maxWidth = 640,
}: GradientPageProps) {
  return (
    <div style={pageStyles.gradientPage}>
      <div style={{ ...pageStyles.centeredContainer, maxWidth }}>{children}</div>
    </div>
  );
}
