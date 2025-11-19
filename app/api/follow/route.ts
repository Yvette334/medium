import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getServiceSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { target } = await req.json();
  if (!target) return NextResponse.json({ error: "Missing target" }, { status: 400 });

  const supabase = getServiceSupabaseClient();
  const userEmail = session.user.email;
  const { data: current, error } = await supabase
    .from("users")
    .select("following")
    .eq("email", userEmail)
    .maybeSingle();
  if (error) {
    console.error("Supabase fetch user follow error", error);
    return NextResponse.json({ error: "Unable to update follow state" }, { status: 500 });
  }
  if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const following: string[] = current.following || [];
  const isFollowing = following.includes(target);
  const nextFollowing = isFollowing ? following.filter((f) => f !== target) : [...following, target];

  const { error: updateError } = await supabase
    .from("users")
    .update({ following: nextFollowing })
    .eq("email", userEmail);
  if (updateError) {
    console.error("Supabase update follow error", updateError);
    return NextResponse.json({ error: "Unable to update follow state" }, { status: 500 });
  }

  return NextResponse.json({ following: nextFollowing, status: isFollowing ? "unfollowed" : "followed" });
}

