import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import { WritingCompanion } from "@/app/components/WritingCompanion";

type QuestionRow = {
  id: string;
  title: string | null;
  body: string | null;
  question_date: string | null;
};

type AnswerRow = {
  id: string;
  content: string;
  created_at: string;
};

const secondaryBtn =
  "inline-flex items-center justify-center rounded-full border border-[var(--paper-line)] bg-transparent px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ questionId: string }>;
}) {
  const { questionId } = await params;

  const { data: question, error: qError } = await supabase
    .from("question")
    .select("*")
    .eq("id", questionId)
    .maybeSingle<QuestionRow>();

  if (qError || !question) notFound();

  const { data: answers } = await supabase
    .from("answers")
    .select("*")
    .eq("question_id", questionId)
    .order("created_at", { ascending: false })
    .returns<AnswerRow[]>();

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          共写空间 · 一个提示
        </p>
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 sm:text-[1.75rem] dark:text-zinc-50">
          {question.title ?? "这个问题"}
        </h1>
        {question.body && (
          <p className="max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {question.body}
          </p>
        )}
        <WritingCompanion variant="public" className="pt-0" />
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href={`/?q=${questionId}`}
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            我也写一段
          </Link>
          <Link href="/" className={secondaryBtn}>
            返回首页
          </Link>
          <Link href="/me" className={secondaryBtn}>
            去我的房间
          </Link>
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
          公开文字
        </h2>
        {answers && answers.length > 0 ? (
          <ul className="divide-y divide-[var(--paper-line)] border-t border-b border-[var(--paper-line)]">
            {answers.map((answer) => (
              <li
                key={answer.id}
                className="py-5 first:pt-0 last:pb-0 sm:py-6"
              >
                <div className="flex items-start justify-between gap-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                  <span>一位匿名写作者</span>
                  <time
                    className="shrink-0 tabular-nums"
                    dateTime={answer.created_at}
                  >
                    {new Date(answer.created_at).toLocaleString("zh-CN", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
                <p className="font-writing-body mt-3 whitespace-pre-wrap text-sm leading-[1.85] text-zinc-800 dark:text-zinc-200">
                  {answer.content}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="paper-sheet rounded-sm px-5 py-10 text-center">
            <p className="font-writing-body text-sm text-zinc-500 dark:text-zinc-400">
              还没有回答，写下第一条吧。
            </p>
          </div>
        )}
      </section>

      <p className="text-center text-[11px] leading-relaxed text-zinc-400 dark:text-zinc-500">
        这里以阅读为主；点赞与评论等能力仍在扩展，日后可与「共写空间」体验统一。
      </p>
    </div>
  );
}
