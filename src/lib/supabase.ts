import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. See .env.local.example."
  );
}

// Server-only client using the service role key. Never import this from a
// client component — RLS is off on purpose, so this key must stay on the server.
export const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
