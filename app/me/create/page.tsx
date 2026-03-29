"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EntryList, useDiaryEntries } from "../EntryList";
import type { DiaryEntry } from "@/lib/diaryTypes";

function isCreate(e: DiaryEntry) {
  return e.notebook === "create";
}

export default function MeCreatePage() {
  const { entries, toggleVisibility, removeEntry } = useDiaryEntries();
  const createEntries = useMemo(() => entries.filter(isCreate), [entries]);

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
          创作本
        </h1>
        <p className="text-sm text-zinc-600">
          从创作池入口写下的，都在这里。
        </p>
      </section>

      <section className="paper-sheet rounded-sm px-5 py-5 sm:px-6 sm:py-6">
        <EntryList
          entries={createEntries}
          onToggle={toggleVisibility}
          onDelete={removeEntry}
          emptyMessage="创作本里还没有内容。"
          emptyAction={
            <Link
              href="/journeys/create"
              className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              去创作池选一道写
            </Link>
          }
        />
      </section>
    </div>
  );
}
