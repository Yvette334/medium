import { createClient } from "@supabase/supabase-js";

const supabaseUrl = requireEnv("SUPABASE_URL", process.env.SUPABASE_URL);
const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const supabaseServiceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);

export function getServiceSupabaseClient() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

export function getAnonSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}

function requireEnv(name: string, value?: string) {
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }
  return value;
}

