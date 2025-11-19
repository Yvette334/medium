'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import Image from 'next/image';

type SimplePost = {
  id: string;
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

export default function ProfilePage() {
  const { data: session } = useSession();
  const email = session?.user?.email || '';

  const { data: profile } = useSWR<ProfileResponse>(email ? '/api/users/me' : null, fetcher);
  const { data: postsResponse } = useSWR<{ posts: SimplePost[] } | SimplePost[]>(
    email ? '/api/posts?author=self' : null,
    fetcher
  );
  const posts = Array.isArray(postsResponse) ? postsResponse : postsResponse?.posts || [];

  const authored = posts || [];
  const avatar = profile?.avatar?.trim() || '';

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            {avatar ? (
              <Image
                src={avatar}
                alt="avatar"
                width={64}
                height={64}
                className="h-16 w-16 rounded-full border border-zinc-200 object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 text-xl font-semibold text-white">
                {(profile?.name || email || 'A').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold">{profile?.name || 'Anonymous'}</h1>
              <p className="text-sm text-zinc-500">{email}</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-zinc-700 whitespace-pre-line">
            {profile?.bio || 'Add a bio on the Account page so readers can learn more about you.'}
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <p><span className="font-semibold text-zinc-900">{authored.length}</span> posts</p>
            <p><span className="font-semibold text-zinc-900">{profile?.following.length || 0}</span> following</p>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Posts by you</h2>
          {authored.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-500">No posts yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {authored.map((post) => (
                <li key={post.id} className="rounded border border-zinc-100 p-3">
                  <div className="text-sm font-semibold">{post.title}</div>
                  <div className="text-xs text-zinc-500">
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

