/**
 * 首页写作区偏好（字体 / 字号 / 墨色），仅存本地，轻量、可改。
 */

export type HomeEditorFont = "serif" | "sans";
export type HomeEditorSize = "s" | "m" | "l";
/** 深灰 / 墨蓝 / 棕黑 */
export type HomeEditorInk = "warm-gray" | "ink-blue" | "brown-black";

export type HomeEditorPrefs = {
  font: HomeEditorFont;
  size: HomeEditorSize;
  ink: HomeEditorInk;
};

const STORAGE_KEY = "wo-home-editor-prefs";

export const DEFAULT_HOME_EDITOR_PREFS: HomeEditorPrefs = {
  font: "serif",
  size: "m",
  ink: "warm-gray",
};

export function readHomeEditorPrefs(): HomeEditorPrefs {
  if (typeof window === "undefined") return DEFAULT_HOME_EDITOR_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HOME_EDITOR_PREFS;
    const p = JSON.parse(raw) as Partial<HomeEditorPrefs>;
    return {
      font: p.font === "sans" ? "sans" : "serif",
      size:
        p.size === "s" || p.size === "m" || p.size === "l" ? p.size : "m",
      ink:
        p.ink === "ink-blue" || p.ink === "brown-black" ? p.ink : "warm-gray",
    };
  } catch {
    return DEFAULT_HOME_EDITOR_PREFS;
  }
}

export function writeHomeEditorPrefs(prefs: HomeEditorPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

/** 标题与正文共用字体族 */
export function homeEditorFontClass(font: HomeEditorFont): string {
  return font === "sans"
    ? "font-sans tracking-[-0.02em]"
    : "font-writing-body";
}

/** 正文区字号与行高 */
export function homeEditorBodySizeClass(size: HomeEditorSize): string {
  switch (size) {
    case "s":
      return "text-[15px] leading-[1.78]";
    case "l":
      return "text-[19px] leading-[1.88]";
    case "m":
    default:
      return "text-[17px] leading-[1.85]";
  }
}

/** 标题略大于正文一档 */
export function homeEditorTitleSizeClass(size: HomeEditorSize): string {
  switch (size) {
    case "s":
      return "text-base font-semibold";
    case "l":
      return "text-2xl font-semibold";
    case "m":
    default:
      return "text-xl font-semibold";
  }
}

/**
 * 墨色（浅色 / 深色模式）
 * - 使用 `!` 避免表单控件在 preflight 下 `color: inherit` 盖掉工具类
 * - 深色下三种墨色拉开色相，避免都是近白看不出差别
 */
export function homeEditorInkClass(ink: HomeEditorInk): string {
  switch (ink) {
    case "ink-blue":
      return [
        "!text-[#1a3352]",
        "placeholder:!text-[#4a667f]/90",
        "dark:!text-sky-100",
        "dark:placeholder:!text-sky-300/75",
      ].join(" ");
    case "brown-black":
      return [
        "!text-[#3b2f26]",
        "placeholder:!text-[#6b5348]/90",
        "dark:!text-amber-100",
        "dark:placeholder:!text-amber-200/65",
      ].join(" ");
    case "warm-gray":
    default:
      return [
        "!text-zinc-800",
        "placeholder:!text-zinc-500/85",
        "dark:!text-zinc-100",
        "dark:placeholder:!text-zinc-400/75",
      ].join(" ");
  }
}
