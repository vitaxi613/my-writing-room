"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { EXPLORE_JOURNEYS } from "@/lib/questionSystem";
import { readDiaryEntries } from "@/lib/diaryStore";

export default function MeJourneyPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    setEntries(readDiaryEntries());
  }, []);

  const journeyEntries = useMemo(
    () => entries.filter((e) => (e.notebook ?? "daily") === "journey"),
    [entries],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    journeyEntries.forEach((e) => {
      const id = e.journeyId ?? "oh";
      map.set(id, (map.get(id) ?? 0) + 1);
    });
    return map;
  }, [journeyEntries]);

  /** 主题旅程入口；潜意识书写单独在「潜意识书写本」 */
  const list = EXPLORE_JOURNEYS.filter((j) => j.id !== "oh");

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <Link
          href="/me"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
        >
          返回我的房间
        </Link>
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          旅程本
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          从主题旅程里写下的，按旅程分好了。
        </p>
      </section>

      <section className="paper-sheet divide-y divide-[var(--paper-line)] rounded-sm">
        {list.map((j) => (
          <Link
            key={j.id}
            href={`/me/journey/${j.id}`}
            className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50/70 dark:hover:bg-zinc-900/20"
          >
            <div className="min-w-0">
              <p className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {j.title}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                这一册里，放你围绕同一主题写下的记录。
              </p>
            </div>
            <span className="shrink-0 font-writing-body text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
              {counts.get(j.id) ?? 0} 篇
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
