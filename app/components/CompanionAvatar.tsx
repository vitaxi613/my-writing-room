"use client";

import Image from "next/image";
import type { CompanionPresetId } from "@/lib/companionTypes";
import { COMPANION_BEAVER_IMAGE_SRC } from "@/lib/companionAsset";

type Props = {
  /** 保留：与本地「陪伴形象」偏好一致；后续可接不同角色素材 */
  presetId: CompanionPresetId;
  className?: string;
};

/**
 * 圆形底座 + 主体优先素材（companion-beaver-ui）：脸与笔在圆内占主要视觉。
 */
export function CompanionAvatar({ presetId: _presetId, className = "" }: Props) {
  return (
    <span
      className={`relative inline-block h-12 w-12 shrink-0 overflow-hidden rounded-full border border-stone-200/75 bg-[#faf8f4] dark:border-zinc-600/45 dark:bg-zinc-900/50 ${className}`}
      aria-hidden
    >
      <Image
        src={COMPANION_BEAVER_IMAGE_SRC}
        alt=""
        fill
        sizes="28px"
        className="object-cover object-[50%_44%]"
        priority={false}
      />
    </span>
  );
}
