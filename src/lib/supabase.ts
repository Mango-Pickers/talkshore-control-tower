import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xgoehmaxmavvujjasmvr.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhnb2VobWF4bWF2dnVqamFzbXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODQ2MzYsImV4cCI6MjA5NDI2MDYzNn0.N3_MYx9NPkNKQzFkaw6Jex7ELLTWL195uNeTqxKtpAU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
