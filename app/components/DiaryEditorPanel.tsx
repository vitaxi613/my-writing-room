"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_HOME_EDITOR_PREFS,
  homeEditorBodySizeClass,
  homeEditorFontClass,
  homeEditorInkClass,
  homeEditorTitleSizeClass,
  readHomeEditorPrefs,
  writeHomeEditorPrefs,
  type HomeEditorPrefs,
} from "@/lib/homeEditorPrefs";
import { HomeWritingPrefs } from "./HomeWritingPrefs";

type SavePayload = {
  title: string;
  content: string;
};

type Props = {
  entryKey: string;
  initialTitle?: string;
  initialContent?: string;
  topCompanion?: React.ReactNode;
  preEditorHint?: React.ReactNode;
  fallbackQuestionTitle?: string | null;
  onSave: (payload: SavePayload) => void;
  isSaving?: boolean;
  saveLabel?: string;
  savingLabel?: string;
  /** 首页：长文档沉浸布局，弱化卡片与工具条前置 */
  homeImmersive?: boolean;
};

export function DiaryEditorPanel({
  entryKey,
  initialTitle = "",
  initialContent = "",
  topCompanion,
  preEditorHint,
  fallbackQuestionTitle,
  onSave,
  isSaving = false,
  saveLabel = "收进这一页",
  savingLabel = "…",
  homeImmersive = false,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [prefs, setPrefs] = useState<HomeEditorPrefs>(DEFAULT_HOME_EDITOR_PREFS);

  useEffect(() => {
    setPrefs(readHomeEditorPrefs());
  }, []);

  useEffect(() => {
    writeHomeEditorPrefs(prefs);
  }, [prefs]);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [entryKey, initialTitle, initialContent]);

  const wordCount = useMemo(() => content.trim().length, [content]);
  const metaFont = "font-writing-body";

  const titleClass = [
    homeEditorFontClass(prefs.font),
    homeEditorTitleSizeClass(prefs.size),
    homeEditorInkClass(prefs.ink),
    "w-full border-0 bg-transparent px-0 outline-none ring-0 focus:ring-0",
  ].join(" ");

  const bodyMin =
    "min-h-[72vh] w-full sm:min-h-[78vh] max-h-none";

  const bodyClassDefault = [
    homeEditorFontClass(prefs.font),
    homeEditorBodySizeClass(prefs.size),
    homeEditorInkClass(prefs.ink),
    "mt-0 block min-h-[min(56vh,420px)] w-full resize-y border-0 bg-transparent px-0 outline-none ring-0 focus:ring-0 sm:min-h-[min(58vh,480px)]",
  ].join(" ");

  /** 首页沉浸：版式与「纸面」容器不变，字体/字号/墨色与写作偏好一致 */
  const titleClassHome = [
    homeEditorFontClass(prefs.font),
    homeEditorTitleSizeClass(prefs.size),
    homeEditorInkClass(prefs.ink),
    "home-manuscript-title w-full border-0 bg-transparent px-0 outline-none ring-0 focus:ring-0",
    "leading-snug placeholder:font-normal",
  ].join(" ");

  const bodyClassHome = [
    homeEditorFontClass(prefs.font),
    homeEditorBodySizeClass(prefs.size),
    homeEditorInkClass(prefs.ink),
    "mt-2 block resize-y border-0 bg-transparent px-0 outline-none ring-0 focus:ring-0",
    "font-normal placeholder:font-normal",
    bodyMin,
  ].join(" ");

  const metaRow = (
    <div className="flex items-baseline justify-between gap-3">
      <p
        className={`${metaFont} text-xs tabular-nums text-zinc-600 dark:text-zinc-300`}
      >
        {new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </p>
      <span
        className={`${metaFont} text-xs tabular-nums text-zinc-500 dark:text-zinc-400`}
      >
        {wordCount} 字
      </span>
    </div>
  );

  const metaRowHome = (
    <div className="flex items-baseline justify-between gap-3 tracking-[0.04em]">
      <p
        className={`${metaFont} text-xs tabular-nums text-[#A0A0A0] dark:text-zinc-500`}
      >
        {new Date().toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      </p>
      <span
        className={`${metaFont} text-xs tabular-nums text-[#A0A0A0] dark:text-zinc-500`}
      >
        {wordCount} 字
      </span>
    </div>
  );

  const titleInput = (
    <input
      className={homeImmersive ? titleClassHome : titleClass}
      placeholder={homeImmersive ? "今天想写什么呢" : "标题可空"}
      value={title}
      onChange={(e) => setTitle(e.target.value)}
    />
  );

  const bodyTextarea = (
    <textarea
      className={homeImmersive ? bodyClassHome : bodyClassDefault}
      placeholder={
        homeImmersive ? "想到哪里，就写到哪里。" : "把今天想留住的，先写在这里。"
      }
      value={content}
      onChange={(e) => setContent(e.target.value)}
    />
  );

  const inspirationBlock =
    fallbackQuestionTitle && (
      <div className="space-y-2 border-t border-dashed border-[var(--paper-line)] pt-4">
        <p className="font-writing-hand text-[12px] text-zinc-500 dark:text-zinc-400">
          不知道写什么的时候，可以试试
        </p>
        <p
          className={`${metaFont} text-sm leading-relaxed text-zinc-700 dark:text-zinc-300`}
        >
          {fallbackQuestionTitle}
        </p>
        <Link
          href="/inspiration"
          className="inline-flex text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-400/90 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          找灵感
        </Link>
      </div>
    );

  const footerRow = (
    <div className="flex flex-col gap-3 border-t border-[var(--paper-line)] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        默认公开；在「我的房间」可改为仅自己可见。
      </p>
      <button
        type="button"
        onClick={() => onSave({ title, content })}
        disabled={!content.trim() || isSaving}
        className="inline-flex shrink-0 items-center justify-center self-end rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white dark:disabled:bg-zinc-600 sm:self-auto"
      >
        {isSaving ? savingLabel : saveLabel}
      </button>
    </div>
  );

  if (homeImmersive) {
    return (
      <div className="space-y-5 sm:space-y-6">
        <div className="space-y-2 sm:space-y-2.5">
          {metaRowHome}
          {topCompanion}
          {preEditorHint}
        </div>
        <div className="home-manuscript-surface">
          {titleInput}
          {bodyTextarea}
        </div>
        <HomeWritingPrefs prefs={prefs} onChange={setPrefs} placement="belowBody" />
        {inspirationBlock}
        {footerRow}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {metaRow}
      {topCompanion}
      {preEditorHint}
      <div className="home-writing-sheet space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <HomeWritingPrefs prefs={prefs} onChange={setPrefs} />
        {titleInput}
        {bodyTextarea}
      </div>
      {inspirationBlock}
      {footerRow}
    </div>
  );
}
