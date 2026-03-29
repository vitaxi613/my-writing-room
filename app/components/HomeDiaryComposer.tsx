"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getQuestionById, getJourneyById } from "@/lib/questionSystem";
import { FREE_WRITING_PROMPTS, TODAY_SPEECH_PROMPTS } from "@/lib/prompts";
import type { DiaryEntry, NotebookKind } from "@/lib/diaryTypes";
import { prependDiaryEntry } from "@/lib/diaryStore";
import { pickHomeWhisper } from "@/lib/companionPresets";
import { readCompanionPresetId } from "@/lib/companionPreference";
import type { CompanionPresetId } from "@/lib/companionTypes";
import { CompanionAssistant } from "./CompanionAssistant";
import { DiaryEditorPanel } from "./DiaryEditorPanel";

type Props = {
  fallbackQuestionTitle: string | null;
};

export function HomeDiaryComposer({ fallbackQuestionTitle }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);

  const [companionPresetId, setCompanionPresetId] =
    useState<CompanionPresetId>("snail");

  const [activeHint, setActiveHint] = useState<{
    kind: "question" | "free" | "speech";
    title: string;
    journeyId?: string;
  } | null>(null);

  const companionWhisper = useMemo(
    () => pickHomeWhisper(companionPresetId),
    [companionPresetId]
  );

  useEffect(() => {
    setCompanionPresetId(readCompanionPresetId());
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem("wo-writing-room-draft");
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      if (draft?.content && !content) setContent(draft.content);
      if (draft?.title && !title) setTitle(draft.title);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const hintId = searchParams.get("hint");
    const freeIdxRaw = searchParams.get("free");
    const speechIdxRaw = searchParams.get("speech");
    const journeyId = searchParams.get("journey") ?? undefined;

    if (hintId) {
      const q = getQuestionById(hintId);
      if (q?.title) {
        setActiveHint({ kind: "question", title: q.title, journeyId });
        return;
      }
    }

    if (freeIdxRaw) {
      const idx = Number(freeIdxRaw);
      const p = Number.isFinite(idx) ? FREE_WRITING_PROMPTS[idx] : undefined;
      if (p) setActiveHint({ kind: "free", title: p, journeyId });
      return;
    }

    if (speechIdxRaw) {
      const idx = Number(speechIdxRaw);
      const p = Number.isFinite(idx) ? TODAY_SPEECH_PROMPTS[idx] : undefined;
      if (p) setActiveHint({ kind: "speech", title: p, journeyId });
      return;
    }

    setActiveHint(null);
  }, [searchParams]);

  const handleFinish = (nextTitle: string, nextContent: string) => {
    if (!nextContent.trim()) return;
    if (isFinishing) return;
    setIsFinishing(true);
    const now = new Date().toISOString();
    let notebook: NotebookKind = "daily";
    let journeyId: string | null = null;
    let journeyTitle: string | null = null;
    if (activeHint?.journeyId) {
      const journey = getJourneyById(activeHint.journeyId);
      notebook = "journey";
      journeyId = activeHint.journeyId;
      journeyTitle = journey?.title ?? null;
    } else if (activeHint) {
      const hintId = searchParams.get("hint");
      const q = hintId ? getQuestionById(hintId) : null;
      if (q?.pool === "create_pool") {
        notebook = "create";
      }
    }
    const entry: DiaryEntry = {
      id:
        typeof window !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : now,
      title: nextTitle.trim() || null,
      content: nextContent.trim(),
      createdAt: now,
      visibility: "public",
      notebook,
      journeyId: journeyId ?? undefined,
      journeyTitle: journeyTitle ?? undefined,
      source: activeHint
        ? {
            kind: activeHint.kind,
            title: activeHint.title,
            journeyId: activeHint.journeyId ?? null,
            questionId:
              activeHint.kind === "question"
                ? searchParams.get("hint") ?? undefined
                : undefined,
          }
        : null,
    };
    prependDiaryEntry(entry);
    window.localStorage.removeItem("wo-writing-room-draft");
    setIsFinishing(false);
    router.push("/me");
  };

  return (
    <DiaryEditorPanel
      entryKey="home-new"
      initialTitle={title}
      initialContent={content}
      homeImmersive
      isSaving={isFinishing}
      saveLabel="收进这一页"
      savingLabel="…"
      fallbackQuestionTitle={fallbackQuestionTitle}
      topCompanion={
        <CompanionAssistant presetId={companionPresetId}>
          {companionWhisper}
        </CompanionAssistant>
      }
      preEditorHint={
        activeHint ? (
          <p className="text-[10px] leading-relaxed text-zinc-400/80 dark:text-zinc-500/85">
            <span className="text-zinc-400/60 dark:text-zinc-500/70">
              这句先陪着你：
            </span>
            {activeHint.title}
            <span className="text-zinc-300/80 dark:text-zinc-600"> · </span>
            <button
              type="button"
              onClick={() => setActiveHint(null)}
              className="text-zinc-400/90 underline underline-offset-2 decoration-zinc-300/80 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              先不写这句
            </button>
          </p>
        ) : undefined
      }
      onSave={({ title: nextTitle, content: nextContent }) => {
        handleFinish(nextTitle, nextContent);
      }}
    />
  );
}
