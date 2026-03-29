export type Question = {
  id: string; // uuid string (keep stable)
  title: string;
  body?: string;
  pool:
    | "expression_self_exploration" // 首页默认池：表达型自我探索
    | "explore_journey" // 自我探索：主题旅程
    | "create_pool"; // 创作表达：创作池
};

export type ThemeJourney = {
  id: string;
  title: string;
  description: string;
  questionIds: string[];
};

// --- 题库（前端单一数据源）---
// 维护建议：
// - 只在这里增删改题目与归类
// - id 保持不变（uuid），方便以后接数据库/共写页/统计

export const QUESTIONS: Question[] = [
  // 首页默认池：表达型自我探索（expression_self_exploration）
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e01",
    pool: "expression_self_exploration",
    title: "今天哪一刻，你最不像在演别人期待的样子？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e02",
    pool: "expression_self_exploration",
    title: "最近哪件小事，让你心里“咯噔”了一下？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e03",
    pool: "expression_self_exploration",
    title: "如果今天只能对自己诚实一句话，你会说什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e04",
    pool: "expression_self_exploration",
    title: "你最近在硬撑什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e05",
    pool: "expression_self_exploration",
    title: "今天最想关掉的一种声音，是什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e06",
    pool: "expression_self_exploration",
    title: "最近哪件事表面不大，你却一直过不去？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e07",
    pool: "expression_self_exploration",
    title: "如果今天可以少懂事一点，你最想做什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e08",
    pool: "expression_self_exploration",
    title: "你最近最想逃开的一个场景，是什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e09",
    pool: "expression_self_exploration",
    title: "今天哪个瞬间，你有点想抱抱自己？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e10",
    pool: "expression_self_exploration",
    title: "最近哪句话你没说出口，但一直卡在心里？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e11",
    pool: "expression_self_exploration",
    title: "你这几天最像一团什么东西？雾、刺、结、海绵，还是别的？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e12",
    pool: "expression_self_exploration",
    title: "如果把你现在的状态写成天气，会是什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e13",
    pool: "expression_self_exploration",
    title: "最近哪件小事，让你突然觉得“我真的有点累了”？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e14",
    pool: "expression_self_exploration",
    title: "今天你最想被理解的一件事，是什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e15",
    pool: "expression_self_exploration",
    title: "你最近在偷偷期待什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e16",
    pool: "expression_self_exploration",
    title: "如果不用解释，你现在最想写下哪一句话？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e17",
    pool: "expression_self_exploration",
    title: "今天最想留给自己的十分钟，你想拿来做什么？",
  },
  {
    id: "d2c3f4a1-3a6c-4b72-8a0a-1a2b3c4d5e18",
    pool: "expression_self_exploration",
    title: "最近哪个瞬间，让你觉得自己其实还蛮真实的？",
  },

  // 自我探索：主题旅程（三条，每条 7 题）
  // 旅程 1：关系边界与自我消耗
  {
    id: "a1000000-0000-4000-8000-000000000001",
    pool: "explore_journey",
    title: "最近一次你明明不想，却还是答应了别人，是什么时候？",
  },
  {
    id: "a1000000-0000-4000-8000-000000000002",
    pool: "explore_journey",
    title: "你最常在哪种关系里，自动变得很懂事？",
  },
  {
    id: "a1000000-0000-4000-8000-000000000003",
    pool: "explore_journey",
    title: "你对谁总是有耐心，对自己却没有？",
  },
  {
    id: "a1000000-0000-4000-8000-000000000004",
    pool: "explore_journey",
    title: "哪一种“麻烦别人”，会让你特别不安？",
  },
  {
    id: "a1000000-0000-4000-8000-000000000005",
    pool: "explore_journey",
    title: "你最想守住、却总被越过的一条边界，是什么？",
  },
  {
    id: "a1000000-0000-4000-8000-000000000006",
    pool: "explore_journey",
    title: "最近哪段关系让你嘴上说还好，身体却很累？",
  },
  {
    id: "a1000000-0000-4000-8000-000000000007",
    pool: "explore_journey",
    title: "如果重新定义“舒服的关系”，你希望它长什么样？",
  },

  // 旅程 2：倦怠、恢复、活人感
  {
    id: "a2000000-0000-4000-8000-000000000001",
    pool: "explore_journey",
    title: "最近哪一刻，你觉得自己像在自动驾驶？",
  },
  {
    id: "a2000000-0000-4000-8000-000000000002",
    pool: "explore_journey",
    title: "你这阵子最明显被什么耗掉了？",
  },
  {
    id: "a2000000-0000-4000-8000-000000000003",
    pool: "explore_journey",
    title: "什么样的小事，会把你从“麻木”里拉回来一点？",
  },
  {
    id: "a2000000-0000-4000-8000-000000000004",
    pool: "explore_journey",
    title: "你一天里最没有灵魂的时段，通常是什么时候？",
  },
  {
    id: "a2000000-0000-4000-8000-000000000005",
    pool: "explore_journey",
    title: "如果给现在的自己补一口能量，你最想补什么？",
  },
  {
    id: "a2000000-0000-4000-8000-000000000006",
    pool: "explore_journey",
    title: "最近有什么其实在求救，但你一直装作没听见？",
  },
  {
    id: "a2000000-0000-4000-8000-000000000007",
    pool: "explore_journey",
    title: "如果把“把自己捞回来”这件事变成一个小动作，它会是什么？",
  },

  // 旅程 3：重新开始 / 生活方向
  {
    id: "a3000000-0000-4000-8000-000000000001",
    pool: "explore_journey",
    title: "最近哪个生活片段，让你偷偷羡慕了很久？",
  },
  {
    id: "a3000000-0000-4000-8000-000000000002",
    pool: "explore_journey",
    title: "如果这周只认真对待一件事，你想选什么？",
  },
  {
    id: "a3000000-0000-4000-8000-000000000003",
    pool: "explore_journey",
    title: "你嘴上说算了，其实最没算了的是什么？",
  },
  {
    id: "a3000000-0000-4000-8000-000000000004",
    pool: "explore_journey",
    title: "如果不怕起步晚，你还想重新开始什么？",
  },
  {
    id: "a3000000-0000-4000-8000-000000000005",
    pool: "explore_journey",
    title: "你现在最想从生活里拿回来的一样东西，是什么？",
  },
  {
    id: "a3000000-0000-4000-8000-000000000006",
    pool: "explore_journey",
    title: "最近哪件事让你意识到：我不能再一直这样下去了？",
  },
  {
    id: "a3000000-0000-4000-8000-000000000007",
    pool: "explore_journey",
    title: "接下来一个月，你最想把自己往哪个方向轻轻挪一点？",
  },

  // 创作表达：创作池（创作一下）
  {
    id: "c1000000-0000-4000-8000-000000000001",
    pool: "create_pool",
    title: "写一顿最近让你有“活过来了”感觉的饭。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000002",
    pool: "create_pool",
    title: "写一个你舍不得发朋友圈、却很想记住的瞬间。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000003",
    pool: "create_pool",
    title: "写一条你最近走过很多次的路，它像不像你现在的生活？",
  },
  {
    id: "c1000000-0000-4000-8000-000000000004",
    pool: "create_pool",
    title: "写一个让你印象很深的陌生人，只写细节，不下结论。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000005",
    pool: "create_pool",
    title: "写一次通勤，把它写得像一部短片。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000006",
    pool: "create_pool",
    title: "写一个你最近总想回去的地方。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000007",
    pool: "create_pool",
    title: "写一件工作里很小、但很真实的委屈。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000008",
    pool: "create_pool",
    title: "写一次你没有拍照，却一直记得的风景。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000009",
    pool: "create_pool",
    title: "写一个今天的普通时刻，但把它写得很珍贵。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000010",
    pool: "create_pool",
    title: "写你房间里的一样东西，它最像你哪一部分？",
  },
  {
    id: "c1000000-0000-4000-8000-000000000011",
    pool: "create_pool",
    title: "写一种最近常常出现的声音，它陪你度过了什么。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000012",
    pool: "create_pool",
    title: "写一杯你最近常喝的东西，顺便写写你最近的状态。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000013",
    pool: "create_pool",
    title: "写一场没有发出去的脾气。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000014",
    pool: "create_pool",
    title: "写一次你“其实不想社交，但还是去了”的场合。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000015",
    pool: "create_pool",
    title: "写一个你最近很喜欢的傍晚。",
  },
  {
    id: "c1000000-0000-4000-8000-000000000016",
    pool: "create_pool",
    title: "写一次旅行里，真正打动你的不是景点的部分。",
  },
];

