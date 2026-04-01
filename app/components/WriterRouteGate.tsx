"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readWriterProfile } from "@/lib/writerProfile";
import {
  createBrowserSupabase,
  isWritingRoomAuthConfigured,
} from "@/lib/supabase/browser";
import { syncAfterAuthSession } from "@/lib/cloudWritingRoomSync";

function isWelcomePath(pathname: string): boolean {
  return pathname === "/welcome";
}

/** 需已建立本地身份（昵称）才可进入 */
function isProtectedPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname.startsWith("/write")) return true;
  if (pathname.startsWith("/me")) return true;
  if (pathname.startsWith("/public")) return true;
  return false;
}

function hasIdentity(): boolean {
  const p = readWriterProfile();
  return Boolean(p?.nickname?.trim());
}

/**
 * 无 profile（或无昵称）访问受保护路由时去 /welcome；已身份访问 /welcome 时去首页。
 */
export function WriterRouteGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [gate, setGate] = useState<"checking" | "ok">("checking");

  useEffect(() => {
    if (!pathname) return;
    let cancelled = false;

    const run = async () => {
      if (isWelcomePath(pathname)) {
        if (hasIdentity()) {
          router.replace("/");
          return;
        }
        // 新设备上可能已完成邮箱登录，但本地 profile 仍未拉取；先补一次同步
        if (isWritingRoomAuthConfigured()) {
          try {
            const supabase = createBrowserSupabase();
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
              await syncAfterAuthSession(session);
              if (hasIdentity()) {
                router.replace("/");
                return;
              }
            }
          } catch {
            // ignore and fallback to welcome form
          }
        }
        if (!cancelled) setGate("ok");
        return;
      }

      if (!isProtectedPath(pathname)) {
        if (!cancelled) setGate("ok");
        return;
      }

      if (!hasIdentity()) {
        // 受保护页放行前，优先尝试用已登录邮箱会话恢复 profile
        if (isWritingRoomAuthConfigured()) {
          try {
            const supabase = createBrowserSupabase();
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
              await syncAfterAuthSession(session);
            }
          } catch {
            // ignore and fallback redirect
          }
        }
        if (!hasIdentity()) {
          router.replace("/welcome");
          return;
        }
      }

      if (!cancelled) setGate("ok");
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (gate === "checking") {
    return (
      <div
        className="min-h-[42vh] w-full"
        aria-busy="true"
        aria-label="加载中"
      />
    );
  }

  return <>{children}</>;
}
