/**
 * 首页「陪写」文案（仅网页文字，单一数据源；不要写进 PNG）
 * 需要显示时：在 HomeDiaryComposer 等布局里用 <p> 渲染，勿与 HomeBeaverCompanion 图叠在一起做成表情包。
 * 轮换：按 UTC 日期种子，避免 SSR/hydration 与本地时区错位。
 */
export const BEAVER_LINES = [
  "人，你什么时候开始写？",
  "老大，你负责写，我负责帮你盯着。",
  "人，敢不敢写点真心话？",
] as const;

export function pickBeaverLine(): string {
  const d = new Date();
  const seed =
    d.getUTCFullYear() * 400 +
    (d.getUTCMonth() + 1) * 31 +
    d.getUTCDate();
  const pool = BEAVER_LINES;
  return pool[seed % pool.length] ?? pool[0];
}
