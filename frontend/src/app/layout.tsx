import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/responsive.css";
import "../styles/rtl.css";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { I18nProvider } from "@/i18n";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "PathWise AI | Transform Job Descriptions into Learning Roadmaps",
  description:
    "AI-powered career acceleration platform that transforms any job description into a personalized, actionable learning roadmap.",
  keywords: [
    "career development",
    "learning roadmap",
    "job skills",
    "tech career",
    "AI learning",
    "skill gap analysis",
  ],
  authors: [{ name: "PathWise AI" }],
  openGraph: {
    title: "PathWise AI | Transform Job Descriptions into Learning Roadmaps",
    description:
      "AI-powered career acceleration platform that transforms any job description into a personalized, actionable learning roadmap.",
    type: "website",
    locale: "en_US",
    siteName: "PathWise AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathWise AI | Transform Job Descriptions into Learning Roadmaps",
    description:
      "AI-powered career acceleration platform that transforms any job description into a personalized, actionable learning roadmap.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PathWise" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <I18nProvider>
          <ThemeProvider>
            <Providers>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "!bg-dark-800 !text-dark-100 !border !border-dark-700",
                  duration: 4000,
                }}
              />
            </Providers>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
