"use client";

import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { DiaryEntry } from "./diaryTypes";
import {
  readDiaryEntries,
  writeDiaryEntries,
  emitDiaryUpdated,
} from "./diaryStore";
import {
  readWriterProfile,
  writeWriterProfile,
  type WriterProfile,
} from "./writerProfile";
import {
  createBrowserSupabase,
  isWritingRoomAuthConfigured,
} from "./supabase/browser";
import {
  isCloudStorageMode,
  setCloudStorageMode,
} from "./storageMode";

type ProfileRow = {
  user_id: string;
  writer_id: string;
  writer_slug: string;
  nickname: string | null;
  bio: string | null;
  updated_at: number;
};
type ProfileFetchResult =
  | { ok: true; data: ProfileRow | null }
  | { ok: false };
type EntriesFetchResult =
  | { ok: true; data: DiaryEntry[] }
  | { ok: false };

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let pushInFlight = false;
let bootstrapStarted = false;
let syncAfterAuthChain: Promise<void> = Promise.resolve();

function profileToRow(
  userId: string,
  p: WriterProfile,
): Omit<ProfileRow, "user_id"> & { user_id: string } {
  return {
    user_id: userId,
    writer_id: p.writerId,
    writer_slug: p.writerSlug,
    nickname: p.nickname,
    bio: p.bio,
    updated_at: p.updatedAt,
  };
}

function rowToProfile(row: ProfileRow): WriterProfile {
  return {
    writerId: row.writer_id,
    writerSlug: row.writer_slug,
    nickname: row.nickname,
    bio: row.bio,
    updatedAt: typeof row.updated_at === "number" ? row.updated_at : Date.now(),
  };
}

