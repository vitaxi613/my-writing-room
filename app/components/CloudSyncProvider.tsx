"use client";

import { useEffect } from "react";
import { isWritingRoomAuthConfigured } from "@/lib/supabase/browser";
import { bootstrapWritingRoomCloudSync } from "@/lib/cloudWritingRoomSync";

export function CloudSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!isWritingRoomAuthConfigured()) return;
    bootstrapWritingRoomCloudSync();
  }, []);

  return <>{children}</>;
}
