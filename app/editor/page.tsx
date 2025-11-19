// app/editor/page.tsx
'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MarkdownImage } from '@/components/MarkdownImage';

const starter = `# Title

Write your post using **Markdown** or regular text.

## Tips
- Drag in images or paste URLs
- Use \`###\` for headings
- Publish when ready`;

export default function EditorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState(starter);
  const [title, setTitle] = useState('My new post');
  const [coverImage, setCoverImage] = useState('');
  const [tags, setTags] = useState('nextjs,react');
  const [saving, setSaving] = useState(false);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      // Add to markdown content
      setContent((prev) => `${prev}\n\n![uploaded image](${dataUrl})`);
      // Also set as cover image if not already set
      if (!coverImage) {
        setCoverImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  }

  function handleCoverImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function savePost(publish: boolean) {
    if (!session?.user?.email) {
      alert('Login required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        content,
        coverImage,
        tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
        published: publish,
        draft: !publish,
      };
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        alert('Failed to save post');
        return;
      }
      const data = await res.json();
      router.push(`/posts/${data.slug}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-widest text-zinc-500">Editor</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Write a new post</h1>
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
              placeholder="Paste cover image URL here or upload below..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            />
            <div className="flex gap-2">
              <label className="cursor-pointer rounded-lg border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors">
                Upload Cover Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="rounded-lg border-2 border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors"
              >
                Clear
              </button>
            </div>
            {coverImage && (
              <div className="mt-2">
                <Image
                  src={coverImage}
                  alt="Cover preview"
                  width={600}
                  height={128}
                  className="h-32 w-full rounded border border-zinc-200 object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-600">Add Image to Content</label>
            <label className="block cursor-pointer rounded-lg border-2 border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 transition-colors">
              Upload Image to Content
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
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
              placeholder="Write your post content using Markdown...&#10;&#10;Use **bold**, *italic*, # headings, and more!"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => savePost(false)}
              disabled={saving}
              className="rounded-lg border-2 border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save draft'}
            </button>
            <button
              onClick={() => savePost(true)}
              disabled={saving}
              className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-inner space-y-4">
          <p className="text-sm uppercase tracking-widest text-zinc-600 font-semibold">Preview</p>
          <div className="space-y-2 border-b border-dashed border-zinc-200 pb-4">
            <h2 className="text-2xl font-semibold text-zinc-900">{title || 'Untitled'}</h2>
            <p className="text-sm text-zinc-600">{tags || 'No tags'}</p>
          </div>
          <div className="space-y-4 text-sm leading-relaxed text-zinc-900 max-h-[65vh] overflow-auto">
            <ReactMarkdown
              components={{
                img: ({ src, alt, ...props }) => {
                  const srcString = typeof src === 'string' ? src : null;
                  return <MarkdownImage src={srcString} alt={alt} {...props} />;
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
