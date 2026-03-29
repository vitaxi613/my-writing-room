import { readWriterProfile } from "./writerProfile";

/** 仅从 `wo-writer-profile` 读昵称（legacy key 在 readWriterProfile 内一次性迁移） */
export function readWriterNickname(): string | null {
  if (typeof window === "undefined") return null;
  const p = readWriterProfile();
  return p?.nickname?.trim() ? p.nickname.trim() : null;
}
