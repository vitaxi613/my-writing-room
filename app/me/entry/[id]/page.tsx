"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { getNotebookLabel } from "@/lib/diaryTypes";
import { readDiaryEntries } from "@/lib/diaryStore";
import { readWriterProfile } from "@/lib/writerProfile";
import { CompanionAssistant } from "@/app/components/CompanionAssistant";

export default function MeEntryPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [entry, setEntry] = useState<DiaryEntry | null | undefined>(undefined);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return;
    }
    const found = readDiaryEntries().find((e) => e.id === id) ?? null;
    setEntry(found);
    if (!found) {
      setCanEdit(false);
      return;
    }
    const profile = readWriterProfile();
    if (!found.writerId) {
      // 兼容旧数据：没有作者字段时仍允许在「我的房间」继续编辑
      setCanEdit(true);
      return;
    }
    setCanEdit(Boolean(profile?.writerId && found.writerId === profile.writerId));
  }, [id]);

  if (entry === undefined) {
    return (
      <div className="py-16 text-center">
        <p className="font-writing-body text-sm text-zinc-500">
          加载中…
        </p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <Link
          href="/me"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          返回我的房间
        </Link>
        <div className="paper-sheet rounded-sm px-6 py-10 text-center">
          <p className="font-writing-body text-sm text-zinc-600 dark:text-zinc-400">
            这篇日记不存在或已被删除。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link
          href="/me"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          返回我的房间
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            一位写字的人 · {getNotebookLabel(entry)}
          </p>
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
            {new Date(entry.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          {entry.title?.trim() ? entry.title : "（无标题）"}
        </h1>

        <CompanionAssistant className="pt-1">
          慢慢读这一页就好。
        </CompanionAssistant>
      </header>

      <article className="paper-sheet rounded-sm px-6 py-8 sm:px-10">
        <div className="font-writing-body whitespace-pre-wrap text-[16px] leading-[1.95] text-zinc-800 dark:text-zinc-200">
          {entry.content}
        </div>
      </article>

      {canEdit ? (
        <div className="flex justify-end">
          <Link
            href={`/me/entry/${entry.id}/edit`}
            className="inline-flex rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            继续编辑
          </Link>
        </div>
      ) : (
        <p className="text-right text-[11px] text-zinc-400 dark:text-zinc-500">
          这是一篇仅阅读内容。
        </p>
      )}
    </div>
  );
}

