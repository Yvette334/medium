import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const headersList = await headers();
    const identifier = headersList.get("x-forwarded-for") || "register";
    if (!checkRateLimit(`register:${identifier}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many registration attempts. Please wait a minute." }, { status: 429 });
    }

    const supabase = getServiceSupabaseClient();
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingError) {
      console.error("Supabase check user error", existingError);
      return NextResponse.json({ error: "Unable to register right now" }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: randomUUID(),
      name: name || email.split("@")[0],
      email,
      password: hashed,
      bio: "",
      avatar: "",
      following: [],
    };
    const { error } = await supabase.from("users").insert(user);
    if (error) {
      console.error("Supabase insert user error", error);
      return NextResponse.json({ error: "Unable to register right now" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("register error", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

