/**
 * 陪伴形象（安静陪伴，非教学型助手）
 * 登录后可由服务端 profile.companionPresetId 覆盖本地偏好。
 */
export type CompanionPresetId = "snail" | "firefly" | "leaf";

export type CompanionPreset = {
  id: CompanionPresetId;
  /** 列表/设置里展示 */
  label: string;
  /** 给后续无障碍/设置用 */
  description: string;
  /** 首页轮换的轻提示（手写短句） */
  homeWhispers: readonly string[];
};

/** localStorage：当前选中的陪伴形象（登录前也可用） */
export const COMPANION_PRESET_STORAGE_KEY = "wo-companion-preset";
