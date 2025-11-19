import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServiceSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token and password required" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const nowIso = new Date().toISOString();
  const { data: candidates, error } = await supabase
    .from("password_resets")
    .select("*")
    .eq("used", false)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(25);
  if (error) {
    console.error("Supabase password reset fetch error", error);
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }

  const match = await findMatchingToken(candidates || [], token);
  if (!match) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const [{ error: userError }, { error: markError }] = await Promise.all([
    supabase.from("users").update({ password: hashed }).eq("id", match.user_id),
    supabase.from("password_resets").update({ used: true }).eq("id", match.id),
  ]);

  if (userError || markError) {
    console.error("Supabase password reset confirm error", userError || markError);
    return NextResponse.json({ error: "Unable to reset password" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

async function findMatchingToken(records: any[], token: string) {
  for (const record of records) {
    const valid = await bcrypt.compare(token, record.token_hash);
    if (valid) {
      return record;
    }
  }
  return null;
}

