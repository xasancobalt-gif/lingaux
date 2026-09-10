import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Public client (anon) — for browser uploads, reading
export const supabase = supabaseUrl && supabaseAnon
  ? createClient(supabaseUrl, supabaseAnon)
  : null;

// Service client — for server-side privileged ops (storage, etc)
export const supabaseAdmin = supabaseUrl && supabaseService
  ? createClient(supabaseUrl, supabaseService)
  : null;

// Helper: get bucket for recordings. Create bucket `recordings` in Supabase Storage (public)
export const RECORDINGS_BUCKET = "recordings";

export function isSupabaseConfigured() {
  return !!supabase && !!supabaseUrl;
}
