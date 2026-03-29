/**
 * 公开日记 · 回声（页边轻回应，非社交评论）
 */
export const ECHO_STORAGE_KEY = "wo-public-echoes";

/** 单条回声最大字数（含换行） */
export const MAX_ECHO_LENGTH = 120;

export type PublicEcho = {
  id: string;
  entryId: string;
  body: string;
  createdAt: string;
  /** 轻身份展示，无头像 */
  authorLabel: string;
};
