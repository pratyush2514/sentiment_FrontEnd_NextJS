import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { buildThemeBootstrapScript, getThemeColor } from "@/lib/theme";

export const metadata: Metadata = {
  title: "PulseBoard — Conversational Intelligence for Slack",
  description:
    "Monitor emotional dynamics, detect escalation risks, and surface key decisions across every client channel — before frustration becomes a complaint.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="system"
      data-resolved-theme="light"
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content={getThemeColor("light")} />
        <link
          rel="preload"
          href="/fonts/SatoshiVariable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: buildThemeBootstrapScript() }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
