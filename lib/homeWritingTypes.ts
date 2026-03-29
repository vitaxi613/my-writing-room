/** 首页文档内一行展示的旅程提示（非独立卡片） */
export type JourneyReminderLine = {
  journeyId: string;
  journeyTitle: string;
  day: number;
  questionTitle: string | null;
  href: string;
};
