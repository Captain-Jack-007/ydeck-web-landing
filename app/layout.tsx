import type { Metadata } from "next";
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
      <body>{children}</body>
    </html>
  );
}
