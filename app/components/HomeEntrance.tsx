"use client";

import { useEffect, useState } from "react";
import { HomePageShell } from "./HomePageShell";
import { JourneyHomeGate } from "./JourneyHomeGate";
import { shouldShowJourneyHomeGate } from "@/lib/journeyHomeGate";

type Props = {
  fallbackQuestionTitle: string | null;
};

/**
 * 首页入口：有进行中旅程时先轻量分流，再进入写作页。
 */
export function HomeEntrance({ fallbackQuestionTitle }: Props) {
  const [gate, setGate] = useState<"loading" | "show" | "hide">("loading");

  useEffect(() => {
    setGate(shouldShowJourneyHomeGate() ? "show" : "hide");
  }, []);

  if (gate === "loading") {
    return (
      <section
        className="paper-sheet paper-sheet--home-stage mx-auto w-full max-w-3xl px-4 py-12 sm:px-10 sm:py-14"
        aria-hidden
      >
        <div className="mx-auto max-w-md space-y-3">
          <div className="h-3 w-24 rounded-full bg-stone-200/80 dark:bg-stone-600/50" />
          <div className="h-3 w-full rounded-full bg-stone-200/60 dark:bg-stone-600/40" />
        </div>
      </section>
    );
  }

  if (gate === "show") {
    return <JourneyHomeGate onClose={() => setGate("hide")} />;
  }

  return <HomePageShell fallbackQuestionTitle={fallbackQuestionTitle} />;
}
