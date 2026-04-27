import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://uaewisovhyycrvzwqdcl.supabase.co";
const supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY"; // Placeholder - keep for remote support

const API = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Monitoring helper for remote support
 */
export const logError = async (error, context = {}) => {
  try {
    await API.from("logs").insert([{ 
      message: error.message, 
      context, 
      timestamp: new Date().toISOString() 
    }]);
  } catch (err) {
    console.error("Failed to remote log error", err);
  }
};

export default API;
