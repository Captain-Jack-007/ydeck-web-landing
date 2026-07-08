import { createClient } from "@supabase/supabase-js";

type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          company: string | null;
          role: string | null;
          contact: string | null;
          presentation_type: string | null;
          preferred_mode: string | null;
          volume: string | null;
          locale: string | null;
          created_at: string;
        };
        Insert: {
          email: string;
          name?: string | null;
          company?: string | null;
          role?: string | null;
          contact?: string | null;
          presentation_type?: string | null;
          preferred_mode?: string | null;
          volume?: string | null;
          locale?: string | null;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let browserClient: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Supabase browser environment variables are missing.");
  }

  browserClient ??= createClient<Database>(
    supabaseUrl,
    supabasePublishableKey
  );
  return browserClient;
}

export function getSupabaseServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase server environment variables are missing.");
  }

  // Server-only client using the service role key (never exposed to the browser)
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}
