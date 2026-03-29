import Link from "next/link";
import { getJourneyById, JOURNEY_BRIEFS } from "@/lib/questionSystem";
import { notFound } from "next/navigation";

export default async function JourneyDetailPage({
  params,
}: {
  params: Promise<{ journeyId: string }>;
}) {
  const { journeyId } = await params;
  if (journeyId === "oh") {
    const { redirect } = await import("next/navigation");
    redirect("/explore/oh");
  }
  const journey = getJourneyById(journeyId);
  if (!journey) notFound();
  const brief = JOURNEY_BRIEFS[journey.id];

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          自我探索 · 主题旅程
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          {journey.title}
        </h1>
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            副标题
          </p>
          <p className="text-sm leading-relaxed text-zinc-600">{journey.description}</p>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-zinc-200/80 bg-white/90 p-6">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            适合谁
          </p>
          <p className="text-sm text-zinc-700">
            {brief?.forWho ?? "想更清楚自己的人。"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            设计原理
          </p>
          <p className="text-sm text-zinc-700">
            {brief?.principle ??
              "通过边界觉察、情绪识别和模式反思，让写作更贴近你真实的感受。"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
            可能会帮到你
          </p>
          <p className="text-sm text-zinc-700">
            {brief?.help ?? "更清楚自己的需要与边界。"}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-zinc-400">
            你会按 Day 1~Day 7 一步步写下去。
          </p>
          <Link
            href={`/journeys/journey/${journey.id}/day/1?start=1`}
            className="inline-flex rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            开始旅程
          </Link>
        </div>
      </section>
    </div>
  );
}

