"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";
import {
  Apple,
  ArrowRight,
  Check,
  CircleAlert,
  CircleCheck,
  ListChecks,
  Loader2,
  MonitorDown,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import type { DesktopPlatform } from "@/src/lib/desktop-platform";
import type { DesktopConnectionSummary } from "@/src/lib/desktop-portal";

export type DesktopReleaseStatus = "loading" | "available" | "unavailable" | "paused" | "withdrawn" | "unsupported";

type DownloadPlatformButtonProps = {
  platform: Exclude<DesktopPlatform, "unknown">;
  recommended: boolean;
  status: DesktopReleaseStatus;
  downloadUrl?: string | null;
};

const platformCopy = {
  macos: { label: "Download for macOS", Icon: Apple },
  windows: { label: "Download for Windows", Icon: MonitorDown },
};

function releaseDetail(status: DesktopReleaseStatus, recommended: boolean) {
  if (status === "loading") return "Checking Beta builds";
  if (status === "available") return recommended ? "Recommended for this device" : "View available build";
  if (status === "paused") return "Beta download temporarily paused";
  if (status === "withdrawn") return "Current Beta build withdrawn";
  if (status === "unsupported") return "No compatible build available";
  return recommended ? "Recommended device · Build unavailable" : "Release information unavailable";
}

export function DownloadPlatformButton({ platform, recommended, status, downloadUrl }: DownloadPlatformButtonProps) {
  const { label, Icon } = platformCopy[platform];
  const available = status === "available" && Boolean(downloadUrl);
  const className = [
    "desktop-download-button",
    recommended ? "desktop-download-button--recommended" : "",
    available ? "desktop-download-button--available" : "desktop-download-button--inactive",
  ].filter(Boolean).join(" ");
  const content = (
    <>
      <span className="desktop-download-button__icon"><Icon aria-hidden size={20} /></span>
      <span className="desktop-download-button__copy">
        <strong>{label}</strong>
        <small>{releaseDetail(status, recommended)}</small>
      </span>
      {status === "loading" ? (
        <Loader2 aria-hidden className="workspace-spin" size={17} />
      ) : available ? (
        <ArrowRight aria-hidden size={17} />
      ) : (
        <CircleAlert aria-hidden size={17} />
      )}
    </>
  );

  if (available && downloadUrl) {
    return <a className={className} href={downloadUrl}>{content}</a>;
  }

  return <button className={className} type="button" disabled aria-disabled="true">{content}</button>;
}

export function ReleaseStatusMessage({
  platform,
  status,
  onRetry,
}: {
  platform: "macOS" | "Windows";
  status: DesktopReleaseStatus;
  onRetry?: () => void;
}) {
  if (status === "available" || status === "loading") {
    return null;
  }

  const copy = status === "paused"
    ? "The Beta release is temporarily paused."
    : status === "withdrawn"
      ? "The current Beta build is no longer offered."
      : status === "unsupported"
        ? "No compatible architecture is currently published."
        : "The latest Beta build could not be retrieved.";

  return (
    <div className="desktop-release-message" role="status">
      <CircleAlert aria-hidden size={15} />
      <span><strong>{platform} build unavailable</strong><small>{copy}</small></span>
      {onRetry ? <button type="button" onClick={onRetry}><RefreshCw aria-hidden size={13} />Retry</button> : null}
    </div>
  );
}

export function DesktopConnectionStatus({ summary, compact = false }: { summary: DesktopConnectionSummary; compact?: boolean }) {
  const Icon = summary.state === "connected"
    ? CircleCheck
    : summary.state === "loading"
      ? Loader2
      : summary.state === "attention" || summary.state === "unavailable"
        ? CircleAlert
        : MonitorDown;

  return (
    <div className={`desktop-connection desktop-connection--${summary.state}${compact ? " desktop-connection--compact" : ""}`} role="status">
      <span className="desktop-connection__icon">
        <Icon aria-hidden className={summary.state === "loading" ? "workspace-spin" : undefined} size={compact ? 15 : 17} />
      </span>
      <span><strong>{summary.title}</strong>{compact ? null : <small>{summary.detail}</small>}</span>
    </div>
  );
}

function trapDialogFocus(event: KeyboardEvent, dialog: HTMLElement) {
  if (event.key !== "Tab") {
    return;
  }
  const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], video[controls], [tabindex]:not([tabindex="-1"])',
  ));
  if (focusable.length === 0) {
    event.preventDefault();
    dialog.focus();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function VideoWalkthroughCard({
  videoUrl,
  captionsUrl,
  posterUrl,
}: {
  videoUrl: string | null;
  captionsUrl: string | null;
  posterUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [videoState, setVideoState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const titleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const localPoster = posterUrl.startsWith("/");

  useEffect(() => {
    if (!open) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>(".walkthrough-dialog__close")?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (dialogRef.current) {
        trapDialogFocus(event, dialogRef.current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <article className="walkthrough-card" aria-labelledby="walkthrough-card-title">
        {localPoster ? (
          <Image
            className="walkthrough-card__poster"
            src={posterUrl}
            alt="A professional presentation cover created with YDeck"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 52vw"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="walkthrough-card__poster" src={posterUrl} alt="A professional presentation cover created with YDeck" referrerPolicy="no-referrer" />
        )}
        <span className="walkthrough-card__shade" aria-hidden />
        <header className="walkthrough-card__header">
          <span>Product walkthrough</span>
          <small>Beta</small>
        </header>
        <div className="walkthrough-card__content">
          <h2 id="walkthrough-card-title">See YDeck Desktop in action</h2>
          <p>Turn source material into a structured, editable presentation.</p>
          {videoUrl ? (
            <button ref={triggerRef} className="walkthrough-card__play" type="button" onClick={() => setOpen(true)}>
              <span><Play aria-hidden size={18} fill="currentColor" /></span>
              Watch the walkthrough
            </button>
          ) : (
            <a className="walkthrough-card__play walkthrough-card__play--workflow" href="#getting-started">
              <span><ListChecks aria-hidden size={18} /></span>
              Explore the workflow
            </a>
          )}
        </div>
        <footer className="walkthrough-card__footer">
          <span><Check aria-hidden size={13} />Source material</span>
          <span><Check aria-hidden size={13} />Quality review</span>
          <span><Check aria-hidden size={13} />Editable PPTX</span>
        </footer>
      </article>

      {open && videoUrl ? (
        <div className="walkthrough-dialog-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
          <div
            ref={dialogRef}
            className="walkthrough-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div><span>YDeck Desktop</span><h2 id={titleId}>Product walkthrough</h2></div>
              <button className="walkthrough-dialog__close" type="button" aria-label="Close walkthrough" onClick={() => setOpen(false)}>
                <X aria-hidden size={20} />
              </button>
            </header>
            <div className="walkthrough-dialog__media">
              {videoState === "loading" ? <span className="walkthrough-dialog__loading" role="status"><Loader2 aria-hidden className="workspace-spin" size={20} />Loading walkthrough</span> : null}
              {videoState === "error" ? (
                <div className="walkthrough-dialog__error" role="alert">
                  <CircleAlert aria-hidden size={20} />
                  <strong>Walkthrough unavailable</strong>
                  <span>The video could not be played. Please try again later.</span>
                </div>
              ) : null}
              <video
                controls
                playsInline
                poster={posterUrl}
                preload="metadata"
                onLoadStart={() => setVideoState("loading")}
                onCanPlay={() => setVideoState("ready")}
                onError={() => setVideoState("error")}
              >
                <source src={videoUrl} />
                {captionsUrl ? <track default kind="captions" src={captionsUrl} srcLang="en" label="English" /> : null}
                Your browser does not support embedded video.
              </video>
            </div>
            <footer><Pause aria-hidden size={15} />Playback starts only when you press play. Use the native controls for volume, progress, and fullscreen.</footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function CapabilityItem({ icon: Icon, title, detail, priority = false }: { icon: ElementType; title: string; detail: string; priority?: boolean }) {
  return (
    <div className={`portal-capability${priority ? " portal-capability--priority" : ""}`}>
      <span><Icon aria-hidden size={17} /></span>
      <div><strong>{title}</strong><small>{detail}</small></div>
    </div>
  );
}

export function GettingStartedStep({ index, title, current = false }: { index: number; title: string; current?: boolean }) {
  return (
    <li className={current ? "current" : undefined} aria-current={current ? "step" : undefined}>
      <span>{index}</span>
      <strong>{title}</strong>
    </li>
  );
}

export function AccountSummaryCard({
  plan,
  planLoading,
  workspace,
  workspaceLoading,
  connection,
}: {
  plan: string;
  planLoading: boolean;
  workspace: string;
  workspaceLoading: boolean;
  connection: DesktopConnectionSummary;
}) {
  return (
    <article className="desktop-portal__utility desktop-portal__account">
      <header><div><small>Your account</small><h2>Desktop access</h2></div><ShieldCheck aria-hidden size={18} /></header>
      <DesktopConnectionStatus summary={connection} />
      <dl>
        <div><dt>Plan</dt><dd className={planLoading ? "portal-value-loading" : undefined} title={plan}>{plan}</dd></div>
        <div><dt>Registered devices</dt><dd>{connection.state === "loading" ? "Loading" : connection.activeCount}</dd></div>
        <div><dt>Workspace</dt><dd className={workspaceLoading ? "portal-value-loading" : undefined} title={workspace}>{workspace}</dd></div>
      </dl>
      <div className="desktop-portal__account-actions">
        <Link href="/settings/devices">Manage devices <ArrowRight aria-hidden size={13} /></Link>
        <Link href="/settings/billing">Billing and plan <ArrowRight aria-hidden size={13} /></Link>
      </div>
    </article>
  );
}
