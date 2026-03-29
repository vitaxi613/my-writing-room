"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { readDiaryEntries } from "@/lib/diaryStore";
import { EntryAuthorHeader } from "@/app/components/EntryAuthorHeader";
import { PublicEntryEchoes } from "@/app/public/PublicEntryEchoes";

const backLinkClass =
  "text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200";

export default function PublicEntryPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [entry, setEntry] = useState<DiaryEntry | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setEntry(null);
      return;
    }
    const found = readDiaryEntries().find(
      (e: DiaryEntry) => e.id === id && e.visibility === "public"
    );
    setEntry(found ?? null);
  }, [id]);

  if (entry === undefined) {
    return (
      <div className="py-16 text-center">
        <p className="font-writing-body text-sm text-zinc-500">加载中…</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <Link href="/public" className={backLinkClass}>
          返回共写空间
        </Link>
        <div className="paper-sheet rounded-sm px-6 py-10 text-center">
          <p className="font-writing-body text-sm text-zinc-600 dark:text-zinc-400">
            这篇日记不存在或未公开。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <Link href="/public" className={backLinkClass}>
          返回共写空间
        </Link>
        <EntryAuthorHeader entry={entry} />
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          {entry.title?.trim() ? entry.title : "（无标题）"}
        </h1>
        <p className="text-xs tabular-nums text-zinc-400">
          {new Date(entry.createdAt).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })}
        </p>
      </header>

      <article className="paper-sheet rounded-sm px-6 py-7 sm:px-8 sm:py-9">
        <div className="font-writing-body whitespace-pre-wrap text-[16px] leading-[1.85] text-zinc-800 dark:text-zinc-200">
          {entry.content}
        </div>
      </article>

      <PublicEntryEchoes
        entryId={entry.id}
        echoesEnabled={entry.echoesEnabled !== false}
      />
    </div>
  );
}
