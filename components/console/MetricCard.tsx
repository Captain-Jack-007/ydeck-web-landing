import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A single workspace figure. `value` is deliberately a ReactNode so callers can
 * pass an em dash for genuinely unknown data rather than a misleading zero.
 */
export function MetricCard({
  label,
  value,
  hint,
  href,
  loading = false,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  href?: string;
  loading?: boolean;
}) {
  const body = (
    <>
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{loading ? <span className="metric-card__skeleton" aria-label="Loading" /> : value}</strong>
      {hint ? <span className="metric-card__hint">{hint}</span> : null}
    </>
  );

  if (href) {
    return (
      <Link className="metric-card" href={href}>
        {body}
      </Link>
    );
  }

  return <div className="metric-card">{body}</div>;
}
