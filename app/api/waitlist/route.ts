import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

const allowedOrigins = new Set([
  "https://ydeck.app",
  "https://www.ydeck.app",
  "http://localhost:3005",
]);

function corsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }

  return headers;
}

function json(req: NextRequest, body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders(req),
  });
}

export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req),
  });
}

export async function POST(req: NextRequest) {
  let supabase;
  let body: Record<string, string>;

  try {
    supabase = getSupabaseServerClient();
  } catch (error) {
    if (error instanceof Error && error.message.includes("Supabase server environment variables are missing")) {
      console.error("[waitlist] Missing Supabase environment variables.");
      return json(req, { error: "Waitlist is not configured" }, 500);
    }
    throw error;
  }

  try {
    body = await req.json();
  } catch {
    return json(req, { error: "Invalid JSON" }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return json(req, { error: "Email is required" }, 422);
  }

  const { error } = await supabase.from("waitlist").insert({
    email,
    name: body.name?.trim() || null,
    company: body.company?.trim() || null,
    role: body.role?.trim() || null,
    contact: body.contact?.trim() || null,
    presentation_type: body.presentationType || null,
    preferred_mode: body.mode || null,
    volume: body.volume || null,
    locale: body.locale || "en",
  });

  if (error) {
    // Postgres unique_violation code — email already on list
    if (error.code === "23505") {
      return json(req, { error: "already_registered" }, 409);
    }
    console.error("[waitlist] Supabase error:", error.message);
    return json(req, { error: "Database error" }, 500);
  }

  return json(req, { ok: true }, 201);
}
