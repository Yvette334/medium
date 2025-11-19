'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

const bareRoutes = ['/auth/login', '/auth/register'];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isBare = pathname ? bareRoutes.some(route => pathname.startsWith(route)) : false;

  if (isBare) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white text-zinc-900">
        <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
      <Footer />
    </div>
  );
}

