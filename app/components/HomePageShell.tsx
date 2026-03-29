"use client";

import { useState } from "react";
import { HomeDiaryComposer } from "./HomeDiaryComposer";

const HOME_ROOM_HINT_KEY = "wo-home-room-hint-shown";

function HomeRoomFirstLine() {
  const [visible] = useState(() => {
    if (typeof window === "undefined") return false;
    if (window.localStorage.getItem(HOME_ROOM_HINT_KEY)) return false;
    window.localStorage.setItem(HOME_ROOM_HINT_KEY, "1");
    return true;
  });

  if (!visible) return null;
  return (
    <p className="font-writing-body mb-6 text-center text-sm text-zinc-500/95 dark:text-zinc-400/90">
      这里是你的房间。
    </p>
  );
}

type Props = {
  fallbackQuestionTitle: string | null;
};

/**
 * 首页：单页稿纸文档，沉浸写作。
 */
export function HomePageShell({ fallbackQuestionTitle }: Props) {
  return (
    <section className="paper-sheet paper-sheet--home-stage relative z-[1] mx-auto w-full max-w-3xl px-4 py-8 sm:px-10 sm:py-12">
      <HomeRoomFirstLine />
      <HomeDiaryComposer fallbackQuestionTitle={fallbackQuestionTitle} />
    </section>
  );
}
