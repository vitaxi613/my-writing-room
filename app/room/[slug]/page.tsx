"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { readDiaryEntries } from "@/lib/diaryStore";
import { readWriterProfile, type WriterProfile } from "@/lib/writerProfile";

/** 稿目摘录：一行、偏目录感，不抢正文预览的「帖子摘要」感 */
function tocExcerpt(text: string, max = 56) {
  const t = text.trim().replace(/\s+/g, " ");
  const line = t.split("\n")[0] ?? "";
  if (line.length <= max) return line;
  return line.slice(0, max) + "…";
}

function formatTocDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

function formatTraceDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PublicRoomPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [profile, setProfile] = useState<WriterProfile | null>(null);

  useEffect(() => {
    const p = readWriterProfile();
    setProfile(p);
    if (!slug) {
      setEntries([]);
      return;
    }
    const all = readDiaryEntries();
    const list = all
      .filter(
        (e) =>
          e.visibility === "public" &&
          e.writerSlug === slug &&
          typeof e.writerSlug === "string",
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    setEntries(list);
  }, [slug]);

  const isOwnRoom = profile?.writerSlug === slug;
  const displayName = isOwnRoom
    ? profile?.nickname?.trim() || "一位写字的人"
    : entries[0]?.writerNicknameSnapshot?.trim() || "一位写字的人";
  const bio = isOwnRoom ? profile?.bio?.trim() : null;

  const latestAt = entries[0]?.createdAt;

  const traceLine = useMemo(() => {
    if (entries.length === 0) {
      if (isOwnRoom) {
        return "这间屋子还安静着。若想留一点给路过的人看，把某篇日记设为公开，它会出现在这张桌上。";
      }
      return "还没有可以掀开的页。也许主人刚搬走墨迹，或只把字收在抽屉里。";
    }
    const n = entries.length;
    const latest = latestAt ? formatTraceDate(latestAt) : "";
    return `桌上有 ${n} 篇可供翻阅${latest ? `；最近一次留下字迹，是 ${latest}` : ""}。`;
  }, [entries.length, isOwnRoom, latestAt]);

  if (!slug) {
    return (
      <div className="py-24 text-center">
        <p className="font-writing-body text-sm text-zinc-500/90">
          这扇门后没有房间。
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl pb-28 pt-4 sm:pt-6">
      <p className="mb-14 sm:mb-16">
        <Link
          href="/public"
          className="text-[11px] text-zinc-400 transition hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          ← 回到共写空间
        </Link>
      </p>

      <header className="mb-16 space-y-5 sm:mb-20 sm:space-y-6">
        <p className="font-writing-body text-[12px] leading-relaxed text-zinc-400/95 dark:text-zinc-500">
          一间写字的房间
        </p>
        <h1 className="font-writing-body text-[1.35rem] font-normal leading-snug tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-[1.5rem]">
          {displayName}
        </h1>
        <p className="max-w-md text-[12px] leading-[1.85] text-zinc-500/88 dark:text-zinc-500/90">
          {traceLine}
        </p>
        {bio ? (
          <blockquote className="border-l border-stone-200/70 py-0.5 pl-4 text-[13px] leading-[1.9] text-zinc-500/95 dark:border-zinc-600/45 dark:text-zinc-400/95">
            {bio}
          </blockquote>
        ) : null}
      </header>

      <section aria-labelledby="room-toc-heading" className="space-y-8">
        <div className="space-y-1.5">
          <h2
            id="room-toc-heading"
            className="font-writing-body text-[11px] font-normal tracking-[0.04em] text-zinc-400 dark:text-zinc-500"
          >
            留在桌上的篇目
          </h2>
          <p className="text-[10px] leading-relaxed text-zinc-400/65 dark:text-zinc-500/70">
            仅列出已公开的文稿，像目录，不像墙。
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="border-t border-b border-[var(--paper-line)] py-14 text-center">
            <p className="mx-auto max-w-xs font-writing-body text-[13px] leading-loose text-zinc-500/90 dark:text-zinc-400/90">
              这张桌子暂时是空的。
            </p>
          </div>
        ) : (
          <ul className="m-0 list-none p-0">
            {entries.map((e, idx) => (
              <li
                key={e.id}
                className={
                  idx > 0 ? "border-t border-[var(--paper-line)]" : undefined
                }
              >
                <Link
                  href={`/public/entry/${e.id}`}
                  className="group -mx-1 block rounded-[2px] px-1 py-5 transition-colors hover:bg-[rgba(255,253,247,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-300/50 dark:hover:bg-zinc-900/35 dark:focus-visible:ring-zinc-600/50"
                >
                  <div className="flex gap-5 sm:gap-8">
                    <div className="flex w-[4.5rem] shrink-0 flex-col items-end gap-1 pt-0.5 sm:w-[5rem]">
                      <span
                        className="font-mono text-[10px] tabular-nums text-zinc-300/90 dark:text-zinc-600"
                        aria-hidden
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <time
                        dateTime={e.createdAt}
                        className="font-mono text-[11px] tabular-nums text-zinc-400/80 dark:text-zinc-500/85"
                      >
                        {formatTocDate(e.createdAt)}
                      </time>
                    </div>
                    <div className="min-w-0 flex-1 border-l border-[var(--paper-line)] pl-5 sm:pl-6">
                      <p className="font-writing-body text-[0.9375rem] font-normal leading-snug text-zinc-800 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                        {e.title?.trim() ? e.title : "无题"}
                      </p>
                      {e.content?.trim() ? (
                        <p className="font-writing-body mt-2 text-[12.5px] leading-relaxed text-zinc-500/75 line-clamp-2 dark:text-zinc-500/80">
                          {tocExcerpt(e.content)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
