"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getJourneyById, getQuestionById } from "@/lib/questionSystem";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { prependDiaryEntry } from "@/lib/diaryStore";
import { startJourneyProgress, advanceJourneyDay } from "@/lib/journeyProgress";
import { JOURNEY_DAY_PLANS } from "@/lib/journeyDayPlans";

export default function JourneyDayPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const journeyId = typeof params.journeyId === "string" ? params.journeyId : "";
  const dayRaw = typeof params.day === "string" ? Number(params.day) : 1;
  const day = Number.isFinite(dayRaw) ? Math.max(1, dayRaw) : 1;

  const journey = getJourneyById(journeyId);
  const questionId = journey?.questionIds[day - 1];
  const question = getQuestionById(questionId);
  const totalDays = journey?.questionIds.length ?? 1;
  const dayPlan = journey ? JOURNEY_DAY_PLANS[journey.id]?.[day - 1] : undefined;

  const wordCount = useMemo(() => content.trim().length, [content]);

  if (!journey || !question) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-zinc-600">这个旅程或 Day 不存在。</p>
        <Link href="/inspiration" className="text-xs text-zinc-500 underline underline-offset-4">
          返回找灵感
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    if (!content.trim() || isSaving) return;
    setIsSaving(true);
    const now = new Date().toISOString();
    const entry: DiaryEntry = {
      id: "randomUUID" in crypto ? crypto.randomUUID() : now,
      title: title.trim() || `Day ${day}`,
      content: content.trim(),
      createdAt: now,
      visibility: "public",
      notebook: "journey",
      journeyId: journey.id,
      journeyTitle: journey.title,
      source: {
        kind: "question",
        title: question.title,
        journeyId: journey.id,
        questionId: question.id,
      },
    };
    prependDiaryEntry(entry);
    if (searchParams.get("start") === "1") {
      startJourneyProgress(journey.id, totalDays);
    }
    advanceJourneyDay(journey.id);
    setIsSaving(false);
    router.push("/me");
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Link href={`/journeys/journey/${journey.id}`} className="text-xs text-zinc-500 underline underline-offset-4">
          返回旅程页
        </Link>
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          {journey.title} · Day {day}/{totalDays}
        </p>
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            今日主题
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            {dayPlan?.dayTheme ?? "今天的写作主题"}
          </h1>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/90 p-6">
        <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-4">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            小知识
          </p>
          <p className="text-sm leading-relaxed text-zinc-700">
            {dayPlan?.dayTip ??
              "当你不知道怎么写时，把注意力放回身体和当下的感受。"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            当天写作
          </p>
          <p className="text-sm leading-relaxed text-zinc-800">
            {question.title}
          </p>
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={`Day ${day} 标题（可空）`}
          className="w-full border-0 bg-transparent text-base font-medium text-zinc-900 outline-none placeholder:text-zinc-400"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="从你此刻最想写的一句开始。写下你的真实感受与具体场景。"
          className="min-h-[420px] w-full resize-none border-0 bg-transparent text-[15px] leading-8 text-zinc-800 outline-none placeholder:text-zinc-400"
        />
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>写完会自动收进对应旅程本。你可以随时在“我的房间”设为私密。</span>
          <span>{wordCount} 字</span>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={!content.trim() || isSaving}
            className="inline-flex rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:bg-zinc-300"
          >
            {isSaving ? "保存中..." : "写完 Day 记录"}
          </button>
        </div>
      </section>
    </div>
  );
}

