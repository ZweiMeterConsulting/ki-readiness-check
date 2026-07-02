import type React from "react";
import { cardStyle } from "@/lib/theme";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ children, style }: CardProps) {
  return <div style={{ ...cardStyle, ...style }}>{children}</div>;
}
