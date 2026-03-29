/**
 * 首页河狸图片（唯一来源）
 *
 * - 推荐：`/mascot/beaver-edge.png` 真透明底（无 screen 融底）。
 * - 若当前文件为 JPEG 黑底：用 `HOME_BEAVER_IMAGE_USE_SCREEN_KNOCKOUT` 融黑；
 *   换成透明 PNG 后请改路径为 `.png` 并把该项设为 `false`。
 */
export const HOME_BEAVER_IMAGE_SRC = "/mascot/beaver-edge.jpg" as const;

/** JPEG 黑底时用 CSS screen 融底；透明 PNG 必须设为 false */
export const HOME_BEAVER_IMAGE_USE_SCREEN_KNOCKOUT = true;

/** 与素材比例一致（当前边角探头稿约 682×1024） */
export const HOME_BEAVER_IMAGE_WIDTH = 682;
export const HOME_BEAVER_IMAGE_HEIGHT = 1024;
