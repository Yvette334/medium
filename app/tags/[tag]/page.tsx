import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { getServiceSupabaseClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }> | { tag: string };
  searchParams: Promise<{ page?: string }> | { page?: string };
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const tag = resolvedParams.tag;
  const page = parseInt(resolvedSearchParams.page || "1", 10);
  const limit = 10;
  const offset = (page - 1) * limit;

  const supabase = getServiceSupabaseClient();
  const { data, error, count } = await supabase
    .from("posts")
    .select("*", { count: "exact" })
    .contains("tags", [tag])
    .eq("published", true)
    .eq("draft", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error("Supabase fetch tag posts error", error);
  }
  const posts = (data || []).map(mapPost);
  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-600">Tag</p>
        <h1 className="text-3xl font-semibold text-zinc-900">#{tag}</h1>
        <p className="text-sm text-zinc-500 mt-2">{posts.length} post(s)</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            id={post.id}
            slug={post.slug}
            title={post.title}
            excerpt={post.excerpt}
            coverImage={post.coverImage}
            authorName={post.authorName || post.authorEmail}
            createdAt={post.createdAt}
            tags={post.tags}
            claps={post.claps}
          />
        ))}
      </div>
      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} baseUrl={`/tags/${tag}`} />}
    </div>
  );
}

type PostRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover_image: string | null;
  author_name: string;
  author_email: string;
  created_at: string;
  tags: string[];
  claps: number;
};

function mapPost(row: PostRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    authorName: row.author_name,
    authorEmail: row.author_email,
    createdAt: row.created_at,
    tags: row.tags || [],
    claps: row.claps ?? 0,
  };
}

