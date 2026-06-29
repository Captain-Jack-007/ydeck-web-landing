"use client";

import { useEffect, useState } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { YDeckPage } from "@/ydeck-landing-page/src/YDeckPage";
import type { Locale as YDeckLocale } from "@/ydeck-landing-page/src/types";

type HomeProps = {
  initialLocale?: Locale;
};

function toWaitlistLocale(locale: YDeckLocale): Locale {
  return isLocale(locale) ? locale : defaultLocale;
}

export function HomePageClient({ initialLocale = defaultLocale }: HomeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLocale, setModalLocale] = useState<Locale>(initialLocale);

  useEffect(() => {
    document.body.classList.add("ydeck-body");

    return () => {
      document.body.classList.remove("ydeck-body");
    };
  }, []);

  return (
    <>
      <YDeckPage
        onJoinWaitlist={(locale) => {
          setModalLocale(toWaitlistLocale(locale));
          setModalOpen(true);
        }}
      />
      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} locale={modalLocale} />
    </>
  );
}
