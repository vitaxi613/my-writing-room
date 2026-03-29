"use client";

import {
  DIARY_STORAGE_KEY,
  isActiveDiaryEntry,
  type DiaryEntry,
} from "./diaryTypes";
import { ensureWriterProfile } from "./writerProfile";
import { setFirstEntryRecoveryNudge } from "./storageMode";

export const DIARY_UPDATED_EVENT = "wo-writing-room-diary-updated";

export function emitDiaryUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(DIARY_UPDATED_EVENT));
}

export function readDiaryEntries(): DiaryEntry[] {
  const raw = window.localStorage.getItem(DIARY_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    let patched = false;
    const normalized = (parsed as DiaryEntry[]).map((e, idx) => {
      if (typeof e.id === "string" && e.id.trim()) return e;
      patched = true;
      const fallbackId = `legacy-${e.createdAt ?? Date.now()}-${idx}`;
      return { ...e, id: fallbackId };
    });

    // 现场修复：历史数据若缺 id，会导致“列表可见但详情/删除命不中”
    if (patched) {
      window.localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(normalized));
      emitDiaryUpdated();
    }

    return normalized.filter(isActiveDiaryEntry);
  } catch {
    return [];
  }
}

export function writeDiaryEntries(entries: DiaryEntry[]) {
  window.localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
  emitDiaryUpdated();
  void import("./cloudWritingRoomSync").then((m) => m.scheduleCloudMirror());
}

export function prependDiaryEntry(entry: DiaryEntry) {
  const p = ensureWriterProfile();
  const nick = p.nickname?.trim();
  const merged: DiaryEntry = {
    ...entry,
    writerId: p.writerId,
    writerSlug: p.writerSlug,
    writerNicknameSnapshot:
      entry.writerNicknameSnapshot?.trim() || nick || undefined,
  };
  const entries = readDiaryEntries();
  const wasEmpty = entries.length === 0;
  entries.unshift(merged);
  writeDiaryEntries(entries);
  if (wasEmpty) setFirstEntryRecoveryNudge(true);
}

export function updateDiaryEntry(id: string, updater: (entry: DiaryEntry) => DiaryEntry) {
  const next = readDiaryEntries().map((e) => (e.id === id ? updater(e) : e));
  writeDiaryEntries(next);
  return next;
}

export function deleteDiaryEntry(id: string) {
  const next = readDiaryEntries().filter((e) => e.id !== id);
  writeDiaryEntries(next);
  return next;
}

