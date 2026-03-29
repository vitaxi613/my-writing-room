"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { EntryList, useDiaryEntries } from "../../EntryList";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { getExploreJourneyTitle } from "@/lib/questionSystem";

export default function MeJourneyIdPage() {
  const params = useParams();
  const journeyId = typeof params.journeyId === "string" ? params.journeyId : "";
  const { entries, toggleVisibility, removeEntry } = useDiaryEntries();

  const filtered = useMemo(
    () =>
      entries.filter(
        (e) => (e.notebook ?? "daily") === "journey" && e.journeyId === journeyId,
      ),
    [entries, journeyId],
  );

  const title = getExploreJourneyTitle(journeyId);

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <Link
          href="/me/journey"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
        >
          返回旅程本
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
      </section>

      <section className="paper-sheet rounded-sm px-5 py-5 sm:px-6 sm:py-6">
        <EntryList
          entries={filtered}
          onToggle={toggleVisibility}
          onDelete={removeEntry}
          emptyMessage={`「${title}」里还没有内容。`}
          emptyAction={
            <Link
              href={journeyId === "oh" ? "/explore/oh" : "/inspiration"}
              className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              {journeyId === "oh" ? "去抽一张 OH 卡" : "去找灵感写这道旅程"}
            </Link>
          }
        />
      </section>
    </div>
  );
}
