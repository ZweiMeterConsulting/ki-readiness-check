import type { Metadata } from "next";
import Script from "next/script";
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

// Analytics werden nur eingebunden, wenn konfiguriert (DSGVO: Plausible ist
// cookiefrei und ohne Consent-Banner nutzbar; GA4 nur bei Bedarf setzen).
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

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

        {/* Plausible – cookiefreies, DSGVO-freundliches Funnel-Tracking */}
        {PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}

        {/* Google Analytics 4 (optional) */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
