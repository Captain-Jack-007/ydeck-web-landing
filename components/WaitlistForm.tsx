"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { defaultLocale, translations, type Locale } from "@/lib/i18n";

type WaitlistFormProps = {
  compact?: boolean;
  locale?: Locale;
};

export function WaitlistForm({ compact = false, locale = defaultLocale }: WaitlistFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const copy = translations[locale].waitlistForm;
  const [mode, setMode] = useState<string>(copy.modes[2]);
  const [mobileStep, setMobileStep] = useState(1);

  useEffect(() => {
    setMode(copy.modes[2]);
  }, [copy.modes]);

  const buttonText = useMemo(
    () => (submitted ? copy.submitted : loading ? (copy.submitting ?? "Sending…") : copy.submit),
    [copy.submit, copy.submitted, copy.submitting, submitted, loading],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setLoading(true);

    const data = new FormData(event.currentTarget);
    const payload = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      company: data.get("company") as string,
      role: data.get("role") as string,
      contact: data.get("contact") as string,
      presentationType: data.get("presentationType") as string,
      mode,
      volume: data.get("volume") as string,
      locale,
    };

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        setSubmitError(copy.errorDuplicate ?? "You're already on the list!");
      } else if (!res.ok) {
        setSubmitError(copy.errorGeneric ?? "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setSubmitError(copy.errorGeneric ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={compact ? "waitlist-form compact" : "waitlist-form"} onSubmit={handleSubmit}>
      <div className="mobile-stepper" aria-label={copy.progress}>
        <span className={mobileStep === 1 ? "active" : ""}>1</span>
        <span className={mobileStep === 2 ? "active" : ""}>2</span>
      </div>

      <div className={mobileStep === 1 ? "form-step active" : "form-step"}>
        <div className="field-grid">
          <label>
            <span>{copy.fields.name}</span>
            <input name="name" type="text" placeholder={copy.placeholders.name} required />
          </label>
          <label>
            <span>{copy.fields.email}</span>
            <input name="email" type="email" placeholder={copy.placeholders.email} required />
          </label>
          <label>
            <span>{copy.fields.company}</span>
            <input name="company" type="text" placeholder={copy.placeholders.company} />
          </label>
          <label>
            <span>{copy.fields.role}</span>
            <input name="role" type="text" placeholder={copy.placeholders.role} />
          </label>
        </div>

        <label>
          <span>{copy.fields.contact}</span>
          <input name="contact" type="text" placeholder={copy.placeholders.contact} />
        </label>

        <button className="secondary-action mobile-next" type="button" onClick={() => setMobileStep(2)}>
          {copy.continue} <ArrowRight size={18} />
        </button>
      </div>

      <div className={mobileStep === 2 ? "form-step active" : "form-step"}>
        <label>
          <span>{copy.fields.presentationType}</span>
          <select name="presentationType" defaultValue={copy.presentationTypes[0]}>
            {copy.presentationTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <fieldset>
            <legend>{copy.fields.preferredMode}</legend>
            <div className="segmented-control" role="radiogroup" aria-label={copy.fields.preferredMode}>
              {copy.modes.map((option) => (
                <label key={option} className={mode === option ? "selected" : ""}>
                  <input
                    checked={mode === option}
                    name="mode"
                    onChange={() => setMode(option)}
                    type="radio"
                    value={option}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label>
            <span>{copy.fields.volume}</span>
            <select name="volume" defaultValue={copy.volumes[1]}>
              {copy.volumes.map((volume) => (
                <option key={volume}>{volume}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mobile-form-actions">
          <button className="secondary-action" type="button" onClick={() => setMobileStep(1)}>
            <ArrowLeft size={18} /> {copy.back}
          </button>
          <button className="primary-action form-action" disabled={loading || submitted} type="submit">
            {submitted ? <CheckCircle2 size={18} /> : <Send size={18} />}
            {buttonText}
          </button>
        </div>
      </div>

      <button className="primary-action form-action desktop-form-action" disabled={loading || submitted} type="submit">
        {submitted ? <CheckCircle2 size={18} /> : <Send size={18} />}
        {buttonText}
      </button>

      {submitted && (
        <p className="form-success" role="status">
          {copy.success}
        </p>
      )}
      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
}
