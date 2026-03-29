import Link from "next/link";

export default function ExplorePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase">
          自我探索
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          想从哪里开始
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600">
          先写一点。写着写着，就会更清楚。
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/"
          className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.2)] transition hover:bg-white"
        >
          <p className="text-sm font-medium text-zinc-900">从一个问题开始</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            最直接的开始方式。写下你此刻的想法，不需要完美。
          </p>
          <p className="mt-3 text-xs text-zinc-400">进入首页问题书写</p>
        </Link>

        <Link
          href="/explore/journeys"
          className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.2)] transition hover:bg-white"
        >
          <p className="text-sm font-medium text-zinc-900">开启一个主题旅程</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            沿着一个主题，写几天。慢慢把自己捞回来。
          </p>
          <p className="mt-3 text-xs text-zinc-400">进入主题旅程</p>
        </Link>

        <Link
          href="/explore/oh"
          className="rounded-2xl border border-zinc-200/80 bg-white/90 p-5 shadow-[0_1px_0_rgba(148,163,184,0.2)] transition hover:bg-white"
        >
          <p className="text-sm font-medium text-zinc-900">抽一张写写看</p>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            （占位入口）之后会接入 OH 卡书写。
          </p>
          <p className="mt-3 text-xs text-zinc-400">进入 OH 卡书写</p>
        </Link>
      </section>
    </div>
  );
}

