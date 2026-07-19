import type { Metadata } from "next";
import { ScrollToTopOnLoad } from "@/components/ScrollToTopOnLoad";
import { AppProviders } from "@/src/providers/app-providers";
import "./globals.css";
import "./account.css";
import "./workspace.css";
import "./desktop-portal.css";

export const metadata: Metadata = {
  title: "YDeck | Presentation Workspace",
  description:
    "Create and manage presentations with YDeck Web and YDeck Desktop.",
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
