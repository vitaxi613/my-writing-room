import Link from "next/link";
import { CREATE_POOL, getQuestionById } from "@/lib/questionSystem";

export default function CreatePoolPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          创作表达
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          创作一下
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">
          把生活写下来，把感受写具体。
        </p>
        <div className="pt-2">
          <Link
            href="/journeys#create"
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            返回 journeys
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          创作池问题（16）
        </p>
        <div className="space-y-2">
          {CREATE_POOL.map((qid, idx) => {
            const q = getQuestionById(qid);
            if (!q) return null;
            return (
              <Link
                key={qid}
                href={`/?hint=${qid}`}
                className="block rounded-2xl border border-zinc-200/80 bg-white/90 px-4 py-3 text-sm text-zinc-800 shadow-[0_1px_0_rgba(148,163,184,0.2)] transition hover:bg-white"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">
                    {idx + 1}. {q.title}
                  </span>
                  <span className="text-[11px] text-zinc-400">去写这一题</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

