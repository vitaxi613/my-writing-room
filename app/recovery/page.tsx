"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DiaryEntry } from "@/lib/diaryTypes";
import { readDiaryEntries, writeDiaryEntries } from "@/lib/diaryStore";
import {
  createBrowserSupabase,
  isWritingRoomAuthConfigured,
} from "@/lib/supabase/browser";

type CloudRow = {
  id: string;
  payload: DiaryEntry;
};

function ts(v: string | undefined): number {
  return Date.parse(v || "") || 0;
}

function mergeById(local: DiaryEntry[], cloud: DiaryEntry[]): DiaryEntry[] {
  const map = new Map<string, DiaryEntry>();
  const upsert = (e: DiaryEntry) => {
    if (!e?.id) return;
    const prev = map.get(e.id);
    if (!prev) {
      map.set(e.id, e);
      return;
    }
    map.set(e.id, ts(e.createdAt) >= ts(prev.createdAt) ? e : prev);
  };
  local.forEach(upsert);
  cloud.forEach(upsert);
  return Array.from(map.values()).sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RecoveryPage() {
  const [localEntries, setLocalEntries] = useState<DiaryEntry[]>([]);
  const [cloudEntries, setCloudEntries] = useState<DiaryEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const merged = useMemo(
    () => mergeById(localEntries, cloudEntries),
    [localEntries, cloudEntries],
  );

  const loadLocal = () => {
    setErr(null);
    setMsg(null);
    setLocalEntries(readDiaryEntries());
  };

  const loadCloud = async () => {
    setErr(null);
    setMsg(null);
    if (!isWritingRoomAuthConfigured()) {
      setErr("当前未配置 Supabase 环境变量，无法读取云端。");
      return;
    }
    setBusy(true);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setErr("当前设备未登录邮箱会话，请先去 /me 绑定/登录邮箱。");
        return;
      }
      const { data, error } = await supabase
        .from("writing_room_entries")
        .select("id,payload")
        .eq("user_id", session.user.id);
      if (error) {
        setErr(error.message);
        return;
      }
      const rows = (data ?? []) as CloudRow[];
      const list = rows
        .map((r) => r.payload)
        .filter(Boolean)
        .sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
      setCloudEntries(list);
      setMsg(`已读取云端 ${list.length} 篇。`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "读取云端失败");
    } finally {
      setBusy(false);
    }
  };

  const restoreToLocal = () => {
    setErr(null);
    setMsg(null);
    writeDiaryEntries(merged);
    setLocalEntries(readDiaryEntries());
    setMsg(`已将合并结果恢复到本地，共 ${merged.length} 篇。`);
  };

  const pushMergedToCloud = async () => {
    setErr(null);
    setMsg(null);
    if (!isWritingRoomAuthConfigured()) {
      setErr("当前未配置 Supabase 环境变量，无法写入云端。");
      return;
    }
    setBusy(true);
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setErr("当前设备未登录邮箱会话，无法回推云端。");
        return;
      }
      const uid = session.user.id;
      const { error: delErr } = await supabase
        .from("writing_room_entries")
        .delete()
        .eq("user_id", uid);
      if (delErr) {
        setErr(delErr.message);
        return;
      }
      if (merged.length > 0) {
        const { error: insErr } = await supabase.from("writing_room_entries").insert(
          merged.map((e) => ({
            user_id: uid,
            id: e.id,
            payload: e,
          })),
        );
        if (insErr) {
          setErr(insErr.message);
          return;
        }
      }
      setMsg(`已回推云端，共 ${merged.length} 篇。`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "回推云端失败");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <Link
          href="/me"
          className="text-xs text-zinc-500 underline underline-offset-4 decoration-zinc-200 hover:decoration-zinc-500"
        >
          返回我的房间
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          数据抢救页
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          用于紧急恢复日记数据：读取本地/云端、导出 JSON、合并恢复。操作前建议先导出备份。
        </p>
      </section>

      <section className="paper-sheet space-y-4 rounded-sm px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadLocal}
            className="rounded-full border border-[var(--paper-line)] px-4 py-2 text-xs"
          >
            读取本地
          </button>
          <button
            type="button"
            onClick={() => void loadCloud()}
            disabled={busy}
            className="rounded-full border border-[var(--paper-line)] px-4 py-2 text-xs disabled:opacity-60"
          >
            {busy ? "读取中…" : "读取云端"}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadJson(`local-entries-${Date.now()}.json`, localEntries)
            }
            className="rounded-full border border-[var(--paper-line)] px-4 py-2 text-xs"
          >
            导出本地 JSON
          </button>
          <button
            type="button"
            onClick={() =>
              downloadJson(`cloud-entries-${Date.now()}.json`, cloudEntries)
            }
            className="rounded-full border border-[var(--paper-line)] px-4 py-2 text-xs"
          >
            导出云端 JSON
          </button>
          <button
            type="button"
            onClick={() => downloadJson(`merged-entries-${Date.now()}.json`, merged)}
            className="rounded-full border border-[var(--paper-line)] px-4 py-2 text-xs"
          >
            导出合并 JSON
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
          <div className="rounded border border-[var(--paper-line)] px-3 py-2">
            本地：{localEntries.length} 篇
          </div>
          <div className="rounded border border-[var(--paper-line)] px-3 py-2">
            云端：{cloudEntries.length} 篇
          </div>
          <div className="rounded border border-[var(--paper-line)] px-3 py-2">
            合并：{merged.length} 篇
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[var(--paper-line)] pt-3">
          <button
            type="button"
            onClick={restoreToLocal}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-medium text-white"
          >
            用合并结果恢复到本地
          </button>
          <button
            type="button"
            onClick={() => void pushMergedToCloud()}
            disabled={busy}
            className="rounded-full border border-[var(--paper-line)] px-4 py-2 text-xs disabled:opacity-60"
          >
            {busy ? "回推中…" : "把合并结果回推到云端"}
          </button>
        </div>

        {msg ? <p className="text-xs text-emerald-700 dark:text-emerald-300">{msg}</p> : null}
        {err ? <p className="text-xs text-amber-700 dark:text-amber-300">{err}</p> : null}
      </section>
    </div>
  );
}

