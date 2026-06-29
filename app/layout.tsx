import type { Metadata } from "next";
import { ScrollToTopOnLoad } from "@/components/ScrollToTopOnLoad";
import "./globals.css";

export const metadata: Metadata = {
  title: "YDeck | Private AI Presentation Agent",
  description:
    "Create pitch decks, business proposals, training slides, and lessons with a private AI presentation agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ScrollToTopOnLoad />
        {children}
      </body>
    </html>
  );
}
