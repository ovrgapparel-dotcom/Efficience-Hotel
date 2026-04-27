import { createClient } from "@supabase/supabase-js";

// New Supabase project for remote monitoring & support
// To enable full monitoring, add EXPO_PUBLIC_SUPABASE_ANON_KEY to your Vercel environment variables
const SUPABASE_URL = "https://uaewisovhyycrvzwqdcl.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase = null;
try {
  if (SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (e) {
  console.warn("Supabase client not initialized:", e.message);
}

/**
 * Remote monitoring helper — logs errors to Supabase for support purposes.
 * Silently no-ops if Supabase key is not configured.
 */
export const logError = async (error, context = {}) => {
  if (!supabase) return;
  try {
    await supabase.from("logs").insert([{
      message: error?.message || String(error),
      context,
      timestamp: new Date().toISOString(),
    }]);
  } catch (err) {
    console.warn("Remote log failed:", err.message);
  }
};

export default supabase;
