import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tag = searchParams.get("tag");
  const search = searchParams.get("q");
  const authorFilter = searchParams.get("author");
  const publishedOnly = searchParams.get("published") !== "false";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = (page - 1) * limit;

  const supabase = getServiceSupabaseClient();
  let query = supabase.from("posts").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (tag) {
    query = query.contains("tags", [tag]);
  }
  if (search) {
    const like = `%${search}%`;
    query = query.or(`title.ilike.${like},content.ilike.${like}`);
  }

  if (authorFilter === "self") {
    const session = await getServerAuthSession();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    query = query.eq("author_email", email);
  }

  if (publishedOnly) {
    query = query.eq("published", true).eq("draft", false);
  } else if (!searchParams.get("author")) {
    const session = await getServerAuthSession();
    const email = session?.user?.email;
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    query = query.eq("author_email", email);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);
  if (error) {
    console.error("Supabase fetch posts error", error);
    return NextResponse.json({ error: "Unable to fetch posts" }, { status: 500 });
  }

  const totalPages = Math.ceil((count || 0) / limit);
  return NextResponse.json({
    posts: (data || []).map(mapPost),
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages,
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerAuthSession();
  const userEmail = session?.user?.email;
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const slug = body.slug || body.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const post = {
      id: randomUUID(),
      slug: slug || randomUUID(),
      title: body.title || "Untitled",
      excerpt: body.excerpt || body.content?.slice(0, 140) || "",
      content: body.content || "",
      cover_image: body.coverImage || "",
      tags: body.tags || [],
      author_email: userEmail,
      author_name: session.user?.name || "",
      published: Boolean(body.published),
      draft: Boolean(body.draft),
      created_at: now,
      updated_at: now,
      claps: 0,
    };

    const supabase = getServiceSupabaseClient();
    const { data, error } = await supabase.from("posts").insert(post).select("*").single();
    if (error) {
      console.error("Supabase create post error", error);
      return NextResponse.json({ error: "Unable to create post" }, { status: 500 });
    }
    return NextResponse.json(mapPost(data), { status: 201 });
  } catch (err) {
    console.error("post create error", err);
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const supabase = getServiceSupabaseClient();
    const { data: existing, error: fetchError } = await supabase
      .from("posts")
      .select("author_email")
      .eq("id", body.id)
      .maybeSingle();
    if (fetchError) {
      console.error("Supabase fetch post error", fetchError);
      return NextResponse.json({ error: "Unable to update post" }, { status: 500 });
    }
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (existing.author_email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("posts")
      .update({
        title: body.title,
        content: body.content,
        cover_image: body.coverImage,
        tags: body.tags,
        excerpt: body.excerpt ?? body.content?.slice(0, 140),
        published: body.published,
        draft: body.draft,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select("*")
      .single();
    if (error) {
      console.error("Supabase update post error", error);
      return NextResponse.json({ error: "Unable to update" }, { status: 500 });
    }
    return NextResponse.json(mapPost(data));
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = getServiceSupabaseClient();
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("author_email")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      console.error("Supabase fetch post error", fetchError);
      return NextResponse.json({ error: "Unable to delete post" }, { status: 500 });
    }
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (post.author_email !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete post error", error);
      return NextResponse.json({ error: "Unable to delete" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
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
