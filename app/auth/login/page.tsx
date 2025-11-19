'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (!res?.error) {
      router.push('/profile');
    } else {
      setError('Invalid credentials, please try again.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm uppercase tracking-widest text-zinc-500">Welcome back</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Sign in to continue</h1>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">Email</label>
          <input
            placeholder="Enter you email"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">Password</label>
          <input
            type="password"
            placeholder="Your password"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
        {error && <p className="text-sm text-center text-red-500">{error}</p>}
        <p className="text-center text-sm text-zinc-500">
          Need an account?{' '}
          <a className="font-semibold text-zinc-900 underline" href="/auth/register">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}