export const HOME_DEFAULT_POOL = QUESTIONS.filter(
  (q) => q.pool === "expression_self_exploration",
).map((q) => q.id);

export const THEME_JOURNEYS: ThemeJourney[] = [
  {
    id: "boundaries",
    title: "不想继续懂事了",
    description: "当你总在体谅别人，却越来越听不见自己。",
    questionIds: [
      "a1000000-0000-4000-8000-000000000001",
      "a1000000-0000-4000-8000-000000000002",
      "a1000000-0000-4000-8000-000000000003",
      "a1000000-0000-4000-8000-000000000004",
      "a1000000-0000-4000-8000-000000000005",
      "a1000000-0000-4000-8000-000000000006",
      "a1000000-0000-4000-8000-000000000007",
    ],
  },
  {
    id: "burnout",
    title: "把自己慢慢捞回来",
    description: "当你有点麻木、有点累、有点不像自己。",
    questionIds: [
      "a2000000-0000-4000-8000-000000000001",
      "a2000000-0000-4000-8000-000000000002",
      "a2000000-0000-4000-8000-000000000003",
      "a2000000-0000-4000-8000-000000000004",
      "a2000000-0000-4000-8000-000000000005",
      "a2000000-0000-4000-8000-000000000006",
      "a2000000-0000-4000-8000-000000000007",
    ],
  },
  {
    id: "restart",
    title: "长出一些方向感",
    description:
      "不是一下子想通人生，只是把生活往更想去的方向挪一点。",
    questionIds: [
      "a3000000-0000-4000-8000-000000000001",
      "a3000000-0000-4000-8000-000000000002",
      "a3000000-0000-4000-8000-000000000003",
      "a3000000-0000-4000-8000-000000000004",
      "a3000000-0000-4000-8000-000000000005",
      "a3000000-0000-4000-8000-000000000006",
      "a3000000-0000-4000-8000-000000000007",
    ],
  },
];

