"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type DiaryEntry = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  visibility: "locked" | "public";
  source?: { kind: string; title: string; journeyId: string | null } | null;
};

const STORAGE_KEY = "wo-writing-room-diary-entries";

export function JourneyLocalPublic({ journeyId }: { journeyId: string }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setEntries(parsed);
    } catch {
      // ignore
    }
  }, []);

  const matched = useMemo(() => {
    return entries.filter(
      (e) =>
        e.visibility === "public" &&
        e.source?.journeyId &&
        e.source.journeyId === journeyId,
    );
  }, [entries, journeyId]);

  return (
    <section className="space-y-3">
      <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
        同旅程的公开日记（本机）
      </p>

      {matched.length > 0 ? (
        <div className="space-y-2">
          {matched.slice(0, 6).map((e) => (
            <article
              key={e.id}
              className="rounded-2xl border border-zinc-200/80 bg-white/90 p-4 shadow-[0_1px_0_rgba(148,163,184,0.2)]"
            >
              <p className="text-sm font-medium text-zinc-900">
                {e.title?.trim() ? e.title : "（无标题）"}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 line-clamp-3">
                {e.content}
              </p>
              {e.source?.title && (
                <p className="mt-2 text-xs text-zinc-400 line-clamp-1">
                  开头：{e.source.title}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/60 p-5 text-sm text-zinc-600">
          这里还没有公开的同旅程日记。
          <div className="mt-2">
            <Link
              href="/me"
              className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
            >
              去我的房间把某篇设为公开
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

