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
    title: "YDeck — Private AI for Recurring Enterprise Reporting",
    description:
      "Automate recurring management reports, learn reporting rules, and build evidence-linked decision memory for a private company brain.",
    openGraph: {
      title: "YDeck — Private AI for Recurring Enterprise Reporting",
      description:
        "YDeck Private Reporting Agent helps teams turn recurring reports, source data, templates, and review rules into reusable reporting memory.",
    },
  },
  ru: {
    title: "YDeck — приватный ИИ для регулярной корпоративной отчетности",
    description:
      "Автоматизируйте регулярные управленческие отчеты, изучайте правила отчетности и формируйте память решений с привязкой к источникам для приватного корпоративного мозга.",
    openGraph: {
      title: "YDeck — приватный ИИ для регулярной корпоративной отчетности",
      description:
        "YDeck Private Reporting Agent помогает превращать повторяющиеся отчеты, исходные данные, шаблоны и правила проверки в переиспользуемую память отчетности.",
    },
  },
  uz: {
    title: "YDeck — takroriy korporativ hisobotlar uchun maxfiy AI",
    description:
      "Takroriy boshqaruv hisobotlarini avtomatlashtiring, hisobot qoidalarini o‘rganing va manba bilan bog‘langan qarorlar xotirasini maxfiy korporativ miya uchun yarating.",
    openGraph: {
      title: "YDeck — takroriy korporativ hisobotlar uchun maxfiy AI",
      description:
        "YDeck maxfiy hisobot agenti takroriy hisobotlar, manba ma’lumotlari, shablonlar va tekshiruv qoidalarini qayta ishlatiladigan hisobot xotirasiga aylantirishga yordam beradi.",
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
