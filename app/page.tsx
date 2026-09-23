import { HomePageClient } from "@/components/HomePageClient";
import { detectServerLocale } from "@/lib/server-locale";
import { isLocale, type Locale } from "@/lib/i18n";
import { getLandingReportTemplates } from "@/src/api/report-templates/server";
import type { Metadata } from "next";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const homeMetadata: Record<Locale, Metadata> = {
  en: {
    title: "YDeck — AI Agent Workspace for Companies",
    description:
      "Deploy AI agents, connect customer channels, and keep your team in control. Start with YDeck Sales Agent and Sales Operator.",
    openGraph: {
      title: "YDeck — AI Agent Workspace for Companies",
      description:
        "Your company’s workspace for AI agents—starting with sales.",
    },
  },
  ru: {
    title: "YDeck — рабочее пространство ИИ-агентов для компаний",
    description:
      "Подключайте ИИ-агентов и клиентские каналы, сохраняя контроль команды. Начните с Sales Agent и Sales Operator.",
    openGraph: {
      title: "YDeck — рабочее пространство ИИ-агентов для компаний",
      description:
        "Рабочее пространство ИИ-агентов вашей компании — начните с продаж.",
    },
  },
  uz: {
    title: "YDeck — kompaniyalar uchun AI agentlar ish maydoni",
    description:
      "AI agentlar va mijoz kanallarini ulang, jamoa nazoratini saqlang. Sales Agent va Sales Operator’dan boshlang.",
    openGraph: {
      title: "YDeck — kompaniyalar uchun AI agentlar ish maydoni",
      description:
        "Kompaniyangizning AI agentlar ish maydoni — savdodan boshlang.",
    },
  },
};

async function resolveHomeLocale(searchParams: HomePageProps["searchParams"]): Promise<Locale> {
  const params = await searchParams;
  const lang = params?.lang;
  const langParam = typeof lang === "string" ? lang : null;

  return isLocale(langParam) ? langParam : detectServerLocale(langParam);
}

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const locale = await resolveHomeLocale(searchParams);
  return homeMetadata[locale];
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const initialLocale = await resolveHomeLocale(searchParams);
  const initialReportTemplates = await getLandingReportTemplates(initialLocale);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.lang=${JSON.stringify(initialLocale)};`,
        }}
      />
      <HomePageClient
        initialLocale={initialLocale}
        initialReportTemplates={initialReportTemplates}
      />
    </>
  );
}
