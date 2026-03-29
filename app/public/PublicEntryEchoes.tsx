"use client";

import { useEffect, useMemo, useState } from "react";
import { MAX_ECHO_LENGTH } from "@/lib/echoTypes";
import type { PublicEcho } from "@/lib/echoTypes";
import {
  ECHO_UPDATED_EVENT,
  addEcho,
  listEchoesForEntry,
} from "@/lib/echoStore";
import { readWriterNickname } from "@/lib/writerNicknameClient";

type Props = {
  entryId: string;
  /** false 时不展示留言入口与列表（预留） */
  echoesEnabled?: boolean;
};

function formatEchoTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PublicEntryEchoes({ entryId, echoesEnabled = true }: Props) {
  const [list, setList] = useState<PublicEcho[]>([]);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setList(listEchoesForEntry(entryId));
  }, [entryId]);

  useEffect(() => {
    const onUpdate = () => setList(listEchoesForEntry(entryId));
    window.addEventListener(ECHO_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(ECHO_UPDATED_EVENT, onUpdate);
  }, [entryId]);

  const trimmed = draft.trim();
  const remaining = useMemo(
    () => MAX_ECHO_LENGTH - draft.length,
    [draft.length],
  );

  const handleSubmit = () => {
    if (!echoesEnabled || submitting) return;
    const body = trimmed;
    if (!body.length) return;
    if (body.length > MAX_ECHO_LENGTH) return;
    setSubmitting(true);
    const nick = readWriterNickname();
    const authorLabel = nick ? nick : "一位路过的人";
    addEcho({ entryId, body, authorLabel });
    setDraft("");
    setSubmitting(false);
    setList(listEchoesForEntry(entryId));
  };

  if (!echoesEnabled) {
    return (
      <section
        className="border-t border-dashed border-[var(--paper-line)] pt-10"
        aria-label="回声"
      >
        <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
          作者已关闭回声。
        </p>
      </section>
    );
  }

  return (
    <section
      className="border-t border-dashed border-[var(--paper-line)] pt-10"
      aria-label="回声"
    >
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-1">
          <h2 className="font-writing-body text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
            回声
          </h2>
          <p className="text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
            读完若有一句话想轻轻放下，可以写在这里
          </p>
        </header>

        <div className="space-y-2">
          <label htmlFor={`echo-draft-${entryId}`} className="sr-only">
            写下回声
          </label>
          <textarea
            id={`echo-draft-${entryId}`}
            rows={2}
            maxLength={MAX_ECHO_LENGTH}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="写一句就好……"
            className="font-writing-body w-full resize-y border-0 border-b border-zinc-200/90 bg-transparent px-0 py-2 text-sm leading-relaxed text-zinc-700 placeholder:text-zinc-300 focus:border-zinc-300 focus:outline-none focus:ring-0 dark:border-zinc-600/80 dark:text-zinc-200 dark:placeholder:text-zinc-600 dark:focus:border-zinc-500"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="tabular-nums text-[10px] text-zinc-400">
              {remaining >= 0 ? `还可输入 ${remaining} 字` : ""}
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!trimmed.length || submitting}
              className="rounded-sm border border-zinc-200/90 bg-transparent px-3 py-1.5 text-xs text-zinc-600 transition hover:border-zinc-300 hover:bg-zinc-50/80 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-900/40"
            >
              留下回声
            </button>
          </div>
        </div>

        {list.length > 0 ? (
          <ul className="space-y-5 border-t border-[var(--paper-line)]/60 pt-6">
            {list.map((e) => (
              <li key={e.id} className="space-y-1.5">
                <p className="text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {e.authorLabel}
                  </span>
                  <span className="mx-1.5 text-zinc-300 dark:text-zinc-600">
                    ·
                  </span>
                  {formatEchoTime(e.createdAt)}
                </p>
                <p className="font-writing-body text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {e.body}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
            还没有回声。若你愿意，可以留下第一句。
          </p>
        )}
      </div>
    </section>
  );
}
