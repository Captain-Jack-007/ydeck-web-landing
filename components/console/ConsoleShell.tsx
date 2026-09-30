import type { ReactNode } from "react";
import { ProductTopBar } from "@/components/workspace/ProductTopBar";

type ConsoleShellProps = {
  children: ReactNode;
  /**
   * Contextual navigation for the current section. Omit it and the content
   * column spans the full width — that is what /workspace does deliberately.
   */
  sidebar?: ReactNode;
  /** Accessible name for the sidebar landmark. Required when sidebar is set. */
  sidebarLabel?: string;
  /** Legacy sidebar class so section stylesheets keep matching their nav. */
  sidebarClassName?: string;
  /**
   * Legacy surface class (.settings-page, .sales-operator-page). Section
   * stylesheets still scope their rules to these, so the shell carries them
   * until each section's CSS is rewritten onto the shell's own classes.
   */
  surfaceClassName?: string;
  /**
   * Section chrome rendered above the content gutter but inside the scrolling
   * column — the Settings mobile bar and its drawer. It sits inside
   * .console-main rather than the grid so it spans the content column at every
   * breakpoint, including where a section hides its sidebar.
   */
  beforeContent?: ReactNode;
};

export function ConsoleShell({
  children,
  sidebar,
  sidebarLabel,
  sidebarClassName,
  surfaceClassName,
  beforeContent,
}: ConsoleShellProps) {
  const className = [
    "console-shell",
    sidebar ? null : "console-shell--flush",
    surfaceClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <ProductTopBar />
      {sidebar ? (
        <aside
          className={["console-sidebar", sidebarClassName].filter(Boolean).join(" ")}
          aria-label={sidebarLabel}
        >
          {sidebar}
        </aside>
      ) : null}
      <main className="console-main">
        {beforeContent}
        <div className="console-content">{children}</div>
      </main>
    </div>
  );
}
