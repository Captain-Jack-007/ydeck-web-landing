"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";

type WaitlistFormProps = {
  compact?: boolean;
};

const presentationTypes = [
  "Pitch decks",
  "Business proposals",
  "Training slides",
  "Education lessons",
  "Sales or client reports",
  "Other",
];

export function WaitlistForm({ compact = false }: WaitlistFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [mode, setMode] = useState("Both");
  const [mobileStep, setMobileStep] = useState(1);

  const buttonText = useMemo(
    () => (submitted ? "Request Received" : "Request Early Access"),
    [submitted],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <form className={compact ? "waitlist-form compact" : "waitlist-form"} onSubmit={handleSubmit}>
      <div className="mobile-stepper" aria-label="Waitlist form progress">
        <span className={mobileStep === 1 ? "active" : ""}>1</span>
        <span className={mobileStep === 2 ? "active" : ""}>2</span>
      </div>

      <div className={mobileStep === 1 ? "form-step active" : "form-step"}>
        <div className="field-grid">
          <label>
            <span>Full name</span>
            <input name="name" type="text" placeholder="Your name" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="you@company.com" required />
          </label>
          <label>
            <span>Company / Organization</span>
            <input name="company" type="text" placeholder="Company name" />
          </label>
          <label>
            <span>Role</span>
            <input name="role" type="text" placeholder="Founder, educator, consultant..." />
          </label>
        </div>

        <label>
          <span>WhatsApp / WeChat</span>
          <input name="contact" type="text" placeholder="+1 555 0100 or WeChat ID" />
        </label>

        <button className="secondary-action mobile-next" type="button" onClick={() => setMobileStep(2)}>
          Continue <ArrowRight size={18} />
        </button>
      </div>

      <div className={mobileStep === 2 ? "form-step active" : "form-step"}>
        <label>
          <span>What type of presentations do you create?</span>
          <select name="presentationType" defaultValue="Pitch decks">
            {presentationTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        <div className="form-row">
          <fieldset>
            <legend>Preferred mode</legend>
            <div className="segmented-control" role="radiogroup" aria-label="Preferred mode">
              {["Private", "Cloud", "Both"].map((option) => (
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
            <span>Decks per month</span>
            <select name="volume" defaultValue="3-10">
              <option>1-2</option>
              <option>3-10</option>
              <option>11-25</option>
              <option>25+</option>
            </select>
          </label>
        </div>

        <div className="mobile-form-actions">
          <button className="secondary-action" type="button" onClick={() => setMobileStep(1)}>
            <ArrowLeft size={18} /> Back
          </button>
          <button className="primary-action form-action" type="submit">
            {submitted ? <CheckCircle2 size={18} /> : <Send size={18} />}
            {buttonText}
          </button>
        </div>
      </div>

      <button className="primary-action form-action desktop-form-action" type="submit">
        {submitted ? <CheckCircle2 size={18} /> : <Send size={18} />}
        {buttonText}
      </button>

      {submitted && (
        <p className="form-success" role="status">
          Thanks. Your pilot request is saved in this prototype state and ready to connect to a backend.
        </p>
      )}
    </form>
  );
}
