"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FREE_WRITING_PROMPTS } from "@/lib/prompts";

export default function FreeWritingPage() {
  const [content, setContent] = useState("");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const wordCount = useMemo(() => content.trim().length, [content]);

  const choosePrompt = (idx: number) => {
    setSelectedIndex(idx);
    const line = FREE_WRITING_PROMPTS[idx];
    setContent((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return line + "\n";
      return prev.endsWith("\n") ? prev + line + "\n" : prev + "\n" + line + "\n";
    });
  };

  const saveLocal = () => {
    const payload = {
      type: "free",
      promptIndex: selectedIndex,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem("wo-writing-room-free-latest", JSON.stringify(payload));
  };

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          自由写作
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          今天只是想写一点
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">
          没有结构，没有正确答案。你可以选一句轻提示开头，也可以直接写空白。
        </p>
        <div className="pt-2">
          <Link
            href="/journeys#free"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            返回 journeys
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.03)]">
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-[0.3em] text-zinc-500 uppercase">
            轻提示（任选一条）
          </p>
          <div className="flex flex-wrap gap-2">
            {FREE_WRITING_PROMPTS.map((p, idx) => (
              <button
                key={p}
                type="button"
                onClick={() => choosePrompt(idx)}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-zinc-100"
              >
                {idx + 1}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400">
            你也可以不选任何提示，直接开始写。
          </p>
        </div>

        <textarea
          className="block min-h-[260px] w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none transition focus:border-zinc-900 focus:bg-white"
          placeholder="随便写一点。你可以从一个画面、一句话、一个身体感受开始。"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>这页是自由写作的最简结构版。</span>
          <span>{wordCount} 字</span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={() => setContent("")}
            className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            清空
          </button>
          <button
            type="button"
            onClick={() => {
              if (!content.trim()) return;
              saveLocal();
            }}
            disabled={!content.trim()}
            className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            title="占位：暂存到本地 localStorage"
          >
            暂存到本地
          </button>
        </div>
      </section>
    </div>
  );
}

