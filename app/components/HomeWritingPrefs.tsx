"use client";

import type {
  HomeEditorFont,
  HomeEditorInk,
  HomeEditorPrefs,
  HomeEditorSize,
} from "@/lib/homeEditorPrefs";

type Props = {
  prefs: HomeEditorPrefs;
  onChange: (next: HomeEditorPrefs) => void;
  /** 正文前横条（默认）｜正文后轻条（首页沉浸） */
  placement?: "aboveTitle" | "belowBody";
};

/**
 * 写作偏好：轻量分段按钮，非重型工具栏。
 */
export function HomeWritingPrefs({
  prefs,
  onChange,
  placement = "aboveTitle",
}: Props) {
  const set = (patch: Partial<HomeEditorPrefs>) =>
    onChange({ ...prefs, ...patch });

  const quiet = placement === "belowBody";

  const btn = quiet
    ? "rounded-sm px-1.5 py-0.5 text-[10px] transition sm:text-[11px] " +
      "text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-600 " +
      "dark:text-zinc-500 dark:hover:bg-zinc-800/40 dark:hover:text-zinc-300"
    : "rounded-md px-2 py-1 text-[11px] transition sm:text-xs " +
      "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 " +
      "dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100";

  const active = quiet
    ? "bg-zinc-100/90 text-zinc-700 dark:bg-zinc-800/70 dark:text-zinc-200"
    : "bg-zinc-200/90 text-zinc-900 dark:bg-zinc-700/90 dark:text-zinc-50";

  const wrapClass =
    placement === "belowBody"
      ? "mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 border-t border-dashed border-[var(--paper-line)]/80 pt-4 text-zinc-400 dark:text-zinc-500"
      : "flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-[var(--paper-line)] pb-3 text-zinc-500 dark:text-zinc-400";

  return (
    <div className={wrapClass} role="group" aria-label="字体与字号">
      <button
        type="button"
        className={`${btn} ${prefs.font === "serif" ? active : ""}`}
        onClick={() => set({ font: "serif" satisfies HomeEditorFont })}
      >
        宋体感
      </button>
      <button
        type="button"
        className={`${btn} ${prefs.font === "sans" ? active : ""}`}
        onClick={() => set({ font: "sans" satisfies HomeEditorFont })}
      >
        黑体感
      </button>

      <span className="text-zinc-300 dark:text-zinc-600">|</span>

      {(
        [
          ["s", "小"],
          ["m", "中"],
          ["l", "大"],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={`${btn} ${prefs.size === key ? active : ""}`}
          onClick={() => set({ size: key satisfies HomeEditorSize })}
        >
          {label}
        </button>
      ))}

      <span className="text-zinc-300 dark:text-zinc-600">|</span>

      {(
        [
          ["warm-gray", "深灰"],
          ["ink-blue", "墨蓝"],
          ["brown-black", "棕黑"],
        ] as const
      ).map(([key, label]) => (
        <button
          key={key}
          type="button"
          className={`${btn} ${prefs.ink === key ? active : ""}`}
          onClick={() => set({ ink: key satisfies HomeEditorInk })}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
