"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createBrowserSupabase,
  isWritingRoomAuthConfigured,
} from "@/lib/supabase/browser";
import {
  CLOUD_STORAGE_MODE_EVENT,
  isCloudStorageMode,
} from "@/lib/storageMode";
import { signOutWritingRoom } from "@/lib/cloudWritingRoomSync";

const inputCls =
  "mt-1 w-full max-w-sm rounded-md border border-[var(--paper-line)] bg-white/80 px-3 py-2 text-sm text-zinc-900 shadow-inner outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-500";

const btnCls =
  "inline-flex items-center justify-center rounded-full border border-[var(--paper-line)] bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white";

export function RoomBindEmailPanel({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [boundEmail, setBoundEmail] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    if (!isWritingRoomAuthConfigured()) return;
    try {
      const supabase = createBrowserSupabase();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setBoundEmail(session?.user?.email ?? null);
    } catch {
      setBoundEmail(null);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    const onCloud = () => void refreshSession();
    window.addEventListener(CLOUD_STORAGE_MODE_EVENT, onCloud);
    return () => window.removeEventListener(CLOUD_STORAGE_MODE_EVENT, onCloud);
  }, [refreshSession]);

  if (!isWritingRoomAuthConfigured()) {
    return (
      <div
        className={`space-y-1.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 ${className}`}
      >
        <p>
          当前无法使用邮箱绑定：本页面在构建时没有读到 Supabase 的公开配置（
          <code className="rounded bg-zinc-100 px-1 text-[11px] dark:bg-zinc-800">
            NEXT_PUBLIC_SUPABASE_URL
          </code>{" "}
          /{" "}
          <code className="rounded bg-zinc-100 px-1 text-[11px] dark:bg-zinc-800">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>
          ）。
        </p>
        <p className="text-zinc-400 dark:text-zinc-500">
          若站点部署在 Vercel：到该项目的 Settings → Environment Variables
          添加上述两项（值与本地 .env.local 相同），保存后对最新部署执行一次
          Redeploy（建议不要用仅复用缓存的旧产物）。
        </p>
      </div>
    );
  }

  const cloud = isCloudStorageMode();
  const showBound = cloud && boundEmail;

  if (showBound) {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          已绑定邮箱{" "}
          <span className="font-medium text-zinc-700 dark:text-zinc-200">
            {boundEmail}
          </span>
          ，换设备用同一邮箱收取登录链接即可回到此房间。
        </p>
        <button
          type="button"
          className="text-xs text-zinc-400 underline underline-offset-2 decoration-zinc-300/80 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          onClick={() => {
            void (async () => {
              await signOutWritingRoom();
              setBoundEmail(null);
              setMsg(null);
            })();
          }}
        >
          退出邮箱会话
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-medium text-zinc-600 dark:text-zinc-300">
          用邮箱保存房间
        </span>
        <input
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={inputCls}
          value={email}
          disabled={busy}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={btnCls}
          disabled={busy || !email.trim()}
          onClick={() => {
            const trimmed = email.trim();
            if (!trimmed) return;
            setBusy(true);
            setMsg(null);
            void (async () => {
              try {
                const supabase = createBrowserSupabase();
                const redirect = `${window.location.origin}/auth/callback?next=${encodeURIComponent("/me")}`;
                const { error } = await supabase.auth.signInWithOtp({
                  email: trimmed,
                  options: { emailRedirectTo: redirect },
                });
                if (error) {
                  setMsg(error.message);
                } else {
                  setMsg("已发送登录链接，请到邮箱点击链接完成绑定。");
                }
              } catch (e) {
                setMsg(e instanceof Error ? e.message : "发送失败");
              } finally {
                setBusy(false);
              }
            })();
          }}
        >
          {busy ? "发送中…" : "发送登录链接"}
        </button>
      </div>
      {msg ? (
        <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
