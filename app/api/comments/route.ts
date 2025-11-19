import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServerAuthSession } from "@/lib/auth";
import { getServiceSupabaseClient } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const supabase = getServiceSupabaseClient();
  let query = supabase.from("comments").select("*").order("created_at", { ascending: true });
  if (postId) {
    query = query.eq("post_id", postId);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Supabase fetch comments error", error);
    return NextResponse.json({ error: "Unable to fetch comments" }, { status: 500 });
  }
  return NextResponse.json((data || []).map(mapComment));
}

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { postId, body, parentId } = await req.json();
  if (!postId || !body) {
    return NextResponse.json({ error: "Missing postId or body" }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("id")
    .or(`id.eq.${postId},slug.eq.${postId}`)
    .maybeSingle();
  if (postError) {
    console.error("Supabase find post error", postError);
    return NextResponse.json({ error: "Unable to comment" }, { status: 500 });
  }
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const comment = {
    id: randomUUID(),
    post_id: post.id,
    author_email: email,
    author_name: session.user?.name || email,
    body,
    parent_id: parentId,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("comments").insert(comment).select("*").single();
  if (error) {
    console.error("Supabase create comment error", error);
    return NextResponse.json({ error: "Unable to post comment" }, { status: 500 });
  }
  return NextResponse.json(mapComment(data), { status: 201 });
}

type CommentRow = {
  id: string;
  post_id: string;
  author_email: string;
  author_name: string;
  body: string;
  parent_id: string | null;
  created_at: string;
};

function mapComment(row: CommentRow) {
  return {
    id: row.id,
    postId: row.post_id,
    authorEmail: row.author_email,
    authorName: row.author_name,
    body: row.body,
    parentId: row.parent_id,
    createdAt: row.created_at,
  };
}

