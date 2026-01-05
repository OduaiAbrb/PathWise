import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
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
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
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
      </body>
    </html>
  );
}
