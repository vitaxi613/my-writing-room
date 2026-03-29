"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { getQuestionById } from "@/lib/questionSystem";
import { readDiaryEntries } from "@/lib/diaryStore";
import { EntryAuthorHeader } from "@/app/components/EntryAuthorHeader";

function getQuestionDisplayTitle(questionId: string, fallback?: string): string {
  if (questionId === "oh") return "潜意识书写";
  const q = getQuestionById(questionId);
  return q?.title ?? fallback ?? questionId;
}

const backLinkClass =
  "text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200";

export default function PublicQuestionPage() {
  const params = useParams();
  const rawId = typeof params.questionId === "string" ? params.questionId : "";
  const questionId = decodeURIComponent(rawId);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    setEntries(readDiaryEntries());
  }, []);

  const list = useMemo(
    () =>
      entries
        .filter((e) => {
          if (e.visibility !== "public") return false;
          return e.source?.questionId === questionId;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [entries, questionId]
  );

  const title = getQuestionDisplayTitle(
    questionId,
    list[0]?.source?.title ?? undefined
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link href="/public" className={backLinkClass}>
          返回共写空间
        </Link>
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        <p className="font-writing-body text-sm text-zinc-600 dark:text-zinc-400">
          这个问题下的公开书写，共 {list.length} 篇。
        </p>
      </header>

      <section>
        {list.length > 0 ? (
          <ul className="divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
            {list.map((e) => {
              return (
                <li key={e.id} className="py-5 first:pt-0 last:pb-0 sm:py-6">
                  <EntryAuthorHeader entry={e} />
                  <p className="font-writing-body mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {e.title?.trim() ? e.title : "（无标题）"}
                  </p>
                  <p className="font-writing-body mt-2 line-clamp-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {e.content}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <time
                      className="text-[11px] tabular-nums text-zinc-400"
                      dateTime={e.createdAt}
                    >
                      {new Date(e.createdAt).toLocaleDateString("zh-CN")}
                    </time>
                    <Link
                      href={`/public/entry/${e.id}`}
                      className={`${backLinkClass} font-writing-body text-[13px]`}
                    >
                      读全文
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="paper-sheet rounded-sm px-5 py-10 text-center">
            <p className="font-writing-body text-sm text-zinc-500 dark:text-zinc-400">
              这个问题下还没有公开书写。
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
