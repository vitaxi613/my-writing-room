"use client";

import { useRouter } from "next/navigation";
import { getJourneyById } from "@/lib/questionSystem";
import { readJourneyProgress } from "@/lib/journeyProgress";
import {
  dismissJourneyHomeGateForSession,
  getActiveJourneyDayHref,
} from "@/lib/journeyHomeGate";

type Props = {
  onClose: () => void;
};

/**
 * 进入首页前的轻量分流：有进行中旅程时先选，再进写作区或 Day 页。
 */
export function JourneyHomeGate({ onClose }: Props) {
  const router = useRouter();
  const p = readJourneyProgress();
  const journey = p ? getJourneyById(p.journeyId) : null;
  const title = journey?.title ?? "旅程";

  const handleContinue = () => {
    const href = getActiveJourneyDayHref();
    if (href) router.push(href);
    else onClose();
  };

  const handleWriteFirst = () => {
    dismissJourneyHomeGateForSession();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-stone-900/20 p-4 backdrop-blur-[1px] dark:bg-black/35"
      role="dialog"
      aria-modal="true"
      aria-labelledby="journey-gate-title"
    >
      <div className="w-full max-w-[19rem] rounded-sm border border-[var(--paper-line)] bg-[var(--paper-warm)]/96 px-4 py-4 shadow-md dark:border-stone-600/40 dark:bg-zinc-900/95">
        <p
          id="journey-gate-title"
          className="font-writing-body text-[13px] leading-relaxed text-zinc-800 dark:text-zinc-100"
        >
          进行中的旅程：
          <span className="font-medium">「{title}」</span>
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          选一个入口继续
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleContinue}
            className="rounded-full bg-zinc-900 px-3 py-2 text-[13px] font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            继续今天的旅程
          </button>
          <button
            type="button"
            onClick={handleWriteFirst}
            className="rounded-full border border-zinc-300/90 bg-white/70 px-3 py-2 text-[13px] text-zinc-700 transition hover:bg-white dark:border-zinc-600 dark:bg-zinc-800/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            先随便写点什么
          </button>
        </div>
      </div>
    </div>
  );
}
