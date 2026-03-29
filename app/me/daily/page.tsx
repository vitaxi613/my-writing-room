"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EntryList, useDiaryEntries } from "../EntryList";
import type { DiaryEntry } from "@/lib/diaryTypes";

function isDaily(e: DiaryEntry) {
  return (e.notebook ?? "daily") === "daily";
}

export default function MeDailyPage() {
  const { entries, toggleVisibility, removeEntry } = useDiaryEntries();
  const daily = useMemo(() => entries.filter(isDaily), [entries]);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <Link
          href="/me"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
        >
          返回我的房间
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          日常本
        </h1>
        <p className="text-sm text-zinc-600">
          首页自由写、或从「今天的灵感」写下的，都在这里。
        </p>
      </section>

      <section className="paper-sheet rounded-sm px-5 py-5 sm:px-6 sm:py-6">
        <EntryList
          entries={daily}
          onToggle={toggleVisibility}
          onDelete={removeEntry}
          emptyMessage="日常本里还没有内容。"
          emptyAction={
            <Link
              href="/"
              className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              去首页写一点
            </Link>
          }
        />
      </section>
    </div>
  );
}
