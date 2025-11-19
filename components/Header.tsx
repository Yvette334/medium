'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
];

const authLinks = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'Feed' },
  { href: '/search', label: 'Search' },
  { href: '/editor', label: 'Editor' },
  { href: '/account', label: 'Account' },
  { href: '/profile', label: 'Profile' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const links = session ? authLinks : publicLinks;

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push('/auth/login');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          Medium Lab
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-600">
          {links.map(link => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1 transition ${
                  active ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {status === 'loading' ? null : session ? (
            <button
              onClick={handleLogout}
              className="rounded-full px-3 py-1 text-red-600 hover:bg-red-50 transition"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                href="/auth/register"
                className={`rounded-full px-3 py-1 transition ${
                  pathname === '/auth/register' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'
                }`}
              >
                Register
              </Link>
              <Link
                href="/auth/login"
                className={`rounded-full px-3 py-1 transition ${
                  pathname === '/auth/login' ? 'bg-zinc-900 text-white' : 'hover:bg-zinc-100'
                }`}
              >
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

