import type { Metadata } from "next";
import { InstagramAssetSelection } from "@/components/sales-operator/InstagramAssetSelection";

export const metadata: Metadata = {
  title: "Finish connecting Instagram — YDeck",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function InstagramReturnPage() {
  return <InstagramAssetSelection />;
}
