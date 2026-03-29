"use client";

import { useEffect, useState } from "react";
import { WRITER_RECOVERY_HINT } from "@/lib/writerRecovery";
import { RoomBindEmailPanel } from "@/app/components/RoomBindEmailPanel";
import {
  CLOUD_STORAGE_MODE_EVENT,
  isCloudStorageMode,
} from "@/lib/storageMode";
import { isWritingRoomAuthConfigured } from "@/lib/supabase/browser";

type Props = {
  className?: string;
};

export function RecoveryBindingHint({ className = "" }: Props) {
  const [cloud, setCloud] = useState(false);

  useEffect(() => {
    const sync = () => setCloud(isCloudStorageMode());
    sync();
    window.addEventListener(CLOUD_STORAGE_MODE_EVENT, sync);
    return () => window.removeEventListener(CLOUD_STORAGE_MODE_EVENT, sync);
  }, []);

  const configured = isWritingRoomAuthConfigured();

  if (cloud) {
    return (
      <div className={`max-w-xl space-y-2 ${className}`}>
        <RoomBindEmailPanel />
      </div>
    );
  }

  return (
    <div className={`max-w-xl space-y-3 ${className}`} data-recovery-hint="bind">
      <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
        {WRITER_RECOVERY_HINT}
      </p>
      {configured ? <RoomBindEmailPanel /> : null}
    </div>
  );
}
