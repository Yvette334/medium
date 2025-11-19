"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";

type FollowButtonProps = {
  authorEmail: string;
  initialFollowing: boolean;
};

export function FollowButton({ authorEmail, initialFollowing }: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  async function toggleFollow() {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: authorEmail }),
      });
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Failed to update follow status" }));
        console.error("Follow error:", error);
        alert(error.error || "Failed to update follow status");
        return;
      }
      const data = await res.json();
      setFollowing(data.status === "followed");
      mutate("/api/users/me");
    } catch (err) {
      console.error("Follow error:", err);
      alert("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`rounded-full px-4 py-1 text-sm font-medium ${
        following ? "bg-zinc-900 text-white" : "border border-zinc-300 text-zinc-700"
      }`}
    >
      {following ? "Following" : "Follow"}
    </button>
  );
}

