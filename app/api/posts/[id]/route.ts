import { NextResponse } from "next/server";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = getServiceSupabaseClient();
  
  // Check if id is a UUID or a slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let query = supabase.from("posts").select("*");
  if (isUUID) {
    query = query.eq("id", id);
  } else {
    query = query.eq("slug", id);
  }
  
  const { data: post, error } = await query.maybeSingle();
  if (error) {
    console.error("Supabase fetch post error", error);
    return NextResponse.json({ error: "Unable to fetch post" }, { status: 500 });
  }
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(mapPost(post));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerAuthSession();
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = getServiceSupabaseClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let query = supabase.from("posts").select("id, author_email");
  if (isUUID) {
    query = query.eq("id", id);
  } else {
    query = query.eq("slug", id);
  }
  const { data: post, error: fetchError } = await query.maybeSingle();
  if (fetchError) {
    console.error("Supabase fetch post error", fetchError);
    return NextResponse.json({ error: "Unable to update post" }, { status: 500 });
  }
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.author_email !== userEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { data: updated, error } = await supabase
    .from("posts")
    .update({
      title: body.title,
      content: body.content,
      cover_image: body.coverImage || null,
      tags: body.tags || [],
      excerpt: body.excerpt ?? body.content?.slice(0, 140) ?? "",
      published: Boolean(body.published),
      draft: body.draft !== undefined ? Boolean(body.draft) : !Boolean(body.published),
      updated_at: new Date().toISOString(),
    })
    .eq("id", post.id)
    .select("*")
    .single();
  if (error) {
    console.error("Supabase update post error", error);
    return NextResponse.json({ error: "Unable to update post" }, { status: 500 });
  }
  return NextResponse.json(mapPost(updated));
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await getServerAuthSession();
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const resolvedParams = await params;
  const id = resolvedParams.id;
  const supabase = getServiceSupabaseClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  
  let query = supabase.from("posts").select("id, author_email");
  if (isUUID) {
    query = query.eq("id", id);
  } else {
    query = query.eq("slug", id);
  }
  const { data: post, error: fetchError } = await query.maybeSingle();
  if (fetchError) {
    console.error("Supabase fetch post error", fetchError);
    return NextResponse.json({ error: "Unable to delete post" }, { status: 500 });
  }
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.author_email !== userEmail) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", post.id);
  if (error) {
    console.error("Supabase delete post error", error);
    return NextResponse.json({ error: "Unable to delete post" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

function mapPost(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    tags: row.tags,
    authorEmail: row.author_email,
    authorName: row.author_name,
    published: row.published,
    draft: row.draft,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    claps: row.claps ?? 0,
  };
}

