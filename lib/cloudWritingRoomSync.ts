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
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("writing_room_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();
  if (error) {
    console.error("[writing-room] fetch profile", error);
    return null;
  }
  return data;
}

async function fetchServerEntries(
  supabase: SupabaseClient,
  userId: string,
): Promise<DiaryEntry[]> {
  const { data, error } = await supabase
    .from("writing_room_entries")
    .select("id,payload")
    .eq("user_id", userId);
  if (error) {
    console.error("[writing-room] fetch entries", error);
    return [];
  }
  const list = (data ?? []) as { id: string; payload: DiaryEntry }[];
  return list
    .map((r) => r.payload as DiaryEntry)
    .filter(Boolean)
    .sort((a, b) => {
      const ta = Date.parse(a.createdAt) || 0;
      const tb = Date.parse(b.createdAt) || 0;
      return tb - ta;
    });
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
  const row = await fetchServerProfile(supabase, userId);
  if (!row) return;
  const entries = await fetchServerEntries(supabase, userId);
  writeWriterProfile(rowToProfile(row));
  writeDiaryEntries(entries);
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
  const existing = await fetchServerProfile(supabase, userId);

  if (!existing) {
    await migrateLocalToServer(supabase, session);
  } else {
    await pullServerToLocal(supabase, userId);
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

  pushInFlight = true;
  try {
    const okProfile = await upsertServerProfile(
      supabase,
      session.user.id,
      profile,
    );
    const okEntries = await replaceServerEntries(
      supabase,
      session.user.id,
      readDiaryEntries(),
    );
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