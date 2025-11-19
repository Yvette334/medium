"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import ProtectedRoute from "@/components/ProtectedRoute";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  createdAt: string;
  authorName: string;
  authorEmail: string;
  claps: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function FeedPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const { data: profile } = useSWR(session ? "/api/users/me" : null, fetcher);
  type PaginationData = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  const { data: response } = useSWR<{ posts: Post[]; pagination: PaginationData }>(
    profile ? `/api/posts?page=${page}&limit=10` : null,
    fetcher
  );

  const following: string[] = profile?.following || [];
  const allPosts = response?.posts || [];
  const filtered = allPosts.filter((post) =>
    following.length ? following.includes(post.authorEmail) : true,
  );
  const pagination = response?.pagination;

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-zinc-500">Feed</p>
          <h1 className="text-3xl font-semibold text-zinc-900">Recommended for you</h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((post) => (
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
        {pagination && pagination.totalPages > 1 && (
          <Pagination currentPage={page} totalPages={pagination.totalPages} baseUrl="/feed" />
        )}
      </div>
    </ProtectedRoute>
  );
}
