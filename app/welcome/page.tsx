"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createWelcomeProfile,
  hasWriterIdentity,
} from "@/lib/writerProfile";

export default function WelcomePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hasWriterIdentity()) {
      router.replace("/");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = nickname.trim();
    if (!v) {
      setError("请留一个名字，哪怕很轻也行。");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      createWelcomeProfile(v);
      router.replace("/");
    } catch {
      setError("保存失败，请再试一次。");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pb-16 pt-8 sm:pt-12">
      <header className="space-y-4">
        <h1 className="font-writing-body text-2xl font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50">
          给这个房间留一个名字
        </h1>
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          你可以用一个真实的名字，也可以用一个此刻的名字。
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        <div>
          <label htmlFor="welcome-nick" className="sr-only">
            称呼
          </label>
          <input
            id="welcome-nick"
            type="text"
            name="nickname"
            autoComplete="nickname"
            maxLength={48}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="比如：葵葵 / 今天有点乱的人 / 不太想说话的人"
            className="w-full border-0 border-b border-[var(--paper-line)] bg-transparent px-0 py-3 font-writing-body text-base text-zinc-900 outline-none ring-0 placeholder:text-zinc-400/90 focus:border-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </div>
        {error ? (
          <p className="text-sm text-amber-800/90 dark:text-amber-200/90">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {submitting ? "…" : "进入我的房间"}
        </button>
      </form>
    </div>
  );
}
