'use client';

import Link from 'next/link';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
};

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  const endPage = Math.min(totalPages, startPage + showPages - 1);

  if (endPage - startPage < showPages - 1) {
    startPage = Math.max(1, endPage - showPages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-2">
      {currentPage > 1 && (
        <Link
          href={`${baseUrl}?page=${currentPage - 1}`}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Previous
        </Link>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={`${baseUrl}?page=${page}`}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            page === currentPage
              ? 'bg-zinc-900 text-white'
              : 'border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={`${baseUrl}?page=${currentPage + 1}`}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

