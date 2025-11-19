'use client';

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-center ">&copy; {new Date().getFullYear()} Medium Lab</p>
      </div>
    </footer>
  );
}

