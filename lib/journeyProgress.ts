"use client";

export type JourneyProgress = {
  journeyId: string;
  currentDay: number;
  totalDays: number;
  lastWrittenAt: string;
  /** 当天选择“稍后再写”后隐藏提醒 */
  dismissedOnDate?: string;
};

export const JOURNEY_PROGRESS_KEY = "wo-writing-room-journey-progress";

function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function readJourneyProgress(): JourneyProgress | null {
  const raw = window.localStorage.getItem(JOURNEY_PROGRESS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as JourneyProgress;
  } catch {
    return null;
  }
}

export function writeJourneyProgress(progress: JourneyProgress) {
  window.localStorage.setItem(JOURNEY_PROGRESS_KEY, JSON.stringify(progress));
}

export function startJourneyProgress(journeyId: string, totalDays: number) {
  writeJourneyProgress({
    journeyId,
    currentDay: 1,
    totalDays: Math.max(1, totalDays),
    lastWrittenAt: new Date().toISOString(),
  });
}

export function advanceJourneyDay(journeyId: string) {
  const p = readJourneyProgress();
  if (!p || p.journeyId !== journeyId) return;
  if (p.currentDay < p.totalDays) {
    p.currentDay += 1;
  }
  p.lastWrittenAt = new Date().toISOString();
  p.dismissedOnDate = undefined;
  writeJourneyProgress(p);
}

export function dismissJourneyReminderToday() {
  const p = readJourneyProgress();
  if (!p) return;
  p.dismissedOnDate = todayKey();
  writeJourneyProgress(p);
}

export function shouldShowJourneyReminder() {
  const p = readJourneyProgress();
  if (!p) return false;
  // 规则：只有在“第二天/之后再来首页”时提醒。
  // 如果用户今天已经写过（lastWrittenAt 同日），就不展示提醒。
  const lastKey = todayKey(new Date(p.lastWrittenAt));
  if (lastKey === todayKey()) return false;
  return p.dismissedOnDate !== todayKey();
}

