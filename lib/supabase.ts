import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client using the service role key (never exposed to the browser)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
