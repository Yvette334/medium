"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type ClapButtonProps = {
  postId: string;
  initialClaps: number;
};

export function ClapButton({ postId, initialClaps }: ClapButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [claps, setClaps] = useState(initialClaps);
  const [loading, setLoading] = useState(false);

  async function handleClap() {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/claps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setClaps(data.claps);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClap}
      disabled={loading}
      className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
    >
      👏 {claps}
    </button>
  );
}

