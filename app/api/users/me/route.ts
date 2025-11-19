import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getServiceSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceSupabaseClient();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, name, bio, avatar, following")
    .eq("email", session.user.email)
    .maybeSingle();
  if (error) {
    console.error("Supabase get user error", error);
    return NextResponse.json({ error: "Unable to fetch profile" }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const supabase = getServiceSupabaseClient();
  const { data: updated, error } = await supabase
    .from("users")
    .update({
      bio: data.bio,
      avatar: data.avatar,
      name: data.name,
    })
    .eq("email", session.user.email)
    .select("id, email, name, bio, avatar, following")
    .maybeSingle();
  if (error) {
    console.error("Supabase update user error", error);
    return NextResponse.json({ error: "Unable to save profile" }, { status: 500 });
  }
  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}

