'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';

type SimplePost = {
  id: string;
  slug: string;
  title: string;
  authorEmail: string;
  createdAt: string;
};

type ProfileResponse = {
  email: string;
  name: string;
  bio: string;
  avatar: string;
  following: string[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AccountPage() {
  const { data: session } = useSession();
  const email = session?.user?.email || '';

  const { data: profile, mutate } = useSWR<ProfileResponse>(email ? '/api/users/me' : null, fetcher);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [posts, setPosts] = useState<SimplePost[]>([]);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setAvatar(profile.avatar || '');
      setName(profile.name || '');
    }
  }, [profile]);

  useEffect(() => {
    if (!email) return;
    fetch('/api/posts?published=false')
      .then((res) => {
        if (!res.ok) return { posts: [] };
        return res.json();
      })
      .then((data) => {
        const postsArray = data.posts || data || [];
        setPosts(postsArray as SimplePost[]);
      })
      .catch(() => setPosts([]));
  }, [email]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setStatus('No session');
      return;
    }

    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, avatar, name }),
      });
      if (!res.ok) {
        setStatus('Failed to save profile');
        return;
      }
      const updated = await res.json();
      mutate(updated, { revalidate: false });
      setStatus('Profile saved');
    } catch {
      setStatus('Failed to save profile');
    }
  }

  const authored = posts.filter((p) => p.authorEmail === email);

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="text-sm text-zinc-500">Update your public profile info.</p>

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-600">Email</label>
              <input
                value={email}
                disabled
                className="mt-1 w-full rounded border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-600">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-600">Avatar URL</label>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://"
                className="mt-1 w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
              <p className="text-xs text-zinc-500 mt-1">Use any public image link.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-600">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell readers about yourself..."
                className="mt-1 w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded bg-black py-2 text-sm font-semibold text-white"
            >
              Save profile
            </button>

            <p className="text-sm text-green-600">{status}</p>
          </form>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Your posts</h2>
          {authored.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No posts yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {authored.map((post) => (
                <li key={post.id} className="rounded border border-zinc-100 p-3 space-y-1">
                  <div className="text-sm font-semibold">{post.title}</div>
                  <div className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString()}</div>
                  <a className="text-xs text-blue-600" href={`/posts/${post.slug}/edit`}>Edit</a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-semibold">Following</h2>
          <ul className="space-y-2 text-sm text-zinc-600">
            {(profile?.following || []).length === 0 ? (
              <p>You are not following anyone yet.</p>
            ) : (
              profile?.following.map((email) => <li key={email}>{email}</li>)
            )}
          </ul>
        </div>
      </div>
    </ProtectedRoute>
  );
}

