"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { prependDiaryEntry } from "@/lib/diaryStore";
import {
  OH_EXAMPLE_QUESTIONS,
  OH_WRITING_LIGHT_HINTS,
} from "@/lib/ohWriting";
import { DiaryEditorPanel } from "@/app/components/DiaryEditorPanel";

type OhCardFromDisk = {
  id: string;
  title: string;
  imageSrc: string;
};

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function OhWritingPage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [openInspiration, setOpenInspiration] = useState(false);
  const [cards, setCards] = useState<OhCardFromDisk[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [drawnCard, setDrawnCard] = useState<OhCardFromDisk | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [drawHint, setDrawHint] = useState<string | null>(null);

  const canDraw = question.trim().length > 0;

  useEffect(() => {
    let cancelled = false;
    async function loadCards() {
      try {
        setCardsLoading(true);
        const res = await fetch("/api/oh-cards", { cache: "no-store" });
        const json = (await res.json()) as { cards: OhCardFromDisk[] };
        if (!cancelled) setCards(json.cards ?? []);
      } catch {
        // ignore; show empty state via cardsLoading / cards length
      } finally {
        if (!cancelled) setCardsLoading(false);
      }
    }
    loadCards();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDrawCard = () => {
    if (!canDraw) {
      setDrawHint("先写下你想探索的事");
      return;
    }
    if (cardsLoading || cards.length === 0) {
      setDrawHint("卡片列表还没加载完成，请稍等一下。");
      return;
    }
    setDrawHint(null);
    setDrawnCard(pickRandom(cards));
  };

  const handleSave = (nextTitle: string, nextContent: string) => {
    if (!nextContent.trim() || isSaving || !drawnCard) return;
    setIsSaving(true);
    const now = new Date().toISOString();
    const q = question.trim();
    const entry: DiaryEntry = {
      id: "randomUUID" in crypto ? crypto.randomUUID() : now,
      title:
        nextTitle.trim() ||
        (q.length > 36 ? `${q.slice(0, 36)}…` : q || "潜意识书写"),
      content: nextContent.trim(),
      createdAt: now,
      visibility: "public",
      notebook: "subconscious",
      source: {
        kind: "subconscious_oh",
        title: q,
        journeyId: null,
        questionId: undefined,
        ohCardId: drawnCard.id,
        ohCardTitle: drawnCard.title,
        ohImageSrc: drawnCard.imageSrc,
      },
    };
    prependDiaryEntry(entry);
    setIsSaving(false);
    router.push("/me/subconscious");
  };

  const placeholderLines = OH_EXAMPLE_QUESTIONS.slice(0, 3).join("\n");

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          自我探索
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
          潜意识书写
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          先写下你想探索的事，再借一张图卡，看看潜意识想把你带去哪里。
        </p>
      </section>

      {/* 1｜问题 */}
      <section className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.15)] dark:border-zinc-700/60 dark:bg-zinc-900/40">
        <h2 className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          1｜写下你此刻想探索的事
        </h2>
        <textarea
          className="block min-h-[120px] w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none transition focus:border-zinc-900 focus:bg-white dark:border-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-100 dark:focus:border-zinc-400"
          placeholder={placeholderLines}
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setDrawHint(null);
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenInspiration((o) => !o)}
            className="text-xs font-medium text-zinc-500 underline underline-offset-4 decoration-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            找灵感
          </button>
        </div>
        {openInspiration && (
          <ul className="space-y-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-3 text-sm dark:border-zinc-600 dark:bg-zinc-800/30">
            {OH_EXAMPLE_QUESTIONS.map((line) => (
              <li key={line}>
                <button
                  type="button"
                  className="w-full text-left text-zinc-700 transition hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
                  onClick={() => {
                    setQuestion(line);
                    setOpenInspiration(false);
                  }}
                >
                  {line}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 2｜抽卡 */}
      <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.15)] dark:border-zinc-700/60 dark:bg-zinc-900/40">
        <h2 className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          2｜抽一张卡，看看潜意识想把你带去哪里
        </h2>
        {drawHint && (
          <p className="text-xs text-amber-800 dark:text-amber-200/90">{drawHint}</p>
        )}
        <button
          type="button"
          onClick={handleDrawCard}
          className={`inline-flex rounded-full px-5 py-2.5 text-sm font-medium transition ${
            canDraw
              ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              : "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400"
          }`}
          disabled={!canDraw || cardsLoading}
        >
          抽一张卡
        </button>

        {drawnCard && (
          <div className="space-y-3 border-t border-[var(--paper-line)] pt-4">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {drawnCard.title}
            </p>
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/40">
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={drawnCard.imageSrc}
                  alt={drawnCard.title}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 768px) 100vw, 42rem"
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              看一眼就够：先写下你最先注意到的感觉。
            </p>
          </div>
        )}
      </section>

      {/* 3｜书写 */}
      {drawnCard && (
        <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.15)] dark:border-zinc-700/60 dark:bg-zinc-900/40">
          <h2 className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            3｜开始写
          </h2>
          <DiaryEditorPanel
            entryKey={`oh-${drawnCard.id}`}
            initialTitle={question.trim()}
            initialContent=""
            isSaving={isSaving}
            saveLabel="收进这一页"
            savingLabel="保存中…"
            preEditorHint={
              <div className="space-y-3">
                <div className="space-y-2 rounded-xl border border-[var(--paper-line)] bg-[#fffdf7]/95 p-4 text-sm dark:bg-zinc-800/40">
                  <p className="text-xs font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                    你想探索的事
                  </p>
                  <p className="font-writing-body leading-relaxed text-zinc-800 dark:text-zinc-100">
                    {question.trim() || "（未填写）"}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded border border-zinc-200 bg-white dark:border-zinc-600">
                      <Image
                        src={drawnCard.imageSrc}
                        alt=""
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">抽到的卡</p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {drawnCard.title}
                      </p>
                    </div>
                  </div>
                </div>
                <ul className="list-inside list-disc space-y-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {OH_WRITING_LIGHT_HINTS.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </div>
            }
            onSave={({ title, content }) => handleSave(title, content)}
          />
        </section>
      )}

      <p className="text-center text-xs text-zinc-400">
        <Link
          href="/inspiration"
          className="underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
        >
          更多灵感
        </Link>
      </p>
    </div>
  );
}
