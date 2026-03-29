"use client";

import Link from "next/link";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { getNotebookLabel } from "@/lib/diaryTypes";
import { resolveEntryAuthor } from "@/lib/entryAuthorClient";

type Props = {
  entry: DiaryEntry;
  className?: string;
};

function firstVisibleChar(name: string): string {
  const t = name.trim();
  if (!t) return "写";
  return Array.from(t)[0] ?? "写";
}

/**
 * 统一作者入口：默认头像 + 作者名 + 分册名。
 * - 有 writerSlug：头像与作者名可点击进 /room/[slug]
 * - 无 writerSlug：纯展示
 */
export function EntryAuthorHeader({ entry, className = "" }: Props) {
  const author = resolveEntryAuthor(entry);
  const notebookLabel = getNotebookLabel(entry);
  const initial = firstVisibleChar(author.name);

  const avatarNode = (
    <span
      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-zinc-200/90 bg-zinc-50 text-[11px] font-medium text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300"
      aria-hidden
    >
      {initial}
    </span>
  );

  const authorNameNode = author.slug ? (
    <Link
      href={`/room/${author.slug}`}
      className="underline decoration-zinc-300/80 underline-offset-2 hover:text-zinc-600 dark:hover:text-zinc-300"
    >
      {author.name}
    </Link>
  ) : (
    <span>{author.name}</span>
  );

  return (
    <p
      className={`flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500 ${className}`}
    >
      {author.slug ? (
        <Link href={`/room/${author.slug}`} className="shrink-0">
          {avatarNode}
        </Link>
      ) : (
        avatarNode
      )}
      {authorNameNode}
      <span className="text-zinc-300 dark:text-zinc-600">·</span>
      <span>{notebookLabel}</span>
    </p>
  );
}

