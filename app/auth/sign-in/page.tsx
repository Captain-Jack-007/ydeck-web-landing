import { headers } from "next/headers";
import SignInClient from "./sign-in-client";

async function getAppOrigin() {
  const requestHeaders = await headers();
  const explicitOrigin = requestHeaders.get("origin");
  if (explicitOrigin) {
    return explicitOrigin;
  }
  const proto = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3005";
  return `${proto}://${host}`;
}

export default async function SignInPage() {
  return <SignInClient appOrigin={await getAppOrigin()} />;
}
