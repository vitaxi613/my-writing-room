"use client";

import { useEffect, useState } from "react";
import type { CompanionPresetId } from "@/lib/companionTypes";
import { readCompanionPresetId } from "@/lib/companionPreference";
import { CompanionAvatar } from "./CompanionAvatar";

type Props = {
  children: React.ReactNode;
  /** 不传则从本地偏好读取（与设置里的陪伴形象一致） */
  presetId?: CompanionPresetId;
  className?: string;
};

/**
 * 全站统一的「陪伴助手」：左侧头像 + 一句带「」的轻声话，非系统提示。
 * 文案请勿自带「」，由组件包裹。
 */
export function CompanionAssistant({
  children,
  presetId: controlledPresetId,
  className = "",
}: Props) {
  const [presetId, setPresetId] = useState<CompanionPresetId>(
    controlledPresetId ?? "snail",
  );

  useEffect(() => {
    if (controlledPresetId !== undefined) {
      setPresetId(controlledPresetId);
      return;
    }
    setPresetId(readCompanionPresetId());
  }, [controlledPresetId]);

  return (
    <div
      className={`flex items-center gap-2.5 text-sm leading-[1.6] text-[#8A8A8A] dark:text-zinc-400 ${className}`}
    >
      <CompanionAvatar
        presetId={presetId}
        className="!h-7 !w-7 shrink-0"
      />
      <span className="font-sans font-normal tracking-normal">
        「{children}」
      </span>
    </div>
  );
}
