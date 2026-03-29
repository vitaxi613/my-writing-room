"use client";

import { useEffect, useState } from "react";
import {
  CLOUD_STORAGE_MODE_EVENT,
  isCloudStorageMode,
  setFirstEntryRecoveryNudge,
  shouldShowFirstEntryRecoveryNudge,
} from "@/lib/storageMode";
import { WRITER_RECOVERY_HINT } from "@/lib/writerRecovery";

export function FirstEntryRecoveryBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      setOpen(shouldShowFirstEntryRecoveryNudge() && !isCloudStorageMode());
    };
    sync();
    window.addEventListener(CLOUD_STORAGE_MODE_EVENT, sync);
    return () => window.removeEventListener(CLOUD_STORAGE_MODE_EVENT, sync);
  }, []);

  if (!open) return null;

  return (
    <div
      className="mb-6 rounded-lg border border-amber-200/70 bg-amber-50/60 px-4 py-3 dark:border-amber-900/45 dark:bg-amber-950/25"
      role="status"
    >
      <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-100">
        刚写下第一篇。{WRITER_RECOVERY_HINT}
      </p>
      <button
        type="button"
        className="mt-2 text-xs text-zinc-500 underline underline-offset-2 decoration-zinc-300/80 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        onClick={() => {
          setFirstEntryRecoveryNudge(false);
          setOpen(false);
        }}
      >
        知道了
      </button>
    </div>
  );
}
