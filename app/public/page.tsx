import Link from "next/link";
import { WritingCompanion } from "@/app/components/WritingCompanion";
import { PublicSquare } from "./PublicSquare";

export default function PublicPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          共写空间
        </p>
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-[1.75rem] dark:text-zinc-50">
          公开日记
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          在这里读读别人写下的字。你可以安静地看，也可以说点什么。
        </p>
        <WritingCompanion variant="public" className="pt-1" />
      </header>

      <PublicSquare />

      <div className="border-t border-[var(--paper-line)] pt-6">
        <Link
          href="/"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          回到首页
        </Link>
      </div>
    </div>
  );
}
