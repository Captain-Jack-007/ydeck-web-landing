import type { ReactNode } from "react";

/**
 * The single dominant heading for a console page. One per page — competing
 * heavy headings are what make a dashboard read as a marketing page.
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="console-page-header">
      <div className="console-page-header__copy">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {actions ? <div className="console-page-header__actions">{actions}</div> : null}
    </header>
  );
}

/** Secondary heading that introduces a group of cards or rows. */
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="console-section-header">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
