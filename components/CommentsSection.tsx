"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";

type Comment = {
  id: string;
  postId: string;
  authorEmail: string;
  authorName: string;
  body: string;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CommentsSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: comments, mutate } = useSWR<Comment[]>(`/api/comments?postId=${postId}`, fetcher);
  const [value, setValue] = useState("");

  async function submitComment() {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    if (!value.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, body: value }),
    });
    if (res.status === 401) {
      router.push("/auth/login");
      return;
    }
    if (res.ok) {
      const created = await res.json();
      mutate([...(comments || []), created], { revalidate: false });
      setValue("");
    }
  }

  async function deleteComment(commentId: string) {
    if (!session) {
      router.push("/auth/login");
      return;
    }
    if (!confirm("Delete this comment?")) return;
    
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      
      if (res.status === 403) {
        alert("You don't have permission to delete this comment");
        return;
      }
      
      if (res.ok) {
        // Optimistically update the UI
        mutate((comments || []).filter((c) => c.id !== commentId), { revalidate: false });
      } else {
        const error = await res.json().catch(() => ({ error: "Failed to delete comment" }));
        alert(error.error || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Delete comment error:", err);
      alert("Failed to delete comment. Please try again.");
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Comments</h3>
      {session ? (
        <div className="space-y-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full rounded border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400"
            rows={3}
          />
          <button
            onClick={submitComment}
            className="rounded bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Post comment
          </button>
        </div>
      ) : (
        <p className="text-sm text-zinc-500">Sign in to comment.</p>
      )}

      <ul className="space-y-3">
        {(comments || []).map((comment) => {
          const isOwnComment = session?.user?.email === comment.authorEmail;
          return (
            <li key={comment.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-zinc-900">{comment.authorName}</p>
                    <p className="text-xs text-zinc-500">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-2 text-sm text-zinc-900 leading-relaxed">{comment.body}</p>
                </div>
                {isOwnComment && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="ml-4 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                    title="Delete comment"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

