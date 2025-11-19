import { NextResponse } from "next/server";
import { randomBytes, randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const identifier = headers().get("x-forwarded-for") || "reset";
  if (!checkRateLimit(`reset:${identifier}`, 3, 300_000)) {
    return NextResponse.json({ error: "Too many reset attempts. Please wait a few minutes." }, { status: 429 });
  }

  const supabase = getServiceSupabaseClient();
  const { data: user } = await supabase.from("users").select("id, email").eq("email", email).maybeSingle();
  if (!user) {
    // do not leak existence
    return NextResponse.json({ ok: true });
  }

  const token = randomBytes(32).toString("hex");
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("password_resets")
    .insert({ id: randomUUID(), user_id: user.id, token_hash: tokenHash, expires_at: expiresAt, used: false });

  if (error) {
    console.error("Supabase password reset insert error", error);
    return NextResponse.json({ error: "Unable to start password reset" }, { status: 500 });
  }

  // In real app, email token link. For lab, return token.
  return NextResponse.json({ ok: true, token });
}

