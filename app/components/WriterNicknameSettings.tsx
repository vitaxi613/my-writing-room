"use client";

import { useCallback, useEffect, useState } from "react";
import {
  WRITER_PROFILE_CHANGED_EVENT,
  patchWriterProfile,
  readWriterProfile,
} from "@/lib/writerProfile";

export function WriterNicknameSettings() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const syncFromProfile = useCallback(() => {
    const n = readWriterProfile()?.nickname?.trim() ?? "";
    setValue(n);
  }, []);

  useEffect(() => {
    syncFromProfile();
    const onChange = () => syncFromProfile();
    window.addEventListener(WRITER_PROFILE_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(WRITER_PROFILE_CHANGED_EVENT, onChange);
  }, [syncFromProfile]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const v = value.trim();
    if (!v) {
      setError("请留一个称呼，不能为空。");
      setSaved(false);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      patchWriterProfile({ nickname: v });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("保存失败，请再试一次。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="rounded-sm border border-[var(--paper-line)] bg-zinc-50/40 px-4 py-4 dark:bg-zinc-900/20"
    >
      <p className="text-[11px] font-medium tracking-[0.2em] text-zinc-400 uppercase">
        称呼
      </p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        会显示在顶栏标题和你的房间页。已发布的日记里旧署名不会自动改。
      </p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label htmlFor="me-nickname" className="sr-only">
          称呼
        </label>
        <input
          id="me-nickname"
          type="text"
          name="nickname"
          autoComplete="nickname"
          maxLength={48}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
            setError(null);
          }}
          className="min-w-0 flex-1 border-0 border-b border-[var(--paper-line)] bg-transparent px-0 py-2 font-writing-body text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-400 dark:text-zinc-100"
          placeholder="你的称呼"
        />
        <button
          type="submit"
          disabled={busy}
          className="shrink-0 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
        >
          {busy ? "…" : "保存"}
        </button>
      </div>
      {error ? (
        <p className="mt-2 text-xs text-amber-800/90 dark:text-amber-200/90">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300/90">
          已保存。
        </p>
      ) : null}
    </form>
  );
}
