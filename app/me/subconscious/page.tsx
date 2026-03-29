"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EntryList, useDiaryEntries } from "../EntryList";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { isSubconsciousEntry } from "@/lib/diaryTypes";

export default function MeSubconsciousPage() {
  const { entries, toggleVisibility, removeEntry } = useDiaryEntries();
  const list = useMemo(
    () => entries.filter((e: DiaryEntry) => isSubconsciousEntry(e)),
    [entries],
  );

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <Link
          href="/me"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
        >
          返回我的房间
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          潜意识书写本
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          从「潜意识书写」写下的图卡与文字，都在这里。
        </p>
      </section>

      <section className="paper-sheet rounded-sm px-5 py-5 sm:px-6 sm:py-6">
        <EntryList
          entries={list}
          onToggle={toggleVisibility}
          onDelete={removeEntry}
          emptyMessage="还没有潜意识书写记录。"
          emptyAction={
            <Link
              href="/explore/oh"
              className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              去潜意识书写
            </Link>
          }
        />
      </section>
    </div>
  );
}
