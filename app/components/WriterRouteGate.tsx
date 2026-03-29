"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { readWriterProfile } from "@/lib/writerProfile";

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

    if (isWelcomePath(pathname)) {
      if (hasIdentity()) {
        router.replace("/");
        return;
      }
      setGate("ok");
      return;
    }

    if (!isProtectedPath(pathname)) {
      setGate("ok");
      return;
    }

    if (!hasIdentity()) {
      router.replace("/welcome");
      return;
    }

    setGate("ok");
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
