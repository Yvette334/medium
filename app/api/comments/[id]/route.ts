import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/auth";
import { getServiceSupabaseClient } from "@/lib/supabase";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const commentId = resolvedParams.id;
  const supabase = getServiceSupabaseClient();
  const { data: comment, error: fetchError } = await supabase
    .from("comments")
    .select("author_email")
    .eq("id", commentId)
    .maybeSingle();
  if (fetchError) {
    console.error("Supabase fetch comment error", fetchError);
    return NextResponse.json({ error: "Unable to delete comment" }, { status: 500 });
  }
  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (comment.author_email !== session.user.email) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) {
    console.error("Supabase delete comment error", error);
    return NextResponse.json({ error: "Unable to delete comment" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

