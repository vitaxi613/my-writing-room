export const FREE_WRITING_PROMPTS = [
  "今天先写一句没说出口的话。",
  "从“我其实……”这三个字开始写。",
  "写一件今天很小，但你有感觉的事。",
  "先别讲道理，只讲发生了什么。",
  "就当你在给自己发一条长消息。",
] as const;

export const TODAY_SPEECH_PROMPTS = [
  "从今天最想藏起来的那件小事开始写。",
  "写一句你白天没说出口的话。",
  "把今天过得最像你的一刻留下来。",
  "写一个你舍不得交给今天过去的瞬间。",
  "从“我其实一直知道……”写起。",
  "写下今天让你心里轻轻一沉的那一下。",
  "把今天的自己，写成一种天气。",
  "先别讲道理，先把发生过的事写下来。",
  "给今天起一个标题，然后顺着它写。",
  "从你现在最想靠近的东西开始写。",
  "写一个今天没有人注意到、但你记住了的细节。",
  "只写一段也可以，先把自己放下来。",
] as const;

/** 与 UTC 日期绑定，避免「今日一句」在 SSR 与客户端 hydration 不一致 */
export function pickTodaySpeechPromptIndex(): number {
  const d = new Date();
  const seed =
    d.getUTCFullYear() * 400 +
    (d.getUTCMonth() + 1) * 31 +
    d.getUTCDate();
  return seed % TODAY_SPEECH_PROMPTS.length;
}

export const INLINE_INSPIRATION_CARDS = [
  "先写一句最诚实的开头：\"今天的我，其实……\"",
  "把今天最想对自己说的一句话写出来，然后解释为什么。",
  "写一个具体场景：你在哪里？听到/看到什么？身体有什么感觉？",
  "如果要给今天的自己留一条“明天再看”的便签，你会写什么？",
  "从一个小细节开始：灯光、天气、路上的声音、某个人的表情。",
  "用三个词形容今天的你，挑一个词往下写。",
] as const;

export type OhCard = {
  id: string;
  title: string;
  prompt: string;
  imageSrc: string;
};

export const OH_CARDS: OhCard[] = [
  {
    id: "window",
    title: "窗",
    prompt: "这张图让你想起了什么场景？先写一个“你看见的画面”，再写它带来的感受。",
    imageSrc: "/window.svg",
  },
  {
    id: "file",
    title: "文件夹",
    prompt: "如果这张图是一段记忆的入口，你会打开哪一个？写下你愿意靠近的那段。",
    imageSrc: "/file.svg",
  },
  {
    id: "mark",
    title: "标记",
    prompt: "把它当作一个提示符：从“我其实一直在……”开始写，看看会出现什么。",
    imageSrc: "/vercel.svg",
  },
];

