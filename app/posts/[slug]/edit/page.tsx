'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MarkdownImage } from '@/components/MarkdownImage';

type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage: string;
  tags: string[];
  published: boolean;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch post' }));
    throw new Error(error.error || 'Failed to fetch post');
  }
  return res.json();
};

export default function EditPostPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const router = useRouter();
  // Ensure params is a Promise for use() hook
  const paramsPromise = params instanceof Promise ? params : Promise.resolve(params);
  const resolvedParams = use(paramsPromise);
  const slug = resolvedParams.slug;
  const { data: post, error: postError, isLoading } = useSWR<Post>(slug ? `/api/posts/${slug}` : null, fetcher);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (post && !isLoaded) {
      console.log('Loading post data:', post);
      setTitle(post.title || '');
      setContent(post.content || '');
      setCoverImage(post.coverImage || '');
      setTags(Array.isArray(post.tags) ? post.tags.join(',') : (post.tags || ''));
      setPublished(post.published || false);
      setIsLoaded(true);
    }
  }, [post, isLoaded]);

  async function save() {
    if (!slug || !post) return;
    const res = await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content,
        coverImage,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        published,
        draft: !published,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      router.push(`/posts/${updated.slug}`);
    } else {
      alert('Failed to update');
    }
  }

  async function remove() {
    if (!slug) return;
    if (!confirm('Delete this post?')) return;
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/account');
    } else {
      alert('Failed to delete');
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-zinc-600">Loading post...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (postError || !post) {
    return (
      <ProtectedRoute>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-zinc-900">Error</h1>
          <p className="text-zinc-600">
            {postError?.message || 'Post not found or you do not have permission to edit it.'}
          </p>
          <button
            onClick={() => router.push('/account')}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            Back to Account
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Edit Post</h1>
          <p className="text-sm text-zinc-600 mt-1">Make changes to your post below</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Post Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
                placeholder="Enter your post title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-600">Cover Image</label>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Paste cover image URL here..."
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
              {coverImage && (
                <div className="mt-2">
                  <Image
                    src={coverImage}
                    alt="Cover preview"
                    width={600}
                    height={128}
                    className="h-32 w-full rounded-lg border border-zinc-200 object-cover"
                    unoptimized
                  />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Tags</label>
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., nextjs, react, webdev (comma separated)"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Content (Markdown)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 font-mono focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 resize-y"
                placeholder="Write your post content using Markdown..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-zinc-300"
              />
              Published
            </label>
            <div className="flex gap-2 pt-2">
              <button
                onClick={save}
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors"
              >
                Save changes
              </button>
              <button
                onClick={remove}
                className="rounded-lg border-2 border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
              >
                Delete Post
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-inner space-y-4">
            <p className="text-sm uppercase tracking-widest text-zinc-600 font-semibold">Preview</p>
            <div className="space-y-2 border-b border-dashed border-zinc-200 pb-4">
              <h2 className="text-2xl font-semibold text-zinc-900">{title || 'Untitled'}</h2>
              <p className="text-sm text-zinc-600">{tags || 'No tags'}</p>
            </div>
            {coverImage && (
              <div className="mt-2">
                <Image
                  src={coverImage}
                  alt="Cover"
                  width={600}
                  height={128}
                  className="h-32 w-full rounded-lg border border-zinc-200 object-cover"
                  unoptimized
                />
              </div>
            )}
            <div className="space-y-4 text-sm leading-relaxed text-zinc-900 max-h-[65vh] overflow-auto">
              <ReactMarkdown
                components={{
                  img: ({ src, alt, ...props }) => {
                    const srcString = typeof src === 'string' ? src : null;
                    return <MarkdownImage src={srcString} alt={alt} {...props} />;
                  },
                  h1: ({ children, ...props }) => <h1 className="text-2xl font-bold text-zinc-900 mt-4 mb-2" {...props}>{children}</h1>,
                  h2: ({ children, ...props }) => <h2 className="text-xl font-bold text-zinc-900 mt-3 mb-2" {...props}>{children}</h2>,
                  h3: ({ children, ...props }) => <h3 className="text-lg font-semibold text-zinc-900 mt-2 mb-1" {...props}>{children}</h3>,
                  p: ({ children, ...props }) => <p className="text-zinc-900 mb-3 leading-6" {...props}>{children}</p>,
                  a: ({ children, ...props }) => <a className="text-zinc-900 underline hover:text-zinc-700" {...props}>{children}</a>,
                  code: ({ children, ...props }) => <code className="bg-zinc-100 text-zinc-900 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>,
                  pre: ({ children, ...props }) => <pre className="bg-zinc-100 text-zinc-900 p-3 rounded-lg overflow-x-auto my-3 text-xs" {...props}>{children}</pre>,
                  ul: ({ children, ...props }) => <ul className="list-disc list-inside text-zinc-900 mb-3 space-y-1" {...props}>{children}</ul>,
                  ol: ({ children, ...props }) => <ol className="list-decimal list-inside text-zinc-900 mb-3 space-y-1" {...props}>{children}</ol>,
                  li: ({ children, ...props }) => <li className="text-zinc-900" {...props}>{children}</li>,
                  blockquote: ({ children, ...props }) => <blockquote className="border-l-4 border-zinc-300 pl-3 italic text-zinc-700 my-3" {...props}>{children}</blockquote>,
                }}
              >
                {content || 'Start writing your post...'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

