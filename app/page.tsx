import { Suspense } from "react";
import { HomeEntrance } from "./components/HomeEntrance";
import { getQuestionById, pickHomeDefaultQuestionId } from "@/lib/questionSystem";

function HomeWritingFallback() {
  return (
    <section
      className="paper-sheet paper-sheet--home-stage mx-auto w-full max-w-3xl px-4 py-12 sm:px-10 sm:py-14"
      aria-hidden
    >
      <div className="mx-auto max-w-md space-y-3">
        <div className="h-3 w-24 rounded-full bg-stone-200/80 dark:bg-stone-600/50" />
        <div className="h-3 w-full rounded-full bg-stone-200/60 dark:bg-stone-600/40" />
        <div className="h-3 w-[88%] rounded-full bg-stone-200/50 dark:bg-stone-600/35" />
      </div>
    </section>
  );
}

export default async function Home() {
  const pickedId = pickHomeDefaultQuestionId();
  const question = getQuestionById(pickedId);

  return (
    <div className="home-secret-garden">
      <div className="mx-auto w-full max-w-3xl px-3 pb-12 pt-1 sm:px-5">
        <Suspense fallback={<HomeWritingFallback />}>
          <HomeEntrance fallbackQuestionTitle={question?.title ?? null} />
        </Suspense>
      </div>
    </div>
  );
}
