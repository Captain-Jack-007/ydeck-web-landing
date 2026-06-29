import { HomePageClient } from "@/components/HomePageClient";
import { detectServerLocale } from "@/lib/server-locale";

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const lang = params?.lang;
  const langParam = typeof lang === "string" ? lang : null;
  const initialLocale = await detectServerLocale(langParam);

  return <HomePageClient initialLocale={initialLocale} />;
}
