"use client";

import type { PublicEcho } from "./echoTypes";
import { ECHO_STORAGE_KEY } from "./echoTypes";

export const ECHO_UPDATED_EVENT = "wo-public-echoes-updated";

export function emitEchoUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ECHO_UPDATED_EVENT));
}

function parseAll(raw: string | null): PublicEcho[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is PublicEcho =>
        e &&
        typeof e.id === "string" &&
        typeof e.entryId === "string" &&
        typeof e.body === "string" &&
        typeof e.createdAt === "string" &&
        typeof e.authorLabel === "string",
    );
  } catch {
    return [];
  }
}

export function readAllEchoes(): PublicEcho[] {
  if (typeof window === "undefined") return [];
  return parseAll(window.localStorage.getItem(ECHO_STORAGE_KEY));
}

export function listEchoesForEntry(entryId: string): PublicEcho[] {
  return readAllEchoes()
    .filter((e) => e.entryId === entryId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function addEcho(payload: Omit<PublicEcho, "id" | "createdAt"> & { id?: string; createdAt?: string }): PublicEcho {
  const id =
    payload.id ??
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const createdAt = payload.createdAt ?? new Date().toISOString();
  const next: PublicEcho = {
    id,
    entryId: payload.entryId,
    body: payload.body,
    createdAt,
    authorLabel: payload.authorLabel,
  };
  const all = readAllEchoes();
  all.push(next);
  window.localStorage.setItem(ECHO_STORAGE_KEY, JSON.stringify(all));
  emitEchoUpdated();
  return next;
}
