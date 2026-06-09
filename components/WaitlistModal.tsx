"use client";

import { X } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";
import { defaultLocale, translations, type Locale } from "@/lib/i18n";

type WaitlistModalProps = {
  open: boolean;
  onClose: () => void;
  locale?: Locale;
};

export function WaitlistModal({ open, onClose, locale = defaultLocale }: WaitlistModalProps) {
  const copy = translations[locale].modal;

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        aria-modal="true"
        className="waitlist-modal"
        role="dialog"
        aria-labelledby="waitlist-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" onClick={onClose} aria-label={copy.close}>
          <X size={20} />
        </button>
        <div className="modal-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="waitlist-modal-title">{copy.title}</h2>
          <p>{copy.text}</p>
        </div>
        <WaitlistForm compact locale={locale} />
      </section>
    </div>
  );
}
