"use client";

import Link from "next/link";
import Image from "next/image";

type PostCardProps = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  authorName: string;
  createdAt: string;
  tags: string[];
  claps: number;
};

export function PostCard({
  slug,
  title,
  excerpt,
  coverImage,
  authorName,
  createdAt,
  tags,
  claps,
}: PostCardProps) {
  const preview = excerpt.length > 200 ? `${excerpt.slice(0, 200)}…` : excerpt;
  const displayTags = tags.slice(0, 3);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      {coverImage ? (
        <Link href={`/posts/${slug}`}>
          <Image src={coverImage} alt={title} width={600} height={192} className="h-48 w-full object-cover" unoptimized />
        </Link>
      ) : (
        <div className="h-2 w-full bg-gradient-to-r from-zinc-100 to-zinc-200" />
      )}
      <div className="flex flex-1 flex-col gap-4 p-6">
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-zinc-500">
            {displayTags.map((tag) => (
              <Link key={tag} href={`/tags/${tag}`} className="rounded-full bg-zinc-100 px-2 py-0.5">
                #{tag}
              </Link>
            ))}
          </div>
        )}
        <div className="space-y-2">
          <Link href={`/posts/${slug}`} className="text-2xl font-semibold text-zinc-900">
            {title}
          </Link>
          <p className="text-sm text-zinc-600">{preview || 'No excerpt available yet.'}</p>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between text-sm text-zinc-500">
          <div>
            <p className="font-semibold text-zinc-900">{authorName}</p>
            <p>{new Date(createdAt).toLocaleDateString()}</p>
          </div>
          <p className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
            👏 {claps}
          </p>
        </div>
      </div>
    </article>
  );
}

