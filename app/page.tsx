import { PostCard } from "@/components/PostCard";
import Link from "next/link";
import Image from "next/image";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { getServerAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerAuthSession();
  const supabase = getServiceSupabaseClient();
  const isLoggedIn = Boolean(session?.user);
  const userName = session?.user?.name || session?.user?.email;
  const [
    { data: postsData, error: postsError },
    { data: writersData, error: writersError },
  ] = await Promise.all([
    supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .eq("draft", false)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("users").select("id, name, email, bio, avatar").limit(4),
  ]);
  if (postsError) {
    console.error("Supabase fetch posts error", postsError);
  }
  if (writersError) {
    console.error("Supabase fetch writers error", writersError);
  }
  const posts = (postsData || []).map(mapPost);
  const trending = posts.slice(0, 5);
  const featured = posts.slice(0, 4);
  const writers = writersData || [];

  return (
    <div className="space-y-12">
      <section className="rounded-3xl bg-gradient-to-br from-zinc-900 via-black to-zinc-900 p-10 text-white">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Phase 2 Frontend Capstone</p>
          <h1 className="text-4xl font-semibold leading-tight">
            {isLoggedIn
              ? `Welcome back${userName ? `, ${userName}` : ""}.`
              : "Stories, ideas, and knowledge shared through a modern Medium-inspired experience."}
          </h1>
          <p className="max-w-3xl text-lg text-zinc-200">
            {isLoggedIn
              ? "Jump into your personalized feed or start drafting your next story."
              : "Compose rich-markdown stories, collaborate with an in-memory publishing API, and explore feeds, tags, and social interactions built with Next.js 16, NextAuth, Tailwind CSS, and SWR."}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={isLoggedIn ? "/editor" : "/auth/register"}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-zinc-900"
            >
              {isLoggedIn ? "Write a story" : "Start writing"}
            </Link>
            {isLoggedIn ? (
              <Link
                href="/feed"
                className="rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Go to your feed
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="rounded-full border border-white/30 px-5 py-2 text-sm text-white hover:bg-white/10"
              >
                Create an account
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Top picks</p>
              <h2 className="text-2xl font-semibold text-zinc-900">Featured stories</h2>
            </div>
            <Link href="/search" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
              Explore topics →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {featured.length === 0 ? (
              <p className="text-sm text-zinc-500">No posts yet. Publish your first story!</p>
            ) : (
              featured.map((post) => (
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
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Trending</p>
            <h3 className="text-xl font-semibold text-zinc-900">What readers love</h3>
          </div>
          <ol className="space-y-4">
            {trending.map((post, index) => (
              <li key={post.id} className="flex gap-4">
                <span className="text-3xl font-bold text-zinc-200">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <Link href={`/posts/${post.slug}`} className="font-semibold text-zinc-900 hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{post.authorName}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>

      <section className="space-y-4 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Writers to follow</p>
            <h2 className="text-2xl font-semibold text-zinc-900">Voices from the lab</h2>
          </div>
          <Link href="/feed" className="text-sm font-medium text-zinc-700 hover:text-zinc-900">
            Personalized feed →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {writers.length === 0 ? (
            <p className="text-sm text-zinc-500">No writers yet. Register to become the first author.</p>
          ) : (
            writers.map((writer) => (
              <div key={writer.id} className="space-y-3 rounded-2xl border border-zinc-100 p-4 text-sm text-zinc-600">
                {writer.avatar?.trim() ? (
                  <Image
                    src={writer.avatar}
                    alt={writer.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full border border-zinc-100 object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-xl font-semibold text-white">
                    {(writer.name || writer.email || "A").charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-zinc-900">{writer.name}</p>
                  <p className="text-xs text-zinc-500">{writer.bio || "Aspiring storyteller"}</p>
                </div>
                <Link href="/feed" className="text-xs font-semibold text-zinc-900 underline">
                  Read recommendations
                </Link>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function mapPost(row: any) {
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
