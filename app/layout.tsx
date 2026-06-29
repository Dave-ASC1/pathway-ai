import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathway AI | A One Stop Shop to Your Career Goals",
  description:
    "Pathway AI helps students improve resumes, discover career paths, build skill roadmaps, and practice interviews in one connected career readiness platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}