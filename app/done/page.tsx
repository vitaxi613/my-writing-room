"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Draft = {
  content: string;
  createdAt: string;
};

export default function DonePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem("wo-writing-room-draft");
    if (!raw) return;
    try {
      setDraft(JSON.parse(raw));
    } catch {
      setDraft(null);
    }
  }, []);

  const saveToDiary = (visibility: "private" | "public") => {
    if (!draft?.content?.trim()) return;
    const key = "wo-writing-room-diary-entries";
    const existingRaw = window.localStorage.getItem(key);
    const existing = existingRaw ? JSON.parse(existingRaw) : [];
    existing.unshift({
      visibility,
      content: draft.content.trim(),
      createdAt: draft.createdAt,
    });
    window.localStorage.setItem(key, JSON.stringify(existing));
    window.localStorage.removeItem("wo-writing-room-draft");
  };

  return (
    <div className="min-h-[60vh] flex items-center">
      <div className="w-full space-y-6 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.03)]">
        <div className="space-y-2">
          <p className="text-sm text-zinc-700">这段话，想放在哪里？</p>
          {!draft?.content?.trim() && (
            <p className="text-xs text-zinc-400">
              你还没有写内容。回去写一点再来。
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={!draft?.content?.trim()}
            onClick={() => {
              saveToDiary("private");
              router.push("/me");
            }}
            className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            收进我的房间
          </button>

          <button
            type="button"
            disabled={!draft?.content?.trim()}
            onClick={() => {
              saveToDiary("public");
              router.push("/public");
            }}
            className="inline-flex w-full items-center justify-center rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:bg-zinc-200"
          >
            放进共写空间
          </button>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex w-full items-center justify-center rounded-full border border-transparent bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-zinc-50"
          >
            再改改
          </button>
        </div>
      </div>
    </div>
  );
}

