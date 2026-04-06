"use client";

/** 本机已删除、待同步到云端的条目 id（避免合并时从云端把已删条目拉回来） */
const DIARY_DELETED_PENDING_KEY = "wo-writing-room-diary-deleted-pending-sync";

export function readPendingDeletedEntryIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DIARY_DELETED_PENDING_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return new Set();
    return new Set(
      arr.filter((x): x is string => typeof x === "string" && x.trim().length > 0),
    );
  } catch {
    return new Set();
  }
}

function writePendingDeleted(ids: Set<string>) {
  window.localStorage.setItem(DIARY_DELETED_PENDING_KEY, JSON.stringify([...ids]));
}

export function addPendingDeletedEntryId(id: string) {
  const trimmed = id?.trim();
  if (!trimmed) return;
  const s = readPendingDeletedEntryIds();
  s.add(trimmed);
  writePendingDeleted(s);
}

/** 云端已成功全量替换写入后调用，清除待同步删除记录 */
export function clearPendingDeletedEntryIdsAfterServerSync() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DIARY_DELETED_PENDING_KEY);
}
