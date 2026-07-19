"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  FileDown,
  Files,
  Laptop,
  ScanText,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  AccountSummaryCard,
  CapabilityItem,
  DesktopConnectionStatus,
  DownloadPlatformButton,
  GettingStartedStep,
  ReleaseStatusMessage,
  VideoWalkthroughCard,
} from "@/components/workspace/DesktopPortalComponents";
import { getBrowserPlatform, type DesktopPlatform } from "@/src/lib/desktop-platform";
import { getDesktopConnectionSummary, normalizePortalMediaUrl } from "@/src/lib/desktop-portal";
import { useBilling } from "@/src/providers/billing-provider";
import { useDevices } from "@/src/providers/device-provider";
import { useWorkspace } from "@/src/providers/workspace-provider";

const DEFAULT_POSTER_URL = "/ydeck-template-previews/ydeck-country-overview/slide-01.png";

const capabilities = [
  { icon: Laptop, title: "Presentation studio", detail: "Build structured presentations in one focused workspace.", priority: true },
  { icon: ScanText, title: "Quality review", detail: "Review readability, consistency, and visual hierarchy.", priority: true },
  { icon: FileDown, title: "Editable PPTX", detail: "Export a presentation for continued editing.", priority: true },
  { icon: Files, title: "Source-file support", detail: "Work with supported PDFs, PPTX files, notes, and documents." },
  { icon: Sparkles, title: "Local workflows", detail: "Run supported Desktop generation workflows." },
  { icon: Settings2, title: "Connected providers", detail: "Use supported provider and BYOK integrations." },
];

const workflowSteps = [
  "Install and connect",
  "Add source material",
  "Generate and review",
  "Export and edit",
];

export function DesktopPortalHome() {
  const { summary, status: billingStatus } = useBilling();
  const { devices, status: devicesStatus } = useDevices();
  const { workspace, status: workspaceStatus } = useWorkspace();
  const [platform, setPlatform] = useState<DesktopPlatform>("unknown");
  const [posterUrl, setPosterUrl] = useState(DEFAULT_POSTER_URL);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [captionsUrl, setCaptionsUrl] = useState<string | null>(null);

  useEffect(() => {
    const origin = window.location.origin;
    setPlatform(getBrowserPlatform());
    setPosterUrl(normalizePortalMediaUrl(process.env.NEXT_PUBLIC_YDECK_DESKTOP_PREVIEW_URL, origin) ?? DEFAULT_POSTER_URL);
    setVideoUrl(normalizePortalMediaUrl(process.env.NEXT_PUBLIC_YDECK_DESKTOP_WALKTHROUGH_URL, origin));
    setCaptionsUrl(normalizePortalMediaUrl(process.env.NEXT_PUBLIC_YDECK_DESKTOP_WALKTHROUGH_CAPTIONS_URL, origin));
  }, []);

  const connection = getDesktopConnectionSummary(devices, devicesStatus);
  const planName = summary?.subscription.planName
    ?? summary?.subscription.planKey
    ?? (billingStatus === "loading" || billingStatus === "idle" ? "Loading" : billingStatus === "error" ? "Unavailable" : "Free");
  const workspaceName = workspace?.name
    ?? (workspaceStatus === "loading" || workspaceStatus === "idle" ? "Loading" : "Unavailable");
  const currentWorkflowStep = connection.state === "connected" ? 2 : 1;

  return (
    <div className="desktop-portal">
      <section className="desktop-portal__overview" aria-labelledby="desktop-portal-title">
        <div className="desktop-portal__hero-copy">
          <span className="desktop-portal__badge"><span />YDeck Desktop Beta</span>
          <h1 id="desktop-portal-title">Create professional presentations with YDeck Desktop.</h1>
          <p>Turn documents, research, and ideas into structured, visually refined, editable presentations on macOS and Windows.</p>

          <div className="desktop-portal__hero-actions" aria-label="Desktop downloads">
            <div className="desktop-portal__download-option">
              <DownloadPlatformButton platform="macos" recommended={platform === "macos"} status="unavailable" />
              <ReleaseStatusMessage platform="macOS" status="unavailable" />
            </div>
            <div className="desktop-portal__download-option">
              <DownloadPlatformButton platform="windows" recommended={platform === "windows"} status="unavailable" />
              <ReleaseStatusMessage platform="Windows" status="unavailable" />
            </div>
          </div>

          <div className="desktop-portal__meta" aria-label="Desktop beta details">
            <span><CheckCircle2 aria-hidden size={15} />Beta channel</span>
            <span><ShieldCheck aria-hidden size={15} />Secure account pairing</span>
            <DesktopConnectionStatus summary={connection} compact />
          </div>
        </div>

        <div id="product-walkthrough">
          <VideoWalkthroughCard videoUrl={videoUrl} captionsUrl={captionsUrl} posterUrl={posterUrl} />
        </div>
      </section>

      <section className="desktop-portal__utility-grid" aria-label="YDeck Desktop information">
        <article className="desktop-portal__utility desktop-portal__capabilities">
          <header><div><small>Included in Desktop</small><h2>Core capabilities</h2></div><CheckCircle2 aria-hidden size={18} /></header>
          <div className="desktop-portal__capability-grid">
            {capabilities.map((capability) => <CapabilityItem key={capability.title} {...capability} />)}
          </div>
        </article>

        <article className="desktop-portal__utility desktop-portal__workflow" id="getting-started">
          <header><div><small>Getting started</small><h2>From source to deck</h2></div><FileCheck2 aria-hidden size={18} /></header>
          <ol id="desktop-workflow">
            {workflowSteps.map((step, index) => (
              <GettingStartedStep key={step} index={index + 1} title={step} current={currentWorkflowStep === index + 1} />
            ))}
          </ol>
          <div className="desktop-portal__resource-links">
            <Link href="/settings/devices">Connect Desktop <ArrowRight aria-hidden size={13} /></Link>
            <a href="#product-walkthrough">View walkthrough <ArrowRight aria-hidden size={13} /></a>
          </div>
        </article>

        <AccountSummaryCard
          plan={planName}
          planLoading={billingStatus === "loading" || billingStatus === "idle"}
          workspace={workspaceName}
          workspaceLoading={workspaceStatus === "loading" || workspaceStatus === "idle"}
          connection={connection}
        />
      </section>
    </div>
  );
}
