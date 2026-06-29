import { WaitlistPageClient } from "@/components/WaitlistPageClient";
import { isLocale, type Locale } from "@/lib/i18n";
import { detectServerLocale } from "@/lib/server-locale";

type WaitlistPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const params = await searchParams;
  const lang = params?.lang;
  const langParam = typeof lang === "string" ? lang : null;
  const initialLocale: Locale = isLocale(langParam) ? langParam : await detectServerLocale(langParam);

  return <WaitlistPageClient initialLocale={initialLocale} />;
}
