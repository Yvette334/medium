'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      setMessage('Email and password required');
      return;
    }
    if (!email.includes('@')) {
      setMessage('Enter a valid email');
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 chars');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Registration failed');
        return;
      }
      router.push('/auth/login');
    } catch {
      setMessage('Error registering.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-sm uppercase tracking-widest text-zinc-500">Welcome</p>
        <h1 className="text-3xl font-semibold text-zinc-900">Create your account</h1>
        <p className="text-sm text-zinc-500">Join the community and start publishing today.</p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white/90 p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">Full name</label>
          <input
            placeholder="Enter your name"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">Email</label>
          <input
            placeholder="Enter your email"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-600">Password</label>
          <input
            type="password"
            placeholder="Enter at least 6 characters"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-zinc-400 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          onClick={handleRegister}
          className="w-full rounded-full bg-zinc-900 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? 'Creating account…' : 'Sign Up'}
        </button>
        {message && <p className="text-sm text-center text-zinc-500">{message}</p>}
        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <a className="font-semibold text-zinc-900 underline" href="/auth/login">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
