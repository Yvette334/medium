import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getServiceSupabaseClient } from "@/lib/supabase";

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId } = await req.json();
  if (!postId) {
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("id, claps")
    .or(`id.eq.${postId},slug.eq.${postId}`)
    .maybeSingle();
  if (fetchError) {
    console.error("Supabase fetch post error", fetchError);
    return NextResponse.json({ error: "Unable to clap right now" }, { status: 500 });
  }
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("posts")
    .update({ claps: (post.claps || 0) + 1 })
    .eq("id", post.id)
    .select("claps")
    .single();
  if (error) {
    console.error("Supabase clap update error", error);
    return NextResponse.json({ error: "Unable to clap right now" }, { status: 500 });
  }

  return NextResponse.json({ claps: data.claps });
}

