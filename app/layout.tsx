import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Pathway AI | Reach career-ready in 4 steps",
  description:
    "Pathway AI helps students improve resumes, discover career paths, build skill roadmaps, and practice interviews in one connected career readiness platform.",
  metadataBase: new URL("https://pathway-aiapp.vercel.app"),
  openGraph: {
    title: "Pathway AI | Reach career-ready in 4 steps",
    description:
      "Pathway AI helps students improve resumes, discover career paths, build skill roadmaps, and practice interviews in one connected career readiness platform.",
    url: "https://pathway-aiapp.vercel.app",
    siteName: "Pathway AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}