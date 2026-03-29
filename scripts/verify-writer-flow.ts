/**
 * 自测：模拟浏览器 localStorage，走 prependDiaryEntry 真实代码路径。
 * 运行：npx --yes tsx scripts/verify-writer-flow.ts
 */
import type { DiaryEntry } from "../lib/diaryTypes";
import { DIARY_STORAGE_KEY } from "../lib/diaryTypes";
import { prependDiaryEntry, readDiaryEntries } from "../lib/diaryStore";
import { resolveEntryAuthor } from "../lib/entryAuthorClient";
import { WRITER_PROFILE_STORAGE_KEY } from "../lib/writerProfile";

function makeEnv() {
  const mem: Record<string, string> = {};
  const ls = {
    getItem: (k: string) =>
      Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null,
    setItem: (k: string, v: string) => {
      mem[k] = v;
    },
    removeItem: (k: string) => {
      delete mem[k];
    },
  };
  (globalThis as unknown as { window: { localStorage: typeof ls; dispatchEvent: () => void } }).window =
    {
      localStorage: ls,
      dispatchEvent: () => {},
    };
  return mem;
}

function log(label: string, obj: unknown) {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(obj, null, 2));
}

const profileJson = JSON.stringify({
  writerId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
  writerSlug: "aaaabbbbcccc",
  nickname: "自测昵称",
  bio: null,
  updatedAt: Date.now(),
});

// ----- A：新日记（prependDiaryEntry） -----
const memA = makeEnv();
memA[WRITER_PROFILE_STORAGE_KEY] = profileJson;

const newEntry: DiaryEntry = {
  id: "new-public-1",
  title: "自测公开日记",
  content: "prependDiaryEntry 注入作者字段自测正文",
  createdAt: new Date().toISOString(),
  visibility: "public",
};

prependDiaryEntry(newEntry);
const eNew = readDiaryEntries().find((e) => e.id === "new-public-1");

log("A 新日记 entry（readDiaryEntries）", {
  id: eNew?.id,
  title: eNew?.title,
  visibility: eNew?.visibility,
  writerId: eNew?.writerId,
  writerSlug: eNew?.writerSlug,
  writerNicknameSnapshot: eNew?.writerNicknameSnapshot,
});
log("A resolveEntryAuthor(新日记)", eNew ? resolveEntryAuthor(eNew) : null);

// ----- B：旧样式（仅 localStorage 数组，无 writer 字段） -----
const memB = makeEnv();
memB[WRITER_PROFILE_STORAGE_KEY] = profileJson;
memB[DIARY_STORAGE_KEY] = JSON.stringify([
  {
    id: "old-like-1",
    title: "旧数据样式",
    content: "无 writer 字段",
    createdAt: new Date().toISOString(),
    visibility: "public",
  } satisfies DiaryEntry,
]);

const eOld = readDiaryEntries().find((e) => e.id === "old-like-1");
log("B 旧样式 entry", {
  id: eOld?.id,
  writerId: eOld?.writerId,
  writerSlug: eOld?.writerSlug,
  writerNicknameSnapshot: eOld?.writerNicknameSnapshot,
});
log("B resolveEntryAuthor(旧样式)", eOld ? resolveEntryAuthor(eOld) : null);

console.log("\n=== 自测结论 ===");
const newOk =
  Boolean(eNew?.writerId && eNew?.writerSlug) &&
  eNew?.writerNicknameSnapshot === "自测昵称" &&
  Boolean(resolveEntryAuthor(eNew!).slug);
console.log(newOk ? "新日记：字段齐全且 slug 非空 → 列表与阅读页应可跳转 /room/[slug]" : "新日记：链路异常 ✗");

const oldSlug = eOld ? resolveEntryAuthor(eOld).slug : null;
console.log(
  !oldSlug
    ? "旧日记：无 writerSlug → resolveEntryAuthor.slug 为空 → 作者入口不可点（仅名字可能显示为 profile 昵称或「一位写字的人」）"
    : "旧日记：意外存在 slug ✗",
);
