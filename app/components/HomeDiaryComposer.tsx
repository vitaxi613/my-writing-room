"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

type SavePayload = { title: string; content: string };

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

  const [echoOpen, setEchoOpen] = useState(false);
  const [echoBusy, setEchoBusy] = useState(false);
  const [echoText, setEchoText] = useState<string | null>(null);
  const [echoError, setEchoError] = useState<string | null>(null);
  const [echoPayload, setEchoPayload] = useState<SavePayload | null>(null);

  const companionWhisper = useMemo(
    () => pickHomeWhisper(companionPresetId),
    [companionPresetId],
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

  const buildEntry = useCallback(
    (nextTitle: string, nextContent: string): DiaryEntry => {
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
      return {
        id:
          typeof window !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : now,
        title: nextTitle.trim() || null,
        content: nextContent.trim(),
        createdAt: now,
        updatedAt: Date.now(),
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
    },
    [activeHint, searchParams],
  );

  const completeAndGoMe = useCallback(
    (entry: DiaryEntry) => {
      prependDiaryEntry(entry);
      window.localStorage.removeItem("wo-writing-room-draft");
      router.push("/me");
    },
    [router],
  );

  const handleSaveDirect = useCallback(
    (payload: SavePayload) => {
      if (!payload.content.trim()) return;
      if (isFinishing) return;
      setIsFinishing(true);
      const entry = buildEntry(payload.title, payload.content);
      completeAndGoMe(entry);
      setIsFinishing(false);
    },
    [buildEntry, completeAndGoMe, isFinishing],
  );

  const closeEchoModal = useCallback(() => {
    setEchoOpen(false);
    setEchoBusy(false);
    setEchoText(null);
    setEchoError(null);
    setEchoPayload(null);
  }, []);

  const handlePaperEcho = useCallback(
    async (payload: SavePayload) => {
      if (!payload.content.trim()) return;
      setEchoPayload(payload);
      setEchoOpen(true);
      setEchoBusy(true);
      setEchoError(null);
      setEchoText(null);
      try {
        const res = await fetch("/api/paper-echo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: payload.title ?? "",
            content: payload.content,
          }),
        });
        const data = (await res.json()) as { echo?: string; error?: string };
        if (!res.ok) {
          setEchoError(data.error ?? "生成失败");
          return;
        }
        const raw = data.echo?.trim() ?? "";
        setEchoText(raw.length > 400 ? `${raw.slice(0, 400)}…` : raw);
      } catch {
        setEchoError("网络异常，请稍后再试");
      } finally {
        setEchoBusy(false);
      }
    },
    [],
  );

  const handleSaveAfterEcho = useCallback(() => {
    if (!echoPayload) return;
    if (isFinishing) return;
    setIsFinishing(true);
    try {
      const entry = buildEntry(echoPayload.title, echoPayload.content);
      completeAndGoMe(entry);
      closeEchoModal();
    } finally {
      setIsFinishing(false);
    }
  }, [
    buildEntry,
    closeEchoModal,
    completeAndGoMe,
    echoPayload,
    isFinishing,
  ]);

  return (
    <>
      <DiaryEditorPanel
        entryKey="home-new"
        initialTitle={title}
        initialContent={content}
        homeImmersive
        onPaperEcho={handlePaperEcho}
        paperEchoBusy={echoBusy}
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
        onSave={handleSaveDirect}
      />

      {echoOpen ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 p-4 sm:items-center"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget && !echoBusy && !isFinishing) {
              closeEchoModal();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="paper-echo-home-title"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--paper-line)] bg-[#fffdf7] p-5 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2
                id="paper-echo-home-title"
                className="font-writing-body text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                一纸回响
              </h2>
              <button
                type="button"
                disabled={echoBusy || isFinishing}
                onClick={closeEchoModal}
                className="shrink-0 rounded-full px-2 py-1 text-sm text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                aria-label="关闭"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 min-h-[100px]">
              {echoBusy ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  正在慢慢读你刚写下的字…
                </p>
              ) : echoError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {echoError}
                </p>
              ) : echoText ? (
                <p className="font-writing-body text-sm leading-[1.75] text-zinc-800 dark:text-zinc-200">
                  {echoText}
                </p>
              ) : null}
            </div>

            {!echoBusy && echoText && !echoError ? (
              <div className="mt-6 flex flex-wrap items-center justify-end gap-2 border-t border-[var(--paper-line)] pt-4">
                <button
                  type="button"
                  onClick={closeEchoModal}
                  disabled={isFinishing}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--paper-line)] px-4 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  再改改
                </button>
                <button
                  type="button"
                  onClick={handleSaveAfterEcho}
                  disabled={isFinishing}
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  {isFinishing ? "…" : "收进这一页"}
                </button>
              </div>
            ) : null}

            {!echoBusy && echoError ? (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEchoModal}
                  className="text-xs text-zinc-500 underline underline-offset-2"
                >
                  关闭
                </button>
                <button
                  type="button"
                  onClick={() => echoPayload && void handlePaperEcho(echoPayload)}
                  className="text-xs font-medium text-zinc-800 dark:text-zinc-200"
                >
                  重试
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
