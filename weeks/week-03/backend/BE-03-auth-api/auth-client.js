import { createClient } from "@supabase/supabase-js";

export function createAuthClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_KEY are required");

  const supabase = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return {
    auth: supabase.auth,
    async signOut(accessToken) {
      const response = await fetch(url + "/auth/v1/logout", {
        method: "POST",
        headers: { apikey: key, Authorization: "Bearer " + accessToken },
      });
      if (response.ok) return { error: null };
      return { error: new Error("Supabase logout failed with status " + response.status) };
    },
  };
}

export const authClient = process.env.SUPABASE_URL && process.env.SUPABASE_KEY ? createAuthClient() : null;
