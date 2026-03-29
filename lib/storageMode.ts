/**
 * 云端同步开关（与 Supabase 会话配合使用）。
 * 未登录或未绑定成功前不应为 true。
 */
export const WRITING_ROOM_CLOUD_SYNC_KEY = "wo-writing-room-cloud-sync";

export const CLOUD_STORAGE_MODE_EVENT = "wo-writing-room-cloud-mode-changed";

export function isCloudStorageMode(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(WRITING_ROOM_CLOUD_SYNC_KEY) === "1";
}

export function setCloudStorageMode(enabled: boolean): void {
  if (typeof window === "undefined") return;
  if (enabled) {
    window.localStorage.setItem(WRITING_ROOM_CLOUD_SYNC_KEY, "1");
  } else {
    window.localStorage.removeItem(WRITING_ROOM_CLOUD_SYNC_KEY);
  }
  window.dispatchEvent(new Event(CLOUD_STORAGE_MODE_EVENT));
}

/** 第一篇日记保存后，在「我的房间」轻提示一次（可关闭） */
export const FIRST_ENTRY_RECOVERY_NUDGE_KEY = "wo-recovery-nudge-after-first-entry";

export function shouldShowFirstEntryRecoveryNudge(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(FIRST_ENTRY_RECOVERY_NUDGE_KEY) === "1";
}

export function setFirstEntryRecoveryNudge(show: boolean): void {
  if (typeof window === "undefined") return;
  if (show) {
    window.localStorage.setItem(FIRST_ENTRY_RECOVERY_NUDGE_KEY, "1");
  } else {
    window.localStorage.removeItem(FIRST_ENTRY_RECOVERY_NUDGE_KEY);
  }
}
