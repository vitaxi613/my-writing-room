"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { isSubconsciousEntry } from "@/lib/diaryTypes";
import { getExploreJourneyTitle } from "@/lib/questionSystem";
import { RecoveryBindingHint } from "@/app/components/RecoveryBindingHint";
import { FirstEntryRecoveryBanner } from "@/app/components/FirstEntryRecoveryBanner";
import { WritingCompanion } from "@/app/components/WritingCompanion";
import { readDiaryEntries } from "@/lib/diaryStore";

function normalizeNotebook(
  e: DiaryEntry,
): "daily" | "journey" | "create" | "subconscious" {
  if (e.notebook === "journey" || e.notebook === "create") return e.notebook;
  if (e.notebook === "subconscious") return "subconscious";
  return "daily";
}

export default function MePage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setEntries(readDiaryEntries());
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const dailyCount = useMemo(
    () => entries.filter((e) => normalizeNotebook(e) === "daily").length,
    [entries],
  );
  const createCount = useMemo(
    () => entries.filter((e) => normalizeNotebook(e) === "create").length,
    [entries],
  );

  const subconsciousCount = useMemo(
    () => entries.filter((e) => isSubconsciousEntry(e)).length,
    [entries],
  );

  /** 只显示已经写过的旅程：journeyId -> 篇数（不含潜意识书写 oh） */
  const journeyCounts = useMemo(() => {
    const map = new Map<string, number>();
    entries
      .filter(
        (e) =>
          normalizeNotebook(e) === "journey" &&
          e.journeyId &&
          e.journeyId !== "oh",
      )
      .forEach((e) => {
        const id = e.journeyId!;
        map.set(id, (map.get(id) ?? 0) + 1);
      });
    return Array.from(map.entries()).map(([id, count]) => ({
      journeyId: id,
      count,
      title: getExploreJourneyTitle(id),
    }));
  }, [entries]);

  return (
    <div className="space-y-10">
      <FirstEntryRecoveryBanner />
      <section className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          我的房间
        </p>
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-[1.75rem] dark:text-zinc-50">
          我的日记本
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          写完默认公开，你可以随时在这里设为私密。也可以删除不想保留的内容。
        </p>
        <WritingCompanion variant="me" className="pt-1" />
        <RecoveryBindingHint className="pt-2" />
      </section>

      <section className="paper-sheet divide-y divide-[var(--paper-line)] rounded-sm">
        <Link
          href="/me/daily"
          className="flex items-baseline justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
        >
          <div className="min-w-0">
            <span className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              日常本
            </span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              首页自由写、今日灵感写下的
            </p>
          </div>
          <span className="shrink-0 font-writing-body text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
            {dailyCount} 篇
          </span>
        </Link>
        <Link
          href="/me/create"
          className="flex items-baseline justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
        >
          <div className="min-w-0">
            <span className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              创作本
            </span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              从创作池入口写下的
            </p>
          </div>
          <span className="shrink-0 font-writing-body text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
            {createCount} 篇
          </span>
        </Link>
        <Link
          href="/me/subconscious"
          className="flex items-baseline justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
        >
          <div className="min-w-0">
            <span className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              潜意识书写本
            </span>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              图卡 + 自由书写
            </p>
          </div>
          <span className="shrink-0 font-writing-body text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
            {subconsciousCount} 篇
          </span>
        </Link>
        {journeyCounts.map(({ journeyId, count, title }) => (
          <Link
            key={journeyId}
            href={`/me/journey/${journeyId}`}
            className="flex items-baseline justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
          >
            <div className="min-w-0">
              <span className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {title}
              </span>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">旅程本</p>
            </div>
            <span className="shrink-0 font-writing-body text-sm tabular-nums text-zinc-600 dark:text-zinc-300">
              {count} 篇
            </span>
          </Link>
        ))}
      </section>

      <section className="space-y-2">
        <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          其他
        </p>
        <div className="flex flex-col gap-0 border-t border-[var(--paper-line)]">
          <Link
            href="/inspiration"
            className="border-b border-[var(--paper-line)] py-3 text-sm text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            找灵感
          </Link>
          <Link
            href="/public"
            className="py-3 text-sm text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            共写空间
          </Link>
        </div>
      </section>
    </div>
  );
}
