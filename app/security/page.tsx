import type { Metadata } from 'next';

import { LegalPage } from '@/components/ydeck/LegalPage';
import { localeFromParam } from '@/components/ydeck/utils/localeParam';

export const metadata: Metadata = {
  title: 'Security | YDeck',
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SecurityPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const lang = params?.lang;
  const locale = localeFromParam(typeof lang === 'string' ? lang : null);

  return <LegalPage locale={locale} pageKey="security" />;
}
