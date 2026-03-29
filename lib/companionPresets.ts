import type { CompanionPreset, CompanionPresetId } from "./companionTypes";

/**
 * 首页陪伴句：轻推开写（非安抚）。
 * 形象差异主要在头像；登录/注册后再选定形象并写入 wo-companion-preset。
 */
/** 首页页首陪写：鼓励式、不硬、少鸡汤；与头像搭配轮换 */
/** 勿与首页正文 placeholder 重复（正文区单独文案在 HomeDiaryComposer） */
const HOME_PUSH_WHISPERS = [
  "写吧，在这里看见自己。",
  "先写一句，就好。",
  "卡住也没关系，挑一句就够。",
] as const;

export const COMPANION_PRESETS: readonly CompanionPreset[] = [
  {
    id: "snail",
    label: "小蜗牛",
    description: "慢吞吞地，陪你写",
    homeWhispers: HOME_PUSH_WHISPERS,
  },
  {
    id: "firefly",
    label: "小萤火",
    description: "一点点光，就够照亮这一页",
    homeWhispers: HOME_PUSH_WHISPERS,
  },
  {
    id: "leaf",
    label: "小叶子",
    description: "轻轻落在一页纸上",
    homeWhispers: HOME_PUSH_WHISPERS,
  },
] as const;

const DEFAULT_ID: CompanionPresetId = "snail";

export function getCompanionPresetById(
  id: string | null | undefined
): CompanionPreset {
  const found = COMPANION_PRESETS.find((p) => p.id === id);
  return found ?? COMPANION_PRESETS.find((p) => p.id === DEFAULT_ID)!;
}

export function isCompanionPresetId(id: string): id is CompanionPresetId {
  return id === "snail" || id === "firefly" || id === "leaf";
}

/** 首页文档内陪伴句（UTC 日期种子，避免 SSR/hydration 不一致） */
export function pickHomeWhisper(presetId: CompanionPresetId): string {
  const pool = getCompanionPresetById(presetId).homeWhispers;
  const d = new Date();
  const seed =
    d.getUTCFullYear() * 400 +
    (d.getUTCMonth() + 1) * 31 +
    d.getUTCDate() +
    presetId.charCodeAt(0);
  return pool[seed % pool.length] ?? pool[0];
}
