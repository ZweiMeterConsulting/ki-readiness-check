import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KI-Readiness-Check · ZweiMeter.Consulting",
  description:
    "Finden Sie in 12–15 Minuten heraus, wie bereit Ihr Unternehmen für den Einsatz von Künstlicher Intelligenz ist. 24 Fragen, 6 Dimensionen, eine ehrliche Standortbestimmung.",
  openGraph: {
    title: "KI-Readiness-Check · ZweiMeter.Consulting",
    description:
      "24 Fragen, 6 Dimensionen, eine ehrliche Standortbestimmung – kostenlos und ohne Registrierung.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "'DM Sans', sans-serif",
          WebkitFontSmoothing: "antialiased",
          boxSizing: "border-box",
        }}
      >
        {children}
      </body>
    </html>
  );
}
