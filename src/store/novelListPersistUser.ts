/**
 * 按登录用户隔离 novelList 的 localStorage，避免同一浏览器切换账号时看到上一用户的小说。
 */
export const NOVEL_LIST_PERSIST_NAME = 'novelList';

let persistUserId: string | null = null;

export function setNovelListPersistUserId(userId: string | null): void {
  persistUserId = userId;
}

export function getNovelListPersistSuffix(): string {
  return persistUserId ?? '__logged_out__';
}

/** 当前用户对应的完整 localStorage 键（与 zustand persist 写入的键一致） */
export function getNovelListStorageKey(): string {
  return `${NOVEL_LIST_PERSIST_NAME}:${getNovelListPersistSuffix()}`;
}

/** 将旧版未分区的 novelList 迁移到当前用户分区（仅当新键尚无数据时），迁移后删除旧键以避免跨账号污染 */
export function migrateLegacyNovelListToUser(userId: string): void {
  if (typeof window === 'undefined') return;
  const legacy = localStorage.getItem(NOVEL_LIST_PERSIST_NAME);
  const partitioned = localStorage.getItem(`${NOVEL_LIST_PERSIST_NAME}:${userId}`);
  if (legacy && !partitioned) {
    localStorage.setItem(`${NOVEL_LIST_PERSIST_NAME}:${userId}`, legacy);
    // 迁移后删除旧键，防止不同账号通过旧键看到同一批数据
    localStorage.removeItem(NOVEL_LIST_PERSIST_NAME);
  }
}

/** 读取当前分区下持久化的小说列表（zustand persist 结构） */
export function readPersistedNovelsFromLocalStorage(): unknown[] | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(getNovelListStorageKey());
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { state?: { novels?: unknown } };
    const novels = parsed?.state?.novels;
    return Array.isArray(novels) ? novels : null;
  } catch {
    return null;
  }
}

/** 与 zustand createJSONStorage 配合：按用户读写不同键 */
export function createNovelListPartitionedStorage(): Pick<
  Storage,
  'getItem' | 'setItem' | 'removeItem'
> {
  return {
    getItem: (name: string) => localStorage.getItem(`${name}:${getNovelListPersistSuffix()}`),
    setItem: (name: string, value: string) =>
      localStorage.setItem(`${name}:${getNovelListPersistSuffix()}`, value),
    removeItem: (name: string) => localStorage.removeItem(`${name}:${getNovelListPersistSuffix()}`),
  };
}
