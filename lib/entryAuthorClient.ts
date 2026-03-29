"use client";

import type { DiaryEntry } from "./diaryTypes";
import { readWriterProfile } from "./writerProfile";

export const FALLBACK_WRITER_NAME = "一位写字的人";

export function resolveEntryAuthor(entry: DiaryEntry): {
  name: string;
  slug: string | null;
} {
  const name =
    entry.writerNicknameSnapshot?.trim() ||
    readWriterProfile()?.nickname?.trim() ||
    FALLBACK_WRITER_NAME;
  return {
    name,
    slug: entry.writerSlug?.trim() || null,
  };
}

