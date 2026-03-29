"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { getQuestionById } from "@/lib/questionSystem";
import { readDiaryEntries } from "@/lib/diaryStore";
import { EntryAuthorHeader } from "@/app/components/EntryAuthorHeader";

/** 取一条可做「金句」的片段：首句或前约 50 字 */
function snippet(text: string, maxLen = 56) {
  const t = text.trim();
  const firstLine = t.split(/\n/)[0]?.trim() ?? t;
  if (firstLine.length <= maxLen) return firstLine;
  return firstLine.slice(0, maxLen) + "…";
}

/** 按问题聚合：只认 source.questionId，保证展示的是“具体问题” */
function getQuestionKey(e: DiaryEntry): string | null {
  if (e.source?.questionId) return e.source.questionId;
  return null;
}

function getQuestionDisplayTitle(questionId: string): string {
  if (questionId === "oh") return "潜意识书写";
  const q = getQuestionById(questionId);
  return q?.title ?? questionId;
}

const backLinkClass =
  "text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200";

export function PublicSquare() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  useEffect(() => {
    setEntries(readDiaryEntries());
  }, []);

  const publicEntries = useMemo(
    () =>
      entries
        .filter((e) => e.visibility === "public")
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [entries]
  );

  const quotes = useMemo(
    () =>
      publicEntries
        .slice(0, 6)
        .map((e) => ({ id: e.id, text: snippet(e.content), title: e.title })),
    [publicEntries]
  );

  /** 大家正在写这些问题：按 questionId / 问题标题 聚合 */
  const byQuestion = useMemo(() => {
    const map = new Map<string, DiaryEntry[]>();
    publicEntries.forEach((e) => {
      const key = getQuestionKey(e);
      if (!key) return;
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    });
    return Array.from(map.entries()).map(([key, items]) => ({
      questionId: key,
      title: getQuestionDisplayTitle(key),
      count: items.length,
      latest: items[0],
    }));
  }, [publicEntries]);

  return (
    <div className="space-y-14">
      {/* 今天被写下的话：日签感，单列稿纸，避免卡片墙 */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          今天被写下的话
        </h2>
        {quotes.length > 0 ? (
          <div className="paper-sheet divide-y divide-[var(--paper-line)] rounded-sm">
            {quotes.map((q, idx) => (
              <blockquote
                key={q.id || idx}
                className="border-l-2 border-l-zinc-200/90 px-5 py-4 dark:border-l-zinc-600"
              >
                <p className="font-writing-body text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  「{q.text}」
                </p>
                {q.title?.trim() && (
                  <p className="mt-2 font-writing-hand text-xs text-zinc-400">
                    {q.title}
                  </p>
                )}
              </blockquote>
            ))}
          </div>
        ) : (
          <div className="paper-sheet rounded-sm px-5 py-8 text-center">
            <p className="font-writing-body text-sm text-zinc-500 dark:text-zinc-400">
              还没有人公开写下的话。你在「我的房间」里把某篇设为公开，就会出现在这里。
            </p>
          </div>
        )}
      </section>

      {/* 大家正在写这些问题 */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          大家正在写这些问题
        </h2>
        {byQuestion.length > 0 ? (
          <div className="paper-sheet divide-y divide-[var(--paper-line)] rounded-sm">
            {byQuestion.map((q) => (
              <Link
                key={q.questionId}
                href={`/public/question/${encodeURIComponent(q.questionId)}`}
                className="flex items-baseline justify-between gap-4 px-5 py-4 transition hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30"
              >
                <div className="min-w-0">
                  <p className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {q.title}
                  </p>
                  {q.latest && (
                    <p className="font-writing-body mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      「{snippet(q.latest.content, 44)}」
                    </p>
                  )}
                </div>
                <span className="shrink-0 font-writing-body text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                  {q.count} 篇
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="paper-sheet rounded-sm px-5 py-8 text-center">
            <p className="font-writing-body text-sm text-zinc-500 dark:text-zinc-400">
              暂无按问题聚合的公开内容。从「找灵感」选一个问题写，写完在「我的房间」设为公开即可。
            </p>
          </div>
        )}
      </section>

      {/* 最新公开日记流 */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          最新公开日记
        </h2>
        {publicEntries.length > 0 ? (
          <ul className="divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
            {publicEntries.map((e, idx) => {
              return (
                <li
                  key={e.id || e.createdAt || idx}
                  className="py-5 first:pt-0 last:pb-0 sm:py-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <EntryAuthorHeader entry={e} />
                      <p className="font-writing-body mt-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {e.title?.trim() ? e.title : "（无标题）"}
                      </p>
                      <p className="font-writing-body mt-2 line-clamp-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {e.content}
                      </p>
                      <p className="mt-3">
                        <Link
                          href={`/public/entry/${e.id}`}
                          className={`${backLinkClass} font-writing-body text-[13px]`}
                        >
                          读全文
                        </Link>
                      </p>
                    </div>
                    <time
                      className="shrink-0 text-right text-[11px] tabular-nums text-zinc-400"
                      dateTime={e.createdAt}
                    >
                      {new Date(e.createdAt).toLocaleDateString("zh-CN", {
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="paper-sheet rounded-sm px-5 py-8 text-center">
            <p className="font-writing-body text-sm text-zinc-500 dark:text-zinc-400">
              还没有公开日记。在「我的房间」里把某篇设为公开即可。
            </p>
          </div>
        )}
      </section>

      <p className="text-center text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
        点赞、评论与访客主页等功能仍在占位，当前以阅读为主。
      </p>
    </div>
  );
}
