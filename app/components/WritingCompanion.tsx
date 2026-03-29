"use client";

import { useEffect, useMemo, useState } from "react";
import type { CompanionPresetId } from "@/lib/companionTypes";
import { readCompanionPresetId } from "@/lib/companionPreference";
import { pickHomeWhisper } from "@/lib/companionPresets";
import { CompanionAssistant } from "./CompanionAssistant";

type Variant = "home" | "inspiration" | "me" | "after" | "public";

function pickLine(variant: Variant, pool: readonly string[]) {
  const d = new Date();
  const seed =
    d.getFullYear() * 400 +
    (d.getMonth() + 1) * 31 +
    d.getDate() +
    variant.charCodeAt(0);
  return pool[seed % pool.length] ?? pool[0];
}

const MESSAGES_INSPIRATION = [
  "卡住也没关系，挑一句就够。",
  "灵感只是开头而已。",
] as const;

const MESSAGES_ME = [
  "你写下的字，会一直在。",
  "翻一翻，像翻自己的一页纸。",
] as const;

const MESSAGES_AFTER = ["已经收好了，想改随时回来。"] as const;

const MESSAGES_PUBLIC = [
  "慢慢读，碰上一句就轻轻回。",
  "让某一句在心上停一会儿。",
  "翻页轻一点就好。",
] as const;

const POOLS: Record<Exclude<Variant, "home">, readonly string[]> = {
  inspiration: MESSAGES_INSPIRATION,
  me: MESSAGES_ME,
  after: MESSAGES_AFTER,
  public: MESSAGES_PUBLIC,
};

type Props = {
  variant: Variant;
  message?: string;
  className?: string;
  /** 首页：文案按形象轮换；其它页仍用同头像图 */
  companionPresetId?: CompanionPresetId;
};

/**
 * 轻量陪伴：安静、非教导。与 CompanionAssistant 版式一致。
 */
export function WritingCompanion({
  variant,
  message,
  className = "",
  companionPresetId: companionPresetIdProp,
}: Props) {
  const [presetId, setPresetId] = useState<CompanionPresetId>("snail");

  useEffect(() => {
    setPresetId(readCompanionPresetId());
  }, []);

  useEffect(() => {
    if (companionPresetIdProp !== undefined) {
      setPresetId(companionPresetIdProp);
    }
  }, [companionPresetIdProp]);

  const text = useMemo(() => {
    if (message) return message;
    if (variant === "home") {
      return pickHomeWhisper(presetId);
    }
    const pool = POOLS[variant];
    return pickLine(variant, pool);
  }, [variant, message, presetId]);

  return (
    <aside className={className} aria-label="陪伴提示">
      <CompanionAssistant presetId={presetId}>{text}</CompanionAssistant>
    </aside>
  );
}
