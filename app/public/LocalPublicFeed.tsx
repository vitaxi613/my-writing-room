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

const backLinkClass =
  "text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200";

export function LocalPublicFeed() {
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

  const publicEntries = useMemo(() => {
    return entries.filter((e) => e.visibility === "public");
  }, [entries]);

  return (
    <section className="space-y-4">
      <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
        来自你的公开日记（本机）
      </p>

      {publicEntries.length > 0 ? (
        <ul className="divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
          {publicEntries.slice(0, 8).map((e, idx) => (
            <li
              key={e.id || e.createdAt || String(idx)}
              className="py-5 first:pt-0 last:pb-0 sm:py-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {e.title?.trim() ? e.title : "（无标题）"}
                  </p>
                  <p className="font-writing-body mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {e.content}
                  </p>
                  {e.source?.title && (
                    <p className="mt-2 line-clamp-1 text-xs text-zinc-400">
                      开头：{e.source.title}
                    </p>
                  )}
                </div>
                <time className="shrink-0 text-right text-[11px] tabular-nums text-zinc-400">
                  {new Date(e.createdAt).toLocaleDateString("zh-CN", {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </time>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="paper-sheet rounded-sm px-5 py-8 text-center">
          <p className="font-writing-body text-sm text-zinc-600 dark:text-zinc-400">
            你还没有公开过任何一篇日记。
          </p>
          <div className="mt-3">
            <Link href="/me" className={backLinkClass}>
              去我的房间把某篇设为公开
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
