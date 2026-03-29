"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  pickTodaySpeechPromptIndex,
  TODAY_SPEECH_PROMPTS,
} from "@/lib/prompts";

export function TodaySpeechCard() {
  const [idx, setIdx] = useState(() => pickTodaySpeechPromptIndex());

  const prompt = useMemo(() => TODAY_SPEECH_PROMPTS[idx] ?? TODAY_SPEECH_PROMPTS[0], [idx]);

  const shuffle = () => {
    if (TODAY_SPEECH_PROMPTS.length <= 1) return;
    let next = idx;
    while (next === idx) {
      next = Math.floor(Math.random() * TODAY_SPEECH_PROMPTS.length);
    }
    setIdx(next);
  };

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.2)]">
      <p className="text-sm leading-relaxed text-zinc-600">
        {prompt}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link
          href={`/?speech=${idx}`}
          className="inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          用这个开头去写
        </Link>
        <button
          type="button"
          onClick={shuffle}
          className="inline-flex rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          换一个
        </button>
      </div>
    </div>
  );
}

