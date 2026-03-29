"use client";

import { useSyncExternalStore } from "react";
import { siteTitleWithWriter } from "@/lib/displayName";
import {
  readWriterProfile,
  WRITER_PROFILE_CHANGED_EVENT,
} from "@/lib/writerProfile";

function readTitle(): string {
  if (typeof window === "undefined") return "我写字的房间";
  return siteTitleWithWriter(readWriterProfile()?.nickname);
}

function subscribe(onChange: () => void) {
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener(WRITER_PROFILE_CHANGED_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(WRITER_PROFILE_CHANGED_EVENT, handler);
  };
}

/**
 * 顶栏站点名：有昵称则为「{nickname}写字的房间」，否则「我写字的房间」。
 */
export function SiteHeaderTitle() {
  const title = useSyncExternalStore(
    subscribe,
    readTitle,
    () => "我写字的房间",
  );

  return (
    <span className="font-home-room-title block truncate text-lg leading-none tracking-wide text-zinc-800 dark:text-zinc-100">
      {title}
    </span>
  );
}
