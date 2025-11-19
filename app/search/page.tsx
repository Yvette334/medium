'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { PostCard } from '@/components/PostCard';
import { Pagination } from '@/components/Pagination';

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

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1", 10);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(handle);
  }, [query]);

  const searchUrl = debounced 
    ? `/api/posts?q=${encodeURIComponent(debounced)}&page=${page}&limit=10`
    : `/api/posts?page=${page}&limit=10&published=true`;
  
  const { data: response } = useSWR<{ posts: Post[]; pagination: any }>(searchUrl, fetcher);
  const posts = response?.posts || [];
  const pagination = response?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-500">Search</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Find articles</h1>
        <p className="text-sm text-zinc-500 mt-2">Search by title, content, or tags. Results update as you type.</p>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search posts..."
        className="w-full rounded-full border border-zinc-300 bg-white px-5 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
      />
      {posts.length === 0 ? (
        <p className="text-center text-zinc-500 py-8">
          {debounced ? 'No posts found matching your search.' : 'Start typing to search posts...'}
        </p>
      ) : (
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
      )}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          baseUrl={`/search?q=${encodeURIComponent(debounced)}`}
        />
      )}
    </div>
  );
}

