import type { Metadata } from "next";
import { ScrollToTopOnLoad } from "@/components/ScrollToTopOnLoad";
import { AppProviders } from "@/src/providers/app-providers";
import "./globals.css";
import "./account.css";
import "./workspace.css";
import "./desktop-portal.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ydeck.app"),
  title: "YDeck — AI Agent Workspace for Companies",
  description:
    "Deploy AI agents, connect customer channels, and keep your team in control. Start with YDeck Sales Agent and Sales Operator.",
  openGraph: {
    title: "YDeck — AI Agent Workspace for Companies",
    description:
      "Your company’s workspace for AI agents—starting with sales.",
    images: [
      {
        url: "/ydeck.png",
        width: 360,
        height: 360,
        alt: "YDeck AI Agent Workspace logo",
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
