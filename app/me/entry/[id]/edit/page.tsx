"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { getNotebookLabel } from "@/lib/diaryTypes";
import { pickHomeWhisper } from "@/lib/companionPresets";
import { readCompanionPresetId } from "@/lib/companionPreference";
import type { CompanionPresetId } from "@/lib/companionTypes";
import { readDiaryEntries, updateDiaryEntry } from "@/lib/diaryStore";
import { readWriterProfile } from "@/lib/writerProfile";
import { CompanionAssistant } from "@/app/components/CompanionAssistant";
import { DiaryEditorPanel } from "@/app/components/DiaryEditorPanel";

export default function MeEntryEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [entry, setEntry] = useState<DiaryEntry | null | undefined>(undefined);
  const [companionPresetId, setCompanionPresetId] =
    useState<CompanionPresetId>("snail");
  const [isSaving, setIsSaving] = useState(false);
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
      setCanEdit(true);
      return;
    }
    setCanEdit(Boolean(profile?.writerId && found.writerId === profile.writerId));
  }, [id]);

  useEffect(() => {
    setCompanionPresetId(readCompanionPresetId());
  }, []);

  const companionWhisper = useMemo(
    () => pickHomeWhisper(companionPresetId),
    [companionPresetId]
  );

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

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <Link
          href={`/me/entry/${entry.id}`}
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          返回阅读页
        </Link>
        <div className="paper-sheet rounded-sm px-6 py-10 text-center">
          <p className="font-writing-body text-sm text-zinc-600 dark:text-zinc-400">
            你没有编辑这篇内容的权限，仅可阅读。
          </p>
        </div>
      </div>
    );
  }

  const handleSave = (nextTitle: string, nextContent: string) => {
    if (!nextContent.trim() || isSaving) return;
    setIsSaving(true);
    updateDiaryEntry(entry.id, (prev) => ({
      ...prev,
      title: nextTitle.trim() ? nextTitle.trim() : null,
      content: nextContent.trim(),
    }));
    setIsSaving(false);
    router.push(`/me/entry/${entry.id}`);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href={`/me/entry/${entry.id}`}
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          返回阅读页
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            正在编辑 · {getNotebookLabel(entry)}
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
      </header>

      <article className="paper-sheet rounded-sm px-6 py-8 sm:px-10">
        <DiaryEditorPanel
          entryKey={entry.id}
          initialTitle={entry.title ?? ""}
          initialContent={entry.content ?? ""}
          isSaving={isSaving}
          saveLabel="保存修改"
          savingLabel="保存中…"
          topCompanion={
            <CompanionAssistant presetId={companionPresetId}>
              {companionWhisper}
            </CompanionAssistant>
          }
          preEditorHint={
            <p className="text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              顺着这一页继续写，或改成你现在更想说的版本。
            </p>
          }
          onSave={({ title, content }) => handleSave(title, content)}
        />
      </article>
    </div>
  );
}

