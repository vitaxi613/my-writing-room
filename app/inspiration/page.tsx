import Link from "next/link";
import { CREATE_POOL } from "@/lib/questionSystem";
import { FREE_WRITING_PROMPTS } from "@/lib/prompts";
import { WritingCompanion } from "@/app/components/WritingCompanion";
import { JourneyCards } from "./JourneyCards";
import { TodaySpeechCard } from "./TodaySpeechCard";

export default function InspirationPage() {
  return (
    <div className="space-y-10 sm:space-y-12">
      <section className="space-y-3">
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-[1.75rem] dark:text-zinc-50">
          找灵感
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          先想好今天想进入哪一种书写状态，再选一扇门。没有对错，只有此刻是否愿意动笔。
        </p>
        <WritingCompanion variant="inspiration" />
      </section>

      <section className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          今天的灵感
        </p>
        <TodaySpeechCard />
      </section>

      <section className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          自我探索
        </p>
        <JourneyCards />
      </section>

      <section className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          潜意识书写
        </p>
        <Link
          href="/explore/oh"
          className="block rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.2)] transition hover:bg-white sm:p-6 dark:border-zinc-700/55 dark:bg-zinc-900/35 dark:hover:bg-zinc-900/50"
        >
          <p className="font-writing-body text-sm font-medium text-zinc-900 dark:text-zinc-100">
            让答案慢慢浮上来
          </p>
          <p className="mt-3 text-xs leading-relaxed text-zinc-600 sm:text-sm dark:text-zinc-400">
            表意识找不到的，去潜意识里找找看。
            <br />
            写下此刻你最想探索的问题，再让一张卡，带你潜入意识深处。
          </p>
          <span className="mt-5 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900">
            进入潜意识书写
          </span>
        </Link>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          创作表达
        </p>
        <div className="paper-sheet rounded-sm p-5 sm:p-6">
          <p className="font-writing-body text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            创作一下
          </p>
          <p className="font-writing-body mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            把生活写下来，把感受写具体。
          </p>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-400">
            <span>{CREATE_POOL.length} 个创作提示</span>
            <Link
              href="/journeys/create"
              className="text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
            >
              打开创作池
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          自由写作提示
        </p>
        <div className="paper-sheet rounded-sm p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {FREE_WRITING_PROMPTS.map((p, idx) => (
              <Link
                key={p}
                href={`/?free=${idx}`}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-700 transition hover:bg-zinc-100"
              >
                {idx + 1}
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            点任意一个数字，把提示带回日记页。
          </p>
        </div>
      </section>
    </div>
  );
}
