"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";
import { INLINE_INSPIRATION_CARDS } from "@/lib/prompts";

export function InlineAnswerComposer({
  questionId,
  primaryActionLabel = "写下去",
  showInspiration = false,
}: {
  questionId: string | null;
  primaryActionLabel?: string;
  showInspiration?: boolean;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [inspiration, setInspiration] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = useMemo(() => {
    if (!content.trim()) return 0;
    return content.trim().length;
  }, [content]);

  const handleDrawInspiration = () => {
    const randomIndex = Math.floor(
      Math.random() * INLINE_INSPIRATION_CARDS.length,
    );
    setInspiration(INLINE_INSPIRATION_CARDS[randomIndex]);
  };

  const handleSubmit = async () => {
    if (!questionId) {
      setError("暂时没有可回答的问题。");
      return;
    }
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    let supabase;
    try {
      supabase = getSupabase();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "未配置 Supabase，无法提交。",
      );
      setIsSubmitting(false);
      return;
    }

    const { error: aError } = await supabase.from("answers").insert({
      question_id: questionId,
      content: content.trim(),
    });

    if (aError) {
      setError(`发布失败：${aError.message}`);
      setIsSubmitting(false);
      return;
    }

    setContent("");
    setInspiration(null);
    router.push("/space/" + questionId);
  };

  return (
    <div className="space-y-4 pt-2">
      {showInspiration && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-zinc-800">写下你的回答</p>
          <button
            type="button"
            onClick={handleDrawInspiration}
            className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            抽灵感卡
          </button>
        </div>
      )}

      {inspiration && (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-900">
          <p className="mb-1 font-medium">一张灵感卡：</p>
          <p>{inspiration}</p>
        </div>
      )}

      <textarea
        className="block min-h-[220px] w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm leading-relaxed text-zinc-800 outline-none transition focus:border-zinc-900 focus:bg-white"
        placeholder="写下你的想法，不需要完美。"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <div className="flex items-center justify-between text-xs text-zinc-400">
        <span>写完后，你可以看到别人的回答。</span>
        <span>{wordCount} / 800 字</span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim() || !questionId}
          className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isSubmitting ? "保存中..." : primaryActionLabel}
        </button>
      </div>
    </div>
  );
}