async function fetchServerProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileFetchResult> {
  const { data, error } = await supabase
    .from("writing_room_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();
  if (error) {
    console.error("[writing-room] fetch profile", error);
    return { ok: false };
  }
  return { ok: true, data };
}

async function fetchServerEntries(
  supabase: SupabaseClient,
  userId: string,
): Promise<EntriesFetchResult> {
  const { data, error } = await supabase
    .from("writing_room_entries")
    .select("id,payload")
    .eq("user_id", userId);
  if (error) {
    console.error("[writing-room] fetch entries", error);
    return { ok: false };
  }
  const list = (data ?? []) as { id: string; payload: DiaryEntry }[];
  return {
    ok: true,
    data: list
    .map((r) => r.payload as DiaryEntry)
    .filter(Boolean)
    .sort((a, b) => {
      const ta = Date.parse(a.createdAt) || 0;
      const tb = Date.parse(b.createdAt) || 0;
      return tb - ta;
    }),
  };
}

function mergeEntriesById(local: DiaryEntry[], server: DiaryEntry[]): DiaryEntry[] {
  const map = new Map<string, DiaryEntry>();
  const upsert = (e: DiaryEntry) => {
    if (!e?.id) return;
    const prev = map.get(e.id);
    if (!prev) {
      map.set(e.id, e);
      return;
    }
    const tPrev = Date.parse(prev.createdAt || "") || 0;
    const tNext = Date.parse(e.createdAt || "") || 0;
    map.set(e.id, tNext >= tPrev ? e : prev);
  };
  local.forEach(upsert);
  server.forEach(upsert);
  return Array.from(map.values()).sort((a, b) => {
    const ta = Date.parse(a.createdAt || "") || 0;
    const tb = Date.parse(b.createdAt || "") || 0;
    return tb - ta;
  });
}

function sameEntrySet(a: DiaryEntry[], b: DiaryEntry[]): boolean {
  if (a.length !== b.length) return false;
  const fa = a
    .map((e) => `${e.id}|${e.createdAt}|${e.visibility}|${e.notebook ?? "daily"}`)
    .sort()
    .join("\n");
  const fb = b
    .map((e) => `${e.id}|${e.createdAt}|${e.visibility}|${e.notebook ?? "daily"}`)
    .sort()
    .join("\n");
  return fa === fb;
}

async function upsertServerProfile(
  supabase: SupabaseClient,
  userId: string,
  p: WriterProfile,
): Promise<boolean> {
  const row = profileToRow(userId, p);
  const { error } = await supabase.from("writing_room_profile").upsert(row, {
    onConflict: "user_id",
  });
  if (error) {
    console.error("[writing-room] upsert profile", error);
    return false;
  }
  return true;
}

async function replaceServerEntries(
  supabase: SupabaseClient,
  userId: string,
  entries: DiaryEntry[],
): Promise<boolean> {
  const { error: delErr } = await supabase
    .from("writing_room_entries")
    .delete()
    .eq("user_id", userId);
  if (delErr) {
    console.error("[writing-room] delete entries", delErr);
    return false;
  }
  if (entries.length === 0) return true;
  const { error: insErr } = await supabase.from("writing_room_entries").insert(
    entries.map((e) => ({
      user_id: userId,
      id: e.id,
      payload: e,
    })),
  );
  if (insErr) {
    console.error("[writing-room] insert entries", insErr);
    return false;
  }
  return true;
}

async function migrateLocalToServer(
  supabase: SupabaseClient,
  session: Session,
): Promise<void> {
  const userId = session.user.id;
  const profile = readWriterProfile();
  if (!profile?.writerId) return;
  const entries = readDiaryEntries();
  await upsertServerProfile(supabase, userId, profile);
  await replaceServerEntries(supabase, userId, entries);
}

async function pullServerToLocal(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const rowRes = await fetchServerProfile(supabase, userId);
  if (!rowRes.ok || !rowRes.data) return;
  const entriesRes = await fetchServerEntries(supabase, userId);
  if (!entriesRes.ok) return;
  writeWriterProfile(rowToProfile(rowRes.data));
  writeDiaryEntries(entriesRes.data);
  emitDiaryUpdated();
}

export async function syncAfterAuthSession(session: Session | null): Promise<void> {
  if (!session?.user?.id) return;
  if (!isWritingRoomAuthConfigured()) return;

  syncAfterAuthChain = syncAfterAuthChain.then(() =>
    runSyncAfterAuthSessionInner(session),
  );
  return syncAfterAuthChain;
}

async function runSyncAfterAuthSessionInner(session: Session): Promise<void> {
  let supabase: SupabaseClient;
  try {
    supabase = createBrowserSupabase();
  } catch {
    return;
  }

  const userId = session.user.id;
  const existingRes = await fetchServerProfile(supabase, userId);
  // 读云端失败时中止，避免把错误当成“云端为空”触发覆盖写入。
  if (!existingRes.ok) return;
  const existing = existingRes.data;

  if (!existing) {
    await migrateLocalToServer(supabase, session);
  } else {
    // 先合并，避免“刚写入本地但云端尚未刷新”时被旧快照覆盖。
    const serverEntriesRes = await fetchServerEntries(supabase, userId);
    if (!serverEntriesRes.ok) return;
    const serverEntries = serverEntriesRes.data;
    const localEntries = readDiaryEntries();
    const mergedEntries = mergeEntriesById(localEntries, serverEntries);
    if (mergedEntries.length > 0) {
      writeDiaryEntries(mergedEntries);
      await replaceServerEntries(supabase, userId, mergedEntries);
    } else {
      await pullServerToLocal(supabase, userId);
    }
    writeWriterProfile(rowToProfile(existing));
    emitDiaryUpdated();
  }

  setCloudStorageMode(true);
  emitDiaryUpdated();
}

export async function pushLocalSnapshotToServer(): Promise<void> {
  if (!isCloudStorageMode()) return;
  if (!isWritingRoomAuthConfigured()) return;
  if (pushInFlight) return;

  let supabase: SupabaseClient;
  try {
    supabase = createBrowserSupabase();
  } catch {
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return;

  const profile = readWriterProfile();
  if (!profile?.writerId) return;
  const localEntries = readDiaryEntries();

  pushInFlight = true;
  try {
    const okProfile = await upsertServerProfile(
      supabase,
      session.user.id,
      profile,
    );
    // 多设备场景下，不能用本地快照直接覆盖云端；先与云端合并再回写。
    const serverEntriesRes = await fetchServerEntries(supabase, session.user.id);
    if (!serverEntriesRes.ok) return;
    const mergedEntries = mergeEntriesById(localEntries, serverEntriesRes.data);
    const okEntries = await replaceServerEntries(
      supabase,
      session.user.id,
      mergedEntries,
    );
    if (okEntries && !sameEntrySet(localEntries, mergedEntries)) {
      writeDiaryEntries(mergedEntries);
    }
    if (!okProfile || !okEntries) {
      // 网络/权限偶发失败时保留云端模式，后续写入会再次 debounce 推送
    }
  } finally {
    pushInFlight = false;
  }
}

export function scheduleCloudMirror(): void {
  if (typeof window === "undefined") return;
  if (!isCloudStorageMode()) return;
  if (!isWritingRoomAuthConfigured()) return;
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debounceTimer = null;
    void pushLocalSnapshotToServer();
  }, 450);
}

export function bootstrapWritingRoomCloudSync(): void {
  if (typeof window === "undefined") return;
  if (!isWritingRoomAuthConfigured()) return;
  if (bootstrapStarted) return;
  bootstrapStarted = true;

  let supabase: SupabaseClient;
  try {
    supabase = createBrowserSupabase();
  } catch {
    bootstrapStarted = false;
    return;
  }

  void supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      void syncAfterAuthSession(session);
    }
  });

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      setCloudStorageMode(false);
      return;
    }
    if (event === "SIGNED_IN" && session?.user) {
      void syncAfterAuthSession(session);
    }
  });
}

export async function signOutWritingRoom(): Promise<void> {
  if (!isWritingRoomAuthConfigured()) return;
  try {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  setCloudStorageMode(false);
}