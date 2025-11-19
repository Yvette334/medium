import { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ClapButton } from "@/components/ClapButton";
import { CommentsSection } from "@/components/CommentsSection";
import { FollowButton } from "@/components/FollowButton";
import { getServerAuthSession } from "@/lib/auth";
import { getServiceSupabaseClient } from "@/lib/supabase";
import { MarkdownImage } from "@/components/MarkdownImage";

type PostPageProps = {
  params: Promise<{ slug: string }> | { slug: string };
};

export const dynamicParams = true;
export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = getServiceSupabaseClient();
  const { data } = await supabase.from("posts").select("slug").eq("published", true).eq("draft", false);
  return (data || []).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const supabase = getServiceSupabaseClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, cover_image")
    .eq("slug", resolvedParams.slug)
    .maybeSingle();
  if (!post) {
    return {
      title: "Post not found",
    };
  }
  return {
    title: `${post.title} — Medium Lab`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [{ url: post.cover_image }] : [],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) {
    notFound();
  }
  const supabase = getServiceSupabaseClient();
  // Check if slug is a UUID or a regular slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  
  let query = supabase.from("posts").select("*");
  if (isUUID) {
    query = query.eq("id", slug);
  } else {
    query = query.eq("slug", slug);
  }
  
  const { data: post, error } = await query.maybeSingle();
  if (error) {
    console.error("Supabase fetch post error", JSON.stringify(error, null, 2));
    notFound();
  }
  if (!post) {
    notFound();
  }

  const session = await getServerAuthSession();
  const [{ data: author }, { data: currentUser }] = await Promise.all([
    supabase
      .from("users")
      .select("email, name, bio, avatar")
      .eq("email", post.author_email)
      .maybeSingle(),
    session?.user?.email
      ? supabase.from("users").select("following").eq("email", session.user.email).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const following = currentUser?.following?.includes(post.author_email) ?? false;

  const resolvedAuthor = author || {
    email: post.author_email,
    name: post.author_name,
    bio: "",
    avatar: "",
  };

  const isOwnPost = session?.user?.email === post.author_email;

  const { email: authorEmail, name: authorName, bio: authorBio, avatar: authorAvatar } = resolvedAuthor;

  return (
    <article className="max-w-3xl space-y-6">
      <p className="text-sm uppercase tracking-widest text-zinc-600">
        Published {new Date(post.created_at).toLocaleDateString()}
      </p>
      <h1 className="text-4xl font-bold text-zinc-900">{post.title}</h1>
      <p className="text-lg text-zinc-700">{post.excerpt}</p>
      <div className="mt-4 flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
        {authorAvatar?.trim() ? (
          <Image src={authorAvatar} alt={authorName || authorEmail} width={48} height={48} className="h-12 w-12 rounded-full object-cover" unoptimized />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
            {(authorName || authorEmail || "A").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold text-zinc-900">{authorName || authorEmail}</p>
          <p className="text-xs text-zinc-600">{authorBio || "New author on Medium Lab"}</p>
        </div>
        {!isOwnPost && session?.user?.email ? (
          <FollowButton authorEmail={post.author_email} initialFollowing={following} />
        ) : null}
      </div>
      {post.cover_image ? (
        <Image src={post.cover_image} alt={post.title} width={1200} height={600} className="mt-6 w-full rounded-2xl object-cover" unoptimized />
      ) : null}
      <div className="space-y-4 leading-relaxed text-zinc-900 prose prose-zinc max-w-none">
        <ReactMarkdown
          components={{
            img: ({ src, alt, ...props }) => {
              const srcString = typeof src === 'string' ? src : null;
              return <MarkdownImage src={srcString} alt={alt} {...props} />;
            },
            h1: ({ children, ...props }) => <h1 className="text-3xl font-bold text-zinc-900 mt-6 mb-4" {...props}>{children}</h1>,
            h2: ({ children, ...props }) => <h2 className="text-2xl font-bold text-zinc-900 mt-5 mb-3" {...props}>{children}</h2>,
            h3: ({ children, ...props }) => <h3 className="text-xl font-semibold text-zinc-900 mt-4 mb-2" {...props}>{children}</h3>,
            p: ({ children, ...props }) => <p className="text-zinc-900 mb-4 leading-7" {...props}>{children}</p>,
            a: ({ children, ...props }) => <a className="text-zinc-900 underline hover:text-zinc-700" {...props}>{children}</a>,
            code: ({ children, ...props }) => <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>,
            pre: ({ children, ...props }) => <pre className="bg-zinc-100 text-zinc-900 p-4 rounded-lg overflow-x-auto my-4" {...props}>{children}</pre>,
            ul: ({ children, ...props }) => <ul className="list-disc list-inside text-zinc-900 mb-4 space-y-2" {...props}>{children}</ul>,
            ol: ({ children, ...props }) => <ol className="list-decimal list-inside text-zinc-900 mb-4 space-y-2" {...props}>{children}</ol>,
            li: ({ children, ...props }) => <li className="text-zinc-900" {...props}>{children}</li>,
            blockquote: ({ children, ...props }) => <blockquote className="border-l-4 border-zinc-300 pl-4 italic text-zinc-700 my-4" {...props}>{children}</blockquote>,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
      <div className="mt-8 flex items-center gap-4">
        <ClapButton postId={post.id} initialClaps={post.claps} />
        {isOwnPost && (
          <a
            href={`/posts/${post.slug}/edit`}
            className="rounded-lg border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors"
          >
            Edit Post
          </a>
        )}
      </div>
      <div className="mt-10">
        <CommentsSection postId={post.id} />
      </div>
    </article>
  );
}

