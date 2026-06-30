import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Pathway AI | A One Stop Shop to Your Career Goals",
  description:
    "Pathway AI helps students improve resumes, discover career paths, build skill roadmaps, and practice interviews in one connected career readiness platform.",
  metadataBase: new URL("https://pathway-aiapp.vercel.app"),
  openGraph: {
    title: "Pathway AI | A One Stop Shop to Your Career Goals",
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
      <body>{children}</body>
    </html>
  );
}