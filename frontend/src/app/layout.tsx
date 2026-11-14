import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InternGuard | Evidence before you apply",
  description: "Explainable risk assessment for job and internship listings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
