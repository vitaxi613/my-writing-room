/**
 * 首页河狸：页边陪写，锚在「home-writing-sheet」稿纸框上，不漂在页面空白处。
 *
 * 切换版式：改 DEFAULT_HOME_BEAVER_VARIANT 后刷新 `/` 对比。
 *
 * - peek-br：文档稿纸右下角贴边探出（默认，构图即右下边角）
 * - peek-bl：文档稿纸左下角贴边探出
 * - edge-sticker：稿纸右侧中下部轻贴边缘，体量更小
 */
export type HomeBeaverLayoutVariant = "peek-br" | "peek-bl" | "edge-sticker";

/** 当前版式（任选其一上线） */
export const DEFAULT_HOME_BEAVER_VARIANT: HomeBeaverLayoutVariant = "peek-br";

export const HOME_BEAVER_VARIANT_LABEL: Record<
  HomeBeaverLayoutVariant,
  string
> = {
  "peek-br": "方案 A：右下角贴边探头",
  "peek-bl": "方案 B：左下角贴边探头",
  "edge-sticker": "方案 C：右侧中下部轻贴页边",
};
