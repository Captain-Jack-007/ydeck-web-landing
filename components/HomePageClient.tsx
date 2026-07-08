"use client";

import { useEffect, useState } from "react";
import { WaitlistModal } from "@/components/WaitlistModal";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";
import { YDeckPage } from "@/components/ydeck/YDeckPage";
import type { Locale as YDeckLocale } from "@/components/ydeck/types";

type HomeProps = {
  initialLocale?: YDeckLocale;
};

function toWaitlistLocale(locale: YDeckLocale): Locale {
  return isLocale(locale) ? locale : defaultLocale;
}

export function HomePageClient({ initialLocale = defaultLocale }: HomeProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLocale, setModalLocale] = useState<Locale>(
    toWaitlistLocale(initialLocale)
  );

  useEffect(() => {
    document.body.classList.add("ydeck-body");

    return () => {
      document.body.classList.remove("ydeck-body");
    };
  }, []);

  return (
    <>
      <YDeckPage
        initialLocale={initialLocale}
        onJoinWaitlist={(locale) => {
          setModalLocale(toWaitlistLocale(locale));
          setModalOpen(true);
        }}
      />
      <WaitlistModal open={modalOpen} onClose={() => setModalOpen(false)} locale={modalLocale} />
    </>
  );
}
