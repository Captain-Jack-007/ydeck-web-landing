import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Check, LockKeyhole } from "lucide-react";
import { WaitlistForm } from "@/components/WaitlistForm";

const benefits = [
  "Early access",
  "Free pilot testing",
  "Private agent demo",
  "Custom feedback session",
  "Priority access to new templates",
];

export default function WaitlistPage() {
  return (
    <main className="waitlist-page">
      <div className="waitlist-topbar">
        <Link className="back-link" href="/">
          <ArrowLeft size={18} /> Back to landing page
        </Link>
      </div>
      <section className="waitlist-hero">
        <div className="waitlist-intro">
          <Image src="/ydeck.png" alt="YDeck logo" width={76} height={97} priority />
          <p className="eyebrow"><BadgeCheck size={16} /> Pilot program</p>
          <h1>Request early access to YDeck</h1>
          <p>
            Join selected founders, educators, consultants, companies, and organizations testing the
            private AI presentation agent before public launch.
          </p>
          <div className="benefit-list">
            {benefits.map((benefit) => (
              <span key={benefit}><Check size={16} /> {benefit}</span>
            ))}
          </div>
          <p className="trust-line">
            <LockKeyhole size={17} /> Private Mode keeps files and prompts on your own device.
          </p>
        </div>
        <div className="pilot-form-shell dedicated">
          <WaitlistForm />
        </div>
      </section>
    </main>
  );
}
