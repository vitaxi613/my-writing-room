"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DiaryEntry } from "@/lib/diaryTypes";
import type { InspirationJourney } from "@/lib/questionSystem";
import { EXPLORE_JOURNEYS } from "@/lib/questionSystem";
import { readDiaryEntries } from "@/lib/diaryStore";

type Badge = "免费开始" | "已解锁" | "付费解锁";

function getBadge(
  journey: InspirationJourney,
  hasWritten: boolean
): Badge {
  if (hasWritten) return "已解锁";
  if (journey.access === "free") return "免费开始";
  return "付费解锁";
}

export function JourneyCards() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    setEntries(readDiaryEntries());
  }, []);

  const writtenJourneyIds = useMemo(
    () =>
      new Set(
        entries
          .filter((e) => e.notebook === "journey" && e.journeyId)
          .map((e) => e.journeyId!)
      ),
    [entries]
  );

  const themeOnly = EXPLORE_JOURNEYS.filter((j) => j.id !== "oh");

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {themeOnly.map((j) => {
        const href = j.href ?? `/journeys/journey/${j.id}`;
        const badge = getBadge(j, writtenJourneyIds.has(j.id));
        const sub = j.questionIds?.length ? "7 天旅程" : "书写旅程";

        return (
          <Link
            key={j.id}
            href={href}
            className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.2)] transition hover:bg-white"
          >
            <div className="mb-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] ${
                  badge === "已解锁"
                    ? "bg-emerald-50 text-emerald-700"
                    : badge === "付费解锁"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {badge}
              </span>
            </div>
            <p className="text-sm font-medium text-zinc-900">{j.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {j.description}
            </p>
            <p className="mt-3 text-xs text-zinc-400">{sub}</p>
          </Link>
        );
      })}
    </div>
  );
}
