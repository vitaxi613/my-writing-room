"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  HOME_BEAVER_IMAGE_HEIGHT,
  HOME_BEAVER_IMAGE_SRC,
  HOME_BEAVER_IMAGE_USE_SCREEN_KNOCKOUT,
  HOME_BEAVER_IMAGE_WIDTH,
} from "@/lib/beaverHomeAsset";
import type { HomeBeaverLayoutVariant } from "@/lib/homeBeaverLayout";

type Props = {
  variant: HomeBeaverLayoutVariant;
};

/**
 * 页边陪写：仅图，无叠字。锚在稿纸 home-writing-sheet 内边角，小体量、低层级。
 */
export function HomeBeaverCompanion({ variant }: Props) {
  const layout = useMemo(() => {
    switch (variant) {
      case "peek-bl":
        return {
          wrap: "left-0 bottom-0 translate-x-0 translate-y-[10%] w-[min(28vw,6.5rem)] sm:w-28",
          crop: "h-[5.75rem] sm:h-24",
          object: "object-contain object-bottom object-left",
        };
      case "edge-sticker":
        return {
          wrap: "right-0 top-[42%] bottom-auto -translate-y-1/2 translate-x-[1%] w-[min(24vw,5.5rem)] sm:w-[5.75rem] rotate-[3deg]",
          crop: "h-[5rem] sm:h-[5.25rem]",
          object: "object-contain object-center object-right",
        };
      case "peek-br":
      default:
        return {
          wrap: "right-0 bottom-0 translate-x-0 translate-y-[10%] w-[min(30vw,6.75rem)] sm:w-28",
          crop: "h-[6rem] sm:h-[6.25rem]",
          object: "object-contain object-bottom object-right",
        };
    }
  }, [variant]);

  const blendClass = HOME_BEAVER_IMAGE_USE_SCREEN_KNOCKOUT
    ? "home-beaver-figure__blend"
    : "";

  return (
    <div
      className={`pointer-events-none absolute z-[1] select-none ${layout.wrap}`}
      aria-hidden
    >
      <div className="home-beaver-drop">
        <div className={`relative w-full overflow-hidden ${layout.crop}`}>
          <Image
            src={HOME_BEAVER_IMAGE_SRC}
            alt=""
            width={HOME_BEAVER_IMAGE_WIDTH}
            height={HOME_BEAVER_IMAGE_HEIGHT}
            className={`h-full w-full ${blendClass} ${layout.object}`}
            priority={false}
          />
        </div>
      </div>
    </div>
  );
}
