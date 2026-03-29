import {
  COMPANION_PRESET_STORAGE_KEY,
  type CompanionPresetId,
} from "./companionTypes";
import { getCompanionPresetById, isCompanionPresetId } from "./companionPresets";

/**
 * 读本地陪伴偏好（浏览器端）。
 * 选择陪伴形象应在注册/登录流程中完成并写入该 key；首页只展示，不提供切换。
 */
export function readCompanionPresetId(): CompanionPresetId {
  if (typeof window === "undefined") return "snail";
  const raw = window.localStorage.getItem(COMPANION_PRESET_STORAGE_KEY);
  if (raw && isCompanionPresetId(raw)) return raw;
  return "snail";
}

export function writeCompanionPresetId(id: CompanionPresetId): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(COMPANION_PRESET_STORAGE_KEY, id);
}

export function readCompanionPreset() {
  return getCompanionPresetById(readCompanionPresetId());
}
