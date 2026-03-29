import { getJourneyById } from "@/lib/questionSystem";
import { readJourneyProgress } from "@/lib/journeyProgress";

/** 本次浏览会话内用户选择「先随便写」，则不再挡首页 */
export const JOURNEY_HOME_GATE_SESSION_KEY = "wo-home-journey-gate-session";

export function getActiveJourneyDayHref(): string | null {
  if (typeof window === "undefined") return null;
  const p = readJourneyProgress();
  if (!p) return null;
  const j = getJourneyById(p.journeyId);
  if (!j || j.questionIds.length === 0) return null;
  /** 已全部写完则不再视为「进行中」挡首页 */
  if (p.currentDay > j.questionIds.length) return null;
  const day = Math.min(Math.max(1, p.currentDay), j.questionIds.length);
  return `/journeys/journey/${j.id}/day/${day}`;
}

export function shouldShowJourneyHomeGate(): boolean {
  if (typeof window === "undefined") return false;
  if (sessionStorage.getItem(JOURNEY_HOME_GATE_SESSION_KEY) === "skip")
    return false;
  return getActiveJourneyDayHref() !== null;
}

export function dismissJourneyHomeGateForSession(): void {
  sessionStorage.setItem(JOURNEY_HOME_GATE_SESSION_KEY, "skip");
}
