"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { getNotebookLabel, isActiveDiaryEntry } from "@/lib/diaryTypes";
import {
  DIARY_UPDATED_EVENT,
  deleteDiaryEntry,
  readDiaryEntries,
  writeDiaryEntries,
} from "@/lib/diaryStore";

type Props = {
  entries: DiaryEntry[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  emptyMessage: string;
  emptyAction?: React.ReactNode;
};

export function EntryList({
  entries,
  onToggle,
  onDelete,
  emptyMessage,
  emptyAction,
}: Props) {
  const visibleEntries = entries.filter(isActiveDiaryEntry);

  const grouped = new Map<string, DiaryEntry[]>();
  visibleEntries.forEach((e) => {
    const day = new Date(e.createdAt).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const arr = grouped.get(day) ?? [];
    arr.push(e);
    grouped.set(day, arr);
  });
  const groups = Array.from(grouped.entries());

  if (visibleEntries.length === 0) {
    return (
      <div className="paper-sheet rounded-sm px-6 py-10 text-center">
        <p className="font-writing-body text-sm text-zinc-600 dark:text-zinc-400">
          {emptyMessage}
        </p>
        {emptyAction && <div className="mt-4">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(([day, items], groupIdx) => (
        <div
          key={day || String(groupIdx)}
          className="rounded-sm border border-[var(--paper-line)] bg-[rgba(255,253,247,0.55)] px-4 py-3 shadow-[0_1px_0_rgba(15,23,42,0.02)] dark:bg-black/10 sm:px-5 sm:py-4"
        >
          <p className="mb-2 text-[11px] font-medium tracking-[0.18em] text-zinc-400 tabular-nums">
            {day}
          </p>
          <div className="divide-y divide-[var(--paper-line)]">
            {items.map((e, itemIdx) => (
              <article
                key={e.id || e.createdAt || `${day}-${itemIdx}`}
                className="group flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link
                    href={`/me/entry/${e.id}`}
                    className="block min-w-0"
                    prefetch={false}
                  >
                    <p className="text-[10px] tabular-nums text-zinc-400">
                      {new Date(e.createdAt).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </p>
                    <p className="font-writing-body truncate text-sm font-semibold text-zinc-900 underline decoration-zinc-200 underline-offset-4 hover:decoration-zinc-400 dark:text-zinc-100">
                      {e.title?.trim() ? e.title : "（无标题）"}
                    </p>

                    {/* 目录页只保留一眼可读的短摘要，弱化“论坛帖子卡片感” */}
                    <p className="font-writing-body mt-1 line-clamp-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {e.content}
                    </p>

                    <p className="mt-2 text-[11px] text-zinc-400">
                      {getNotebookLabel(e)}
                    </p>
                  </Link>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    type="button"
                    onClick={() => e.id && onToggle(e.id)}
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] transition hover:opacity-90 ${
                      e.visibility === "public"
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                        : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                    title="点击切换公开/私密"
                    disabled={!e.id}
                  >
                    {e.visibility === "public" ? "设为私密" : "设为公开"}
                  </button>
                  <button
                    type="button"
                    onClick={() => e.id && onDelete(e.id)}
                    className="rounded-full border border-[var(--paper-line)] bg-transparent px-2.5 py-1 text-[11px] text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-700 dark:hover:bg-zinc-800/50"
                    disabled={!e.id}
                  >
                    删除
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function useDiaryEntries() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  useEffect(() => {
    setEntries(readDiaryEntries());
  }, []);

  useEffect(() => {
    const handler = () => {
      setEntries(readDiaryEntries());
    };
    window.addEventListener(DIARY_UPDATED_EVENT, handler);
    return () => {
      window.removeEventListener(DIARY_UPDATED_EVENT, handler);
    };
  }, []);

  const persist = (next: DiaryEntry[]) => {
    // 以 localStorage 为最终数据源，避免“列表残影”
    writeDiaryEntries(next);
    setEntries(readDiaryEntries());
  };

  const toggleVisibility = (id: string) => {
    const current = readDiaryEntries();
    const next = current.map((e): DiaryEntry =>
      e.id === id
        ? {
            ...e,
            visibility: e.visibility === "public" ? "locked" : "public",
            updatedAt: Date.now(),
          }
        : e,
    );
    persist(next);
    setEntries(readDiaryEntries());
  };

  const removeEntry = (id: string) => {
    deleteDiaryEntry(id);
    setEntries(readDiaryEntries());
  };

  return { entries, persist, toggleVisibility, removeEntry };
}
