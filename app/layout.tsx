import type { Metadata } from "next";
import { ScrollToTopOnLoad } from "@/components/ScrollToTopOnLoad";
import { AppProviders } from "@/src/providers/app-providers";
import "./globals.css";
import "./account.css";
import "./workspace.css";
import "./desktop-portal.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ydeck.app"),
  title: "YDeck — Private AI for Recurring Enterprise Reporting",
  description:
    "Automate recurring management reports, learn reporting rules, and build evidence-linked decision memory for a private company brain.",
  openGraph: {
    title: "YDeck — Private AI for Recurring Enterprise Reporting",
    description:
      "YDeck Private Reporting Agent helps teams turn recurring reports, source data, templates, and review rules into reusable reporting memory.",
    images: [
      {
        url: "/ydeck.png",
        width: 360,
        height: 360,
        alt: "YDeck Private Reporting Agent logo",
      },
    ],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png", sizes: "360x360" }],
    apple: [{ url: "/favicon.png", type: "image/png", sizes: "360x360" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
        <AppProviders>
          <ScrollToTopOnLoad />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
