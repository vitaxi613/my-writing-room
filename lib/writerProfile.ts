"use client";

import { WRITER_NICKNAME_STORAGE_KEY } from "./displayName";

/** 唯一真相：本机「当前写字的人」档案（昵称、简介、稳定 URL 段等） */
export const WRITER_PROFILE_STORAGE_KEY = "wo-writer-profile";

/** 写入 profile 后派发，供顶栏标题等同页订阅更新 */
export const WRITER_PROFILE_CHANGED_EVENT = "wo-writer-profile-changed";

/**
 * 本地身份档案（localStorage）。
 * 预留：未来可增加可选字段 `recoveryBinding?: WriterRecoveryBindingPlaceholder` 等，用于跨设备恢复，勿在 MVP 写入。
 */
export type WriterProfile = {
  writerId: string;
  /** 由 writerId 派生，与昵称无关，保证 /room/[slug] 稳定 */
  writerSlug: string;
  nickname: string | null;
  bio: string | null;
  /** 毫秒时间戳；兼容历史 ISO 字符串 */
  updatedAt: number;
};

/**
 * 预留类型：实现恢复绑定时再写入 `WriterProfile` 并接 API
 * （当前仅占位，不参与 parseProfile）
 */
export type WriterRecoveryBindingPlaceholder = {
  kind: string;
  linkedAt: number;
};

/** 「我的房间」等处展示 */
export const WRITER_RECOVERY_HINT =
  "绑定一个找回方式，换设备时也能回到这个房间。" as const;

/** 由 UUID 派生 12 位十六进制段，同 writerId 永远相同 */
export function writerSlugFromWriterId(writerId: string): string {
  return writerId.replace(/-/g, "").slice(0, 12);
}

function normalizeUpdatedAt(raw: unknown): number {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const t = Date.parse(raw);
    if (!Number.isNaN(t)) return t;
  }
  return Date.now();
}

function parseProfile(raw: string | null): WriterProfile | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    if (typeof p.writerId !== "string" || typeof p.writerSlug !== "string") {
      return null;
    }
    return {
      writerId: p.writerId,
      writerSlug: p.writerSlug,
      nickname: typeof p.nickname === "string" ? p.nickname : null,
      bio: typeof p.bio === "string" ? p.bio : null,
      updatedAt: normalizeUpdatedAt(p.updatedAt),
    };
  } catch {
    return null;
  }
}

/**
 * 仅当存在旧 key `wo-writer-nickname` 时迁移为完整 profile；
 * 不在此自动创建空档案（新用户走 /welcome）。
 */
function ensureProfileMigratedFromLegacy(): void {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(WRITER_PROFILE_STORAGE_KEY)) return;

  const legacyNick =
    window.localStorage.getItem(WRITER_NICKNAME_STORAGE_KEY)?.trim() || null;
  if (!legacyNick) return;

  const writerId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

  const profile: WriterProfile = {
    writerId,
    writerSlug: writerSlugFromWriterId(writerId),
    nickname: legacyNick,
    bio: null,
    updatedAt: Date.now(),
  };
  window.localStorage.setItem(WRITER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.localStorage.removeItem(WRITER_NICKNAME_STORAGE_KEY);
}

/** 只读；会尝试 legacy 迁移（有旧昵称时） */
export function readWriterProfile(): WriterProfile | null {
  if (typeof window === "undefined") return null;
  ensureProfileMigratedFromLegacy();
  return parseProfile(window.localStorage.getItem(WRITER_PROFILE_STORAGE_KEY));
}

/**
 * 欢迎页提交：新建完整档案，或为「有 id 无昵称」的旧数据补全昵称。
 * 已有昵称时原样返回，不覆盖 writerId。
 */
export function createWelcomeProfile(trimmedNickname: string): WriterProfile {
  if (typeof window === "undefined") {
    throw new Error("createWelcomeProfile is browser-only");
  }
  const nickname = trimmedNickname.trim();
  if (!nickname) {
    throw new Error("nickname required");
  }
  ensureProfileMigratedFromLegacy();
  const existing = parseProfile(
    window.localStorage.getItem(WRITER_PROFILE_STORAGE_KEY),
  );
  if (existing?.nickname?.trim()) {
    return existing;
  }
  if (existing?.writerId) {
    const next: WriterProfile = {
      ...existing,
      nickname,
      updatedAt: Date.now(),
    };
    writeWriterProfile(next);
    window.localStorage.removeItem(WRITER_NICKNAME_STORAGE_KEY);
    return next;
  }

  const writerId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const profile: WriterProfile = {
    writerId,
    writerSlug: writerSlugFromWriterId(writerId),
    nickname,
    bio: null,
    updatedAt: Date.now(),
  };
  writeWriterProfile(profile);
  window.localStorage.removeItem(WRITER_NICKNAME_STORAGE_KEY);
  return profile;
}

/** 存在且昵称非空时视为已建立本地身份 */
export function hasWriterIdentity(): boolean {
  const p = readWriterProfile();
  return Boolean(p?.nickname?.trim());
}

/**
 * 供 prependDiaryEntry 等：必须已有完整 profile，否则抛错（路由层应先挡 /welcome）。
 */
export function ensureWriterProfile(): WriterProfile {
  if (typeof window === "undefined") {
    throw new Error("ensureWriterProfile is browser-only");
  }
  ensureProfileMigratedFromLegacy();
  const p = parseProfile(window.localStorage.getItem(WRITER_PROFILE_STORAGE_KEY));
  if (!p?.nickname?.trim()) {
    throw new Error("Writer profile missing or incomplete");
  }
  return p;
}

export function writeWriterProfile(profile: WriterProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WRITER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(WRITER_PROFILE_CHANGED_EVENT));
  void import("./cloudWritingRoomSync").then((m) => m.scheduleCloudMirror());
}

/** 供设置页等：更新昵称/简介，不触碰 writerId / writerSlug */
export function patchWriterProfile(
  patch: Partial<Pick<WriterProfile, "nickname" | "bio">>,
): WriterProfile {
  const base = ensureWriterProfile();
  const next: WriterProfile = {
    ...base,
    ...patch,
    nickname:
      patch.nickname !== undefined
        ? patch.nickname?.trim()
          ? patch.nickname.trim()
          : null
        : base.nickname,
    bio:
      patch.bio !== undefined
        ? patch.bio?.trim()
          ? patch.bio.trim()
          : null
        : base.bio,
    updatedAt: Date.now(),
  };
  writeWriterProfile(next);
  return next;
}
