/**
 * 品牌 / 顶栏与房间标题（昵称来自 writerProfile，与 slug 无关）
 *
 * - 无昵称：「我写字的房间」
 * - 有昵称「葵葵」：「葵葵写字的房间」
 *
 * 客户端顶栏用 `SiteHeaderTitle` + `readWriterProfile()?.nickname` + `siteTitleWithWriter`。
 */
export const DEFAULT_WRITER_NAME = "我";

export const WRITER_NICKNAME_STORAGE_KEY = "wo-writer-nickname";

/** 顶栏站点名：{昵称或「我」}写字的房间 */
export function siteTitleWithWriter(nickname: string | null | undefined) {
  const n = nickname?.trim() || DEFAULT_WRITER_NAME;
  return `${n}写字的房间`;
}

/** 与 `siteTitleWithWriter` 一致（历史别名，避免「的」字混用） */
export function homeRoomTitle(nickname: string | null | undefined): string {
  return siteTitleWithWriter(nickname);
}
