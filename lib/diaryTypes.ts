/**
 * 日记条目类型与收纳逻辑（与 localStorage 一致）
 * - 日常本：首页自由写、或从「今天的灵感」写
 * - 旅程本：从某条主题旅程进入后写，按 journeyId 再分子类
 * - 创作本：从创作池入口进入后写
 */
export type NotebookKind = "daily" | "journey" | "create" | "subconscious";

export type DiaryEntry = {
  id: string;
  title: string | null;
  content: string;
  createdAt: string;
  /** 本地修订时间戳（毫秒），用于云合并时优先保留较新的 visibility/正文等 */
  updatedAt?: number;
  /** 本机作者 id（新写入由 prependDiaryEntry 注入） */
  writerId?: string;
  /** 公开房间路径段，由 writerId 派生，非昵称 */
  writerSlug?: string;
  /** 保存时的昵称快照，用于公开页署名优先展示 */
  writerNicknameSnapshot?: string;
  visibility: "locked" | "public";
  /** 软删除标记（兼容未来数据库字段） */
  isDeleted?: boolean;
  /** 软删除时间（ISO） */
  deletedAt?: string | null;
  /** 收纳到哪个本；旧数据缺省视为 daily */
  notebook?: NotebookKind;
  /** 仅当 notebook === "journey" 时有值 */
  journeyId?: string | null;
  /** 旅程名称，用于展示 */
  journeyTitle?: string | null;
  /** 公开日记是否展示「回声」；未设置视为允许（后续作者可关） */
  echoesEnabled?: boolean;
  /** 写作时的「开头」提示，可选；questionId 用于共写空间按「问题」聚合 */
  source?: {
    kind: string;
    /** 探索问题 / 开头句等 */
    title: string;
    journeyId: string | null;
    questionId?: string | null;
    /** 潜意识书写 · OH 卡 */
    ohCardId?: string;
    ohCardTitle?: string;
    ohCardPrompt?: string;
    ohImageSrc?: string;
  } | null;
};

export const DIARY_STORAGE_KEY = "wo-writing-room-diary-entries";

/** 根据条目得到「来自哪个本/旅程」的展示文案 */
export function getNotebookLabel(entry: DiaryEntry): string {
  if (entry.notebook === "subconscious") return "潜意识书写本";
  if (entry.notebook === "journey" && entry.journeyTitle) {
    return entry.journeyTitle;
  }
  if (entry.notebook === "create") return "创作本";
  return "日常本";
}

/** 是否归入「潜意识书写本」列表（含旧数据 journeyId=oh） */
export function isSubconsciousEntry(entry: DiaryEntry): boolean {
  return (
    entry.notebook === "subconscious" ||
    (entry.notebook === "journey" && entry.journeyId === "oh")
  );
}

export function isDiaryEntryDeleted(entry: DiaryEntry): boolean {
  return entry.isDeleted === true || Boolean(entry.deletedAt);
}

export function isActiveDiaryEntry(entry: DiaryEntry): boolean {
  return !isDiaryEntryDeleted(entry);
}

/** 合并/冲突比较用：有 updatedAt 用其，否则退回 createdAt */
export function diaryEntryRevisionMs(entry: DiaryEntry): number {
  if (typeof entry.updatedAt === "number" && Number.isFinite(entry.updatedAt)) {
    return entry.updatedAt;
  }
  return Date.parse(entry.createdAt || "") || 0;
}

/**
 * 评论结构（预留）：当前仅整篇评论，后续可扩展为「选中某段边注」。
 * targetType: "full" 整篇 | "segment" 某段
 * targetSegmentId / targetRange 用于边注式评论
 */
export type CommentTargetType = "full" | "segment";

export type CommentPayload = {
  id: string;
  entryId: string;
  content: string;
  createdAt: string;
  targetType?: CommentTargetType;
  targetSegmentId?: string;
  targetRange?: { start: number; end: number };
};
