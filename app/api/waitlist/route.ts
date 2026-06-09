import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: Record<string, string>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 422 });
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
      return NextResponse.json({ error: "already_registered" }, { status: 409 });
    }
    console.error("[waitlist] Supabase error:", error.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
