import Link from "next/link";
import { THEME_JOURNEYS } from "@/lib/questionSystem";

export default function ExploreJourneysPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          自我探索 · 主题旅程
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          选一条旅程，写几天
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">
          不用完成得很漂亮。每天写一点就好。
        </p>
        <div className="pt-2">
          <Link
            href="/explore"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            返回自我探索
          </Link>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {THEME_JOURNEYS.map((j) => (
          <Link
            key={j.id}
            href={`/journeys/journey/${j.id}`}
            className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.2)] transition hover:bg-white"
          >
            <p className="text-sm font-medium text-zinc-900">{j.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {j.description}
            </p>
            <p className="mt-3 text-xs text-zinc-400">7 个问题</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