/** 找灵感页用的「自我探索」列表：3 条主题旅程 + 潜意识书写（OH 卡），含付费/解锁状态 */
export type JourneyAccess = "free" | "paid";

export type InspirationJourney = {
  id: string;
  title: string;
  description: string;
  access: JourneyAccess;
  /** 主题旅程有 7 题；潜意识书写无，点进即写 */
  questionIds?: string[];
  /** 潜意识书写用外链；主题旅程用 /journeys/journey/[id] */
  href?: string;
};

export const EXPLORE_JOURNEYS: InspirationJourney[] = [
  ...THEME_JOURNEYS.map((j) => ({
    id: j.id,
    title: j.title,
    description: j.description,
    access: "free" as const,
    questionIds: j.questionIds,
  })),
  {
    id: "oh",
    title: "潜意识书写",
    description: "先写下你想探索的事，再借一张图卡，看看潜意识想把你带去哪里。",
    access: "free",
    href: "/explore/oh",
  },
];

export function getJourneyById(id: string | null | undefined) {
  if (!id) return null;
  const theme = THEME_JOURNEYS.find((j) => j.id === id);
  if (theme) return theme;
  if (id === "oh")
    return {
      id: "oh",
      title: "潜意识书写",
      description: "先写下你想探索的事，再借一张图卡，看看潜意识想把你带去哪里。",
      questionIds: [],
    };
  return null;
}

/** 用于「我的房间」等展示旅程名称 */
export function getExploreJourneyTitle(id: string): string {
  const j = getJourneyById(id);
  return j?.title ?? id;
}

export type JourneyBrief = {
  forWho: string;
  principle: string;
  help: string;
};

export const JOURNEY_BRIEFS: Record<string, JourneyBrief> = {
  boundaries: {
    forWho: "在关系里容易过度负责、难以拒绝、常常感到疲惫和消耗的人。",
    principle:
      "通过边界觉察、情绪识别和关系模式反思，帮助用户识别“我为什么总在勉强自己”，以及“我在关系里到底失去了什么”。",
    help: "更清楚自己在哪些关系里容易失去边界，也更知道该如何把注意力和能量带回自己。",
  },
  burnout: {
    forWho: "长期疲惫、提不起劲、明明在过日子却常常感觉自己不在场的人。",
    principle:
      "通过状态觉察、情绪调节和能量回收，帮助用户从“我到底怎么了”慢慢走到“我可以怎么把自己一点点捞回来”。",
    help: "重新辨认什么在耗你，什么又真的能把你慢慢拉回来。",
  },
  restart: {
    forWho: "卡住、拖延、摇摆不定，但心里其实知道自己不能一直这样下去的人。",
    principle:
      "通过价值澄清、自我反思和小步行动，帮助用户从模糊、拖延和摇摆里，长出一点方向感。",
    help: "从“我好像哪里都不对劲”，慢慢走到“我接下来想往哪边靠一点”。",
  },
};

export const CREATE_POOL = QUESTIONS.filter((q) => q.pool === "create_pool").map(
  (q) => q.id,
);

export function getQuestionById(id: string | null | undefined) {
  if (!id) return null;
  return QUESTIONS.find((q) => q.id === id) ?? null;
}

export function pickHomeDefaultQuestionId(date = new Date()) {
  // 最简单可维护：按日期顺序轮换（避免每次刷新随机变化）
  const dayIndex = Math.floor(date.getTime() / 86400000); // days since epoch
  const pool = HOME_DEFAULT_POOL;
  if (pool.length === 0) return null;
  return pool[dayIndex % pool.length];
}

