import { WaitlistPageClient } from "@/components/WaitlistPageClient";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

type WaitlistPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const params = await searchParams;
  const lang = params?.lang;
  const langParam = typeof lang === "string" ? lang : null;
  const initialLocale: Locale = isLocale(langParam) ? langParam : defaultLocale;

  return <WaitlistPageClient initialLocale={initialLocale} />;
}
