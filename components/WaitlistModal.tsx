"use client";

import { X } from "lucide-react";
import { WaitlistForm } from "./WaitlistForm";

type WaitlistModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WaitlistModal({ open, onClose }: WaitlistModalProps) {
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
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close waitlist modal">
          <X size={20} />
        </button>
        <div className="modal-copy">
          <p className="eyebrow">Pilot access</p>
          <h2 id="waitlist-modal-title">Join the YDeck Pilot Program</h2>
          <p>
            Selected founders, educators, consultants, companies, and organizations will get early access,
            private agent demos, and a custom feedback session.
          </p>
        </div>
        <WaitlistForm compact />
      </section>
    </div>
  );
}
