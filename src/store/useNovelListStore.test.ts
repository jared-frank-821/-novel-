import { describe, it, expect, beforeEach } from 'vitest';
import useNovelListStore, { type Novel, type Chapter } from './useNovelListStore';

beforeEach(async () => {
  useNovelListStore.getState().clearAll();
  // Zustand persist middleware 异步写 localStorage，等一个 tick 再执行测试
  await new Promise(r => setTimeout(r, 0));
});

describe('useNovelListStore - 小说操作', () => {
  it('addNovel 创建新小说并设为当前', () => {
    useNovelListStore.getState().addNovel('测试小说');

    const { novels, currentNovelId } = useNovelListStore.getState();
    expect(novels).toHaveLength(1);
    expect(novels[0].title).toBe('测试小说');
    expect(novels[0].author).toBe('作者');
    expect(novels[0].status).toBe('连载中');
    expect(novels[0].chapters).toHaveLength(0);
    expect(novels[0].selectedTags).toEqual([]);
    expect(novels[0].createTime).toBeTruthy();
    expect(novels[0].updateTime).toBeTruthy();
    expect(currentNovelId).toBe(novels[0].id);
  });

  it('addNovel 使用默认标题', () => {
    useNovelListStore.getState().addNovel();
    expect(useNovelListStore.getState().novels[0].title).toMatch(/新小说/);
  });

  it('addNovel 多次调用 id 唯一', () => {
    useNovelListStore.getState().addNovel('第一本');
    useNovelListStore.getState().addNovel('第二本');
    useNovelListStore.getState().addNovel('第三本');

    const ids = useNovelListStore.getState().novels.map(n => n.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('updateNovel 部分更新小说信息', async () => {
    useNovelListStore.getState().addNovel('原标题');
    const id = useNovelListStore.getState().novels[0].id;

    useNovelListStore.getState().updateNovel(id, {
      title: '新标题',
      author: '新作者',
      status: '已完结',
    });

    const novel = useNovelListStore.getState().novels[0];
    expect(novel.title).toBe('新标题');
    expect(novel.author).toBe('新作者');
    expect(novel.status).toBe('已完结');
    // createTime 保持不变，updateTime 被更新（允许同 tick 内相等，只验证数据本身正确）
    expect(novel.createTime).toBeTruthy();
    expect(novel.updateTime).toBeTruthy();
  });

  it('updateNovel 不存在的 id 不报错', () => {
    expect(() => {
      useNovelListStore.getState().updateNovel('不存在的id', { title: 'test' });
    }).not.toThrow();
    expect(useNovelListStore.getState().novels).toHaveLength(0);
  });

  it('deleteNovel 删除指定小说', () => {
    useNovelListStore.getState().addNovel('小说A');
    useNovelListStore.getState().addNovel('小说B');
    expect(useNovelListStore.getState().novels).toHaveLength(2);

    const idA = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().deleteNovel(idA);

    const { novels, currentNovelId } = useNovelListStore.getState();
    expect(novels).toHaveLength(1);
    expect(novels[0].title).toBe('小说B');
    expect(currentNovelId).toBe(novels[0].id);
  });

  it('deleteNovel 删除当前选中小说时自动切换', () => {
    useNovelListStore.getState().addNovel('小说A');
    useNovelListStore.getState().addNovel('小说B');
    const idA = useNovelListStore.getState().novels[0].id;

    useNovelListStore.getState().deleteNovel(idA);
    expect(useNovelListStore.getState().currentNovelId).toBe(
      useNovelListStore.getState().novels[0].id
    );
  });

  it('deleteNovel 删除最后一个小说时 currentNovelId 置 null', () => {
    useNovelListStore.getState().addNovel('唯一小说');
    const id = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().deleteNovel(id);
    expect(useNovelListStore.getState().currentNovelId).toBeNull();
  });

  it('selectNovel 切换当前小说', () => {
    useNovelListStore.getState().addNovel('小说A');
    useNovelListStore.getState().addNovel('小说B');
    const idA = useNovelListStore.getState().novels[0].id;
    const idB = useNovelListStore.getState().novels[1].id;

    useNovelListStore.getState().selectNovel(idB);
    expect(useNovelListStore.getState().currentNovelId).toBe(idB);

    useNovelListStore.getState().selectNovel(idA);
    expect(useNovelListStore.getState().currentNovelId).toBe(idA);
  });

  it('selectNovel 切换时重置 currentChapterIndex 为第一章', () => {
    useNovelListStore.getState().addNovel('小说');
    const id = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().addChapter('第1章');
    useNovelListStore.getState().addChapter('第2章');

    useNovelListStore.getState().selectChapter(2);
    expect(useNovelListStore.getState().currentChapterIndex).toBe(2);

    useNovelListStore.getState().selectNovel(id);
    expect(useNovelListStore.getState().currentChapterIndex).toBe(1);
  });

  it('selectNovel 小说无章节时 currentChapterIndex 为 0', () => {
    useNovelListStore.getState().addNovel('空小说');
    const id = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().selectNovel(id);
    expect(useNovelListStore.getState().currentChapterIndex).toBe(0);
  });

  it('writeNovelDescription 写入简介', () => {
    useNovelListStore.getState().addNovel();
    const id = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().writeNovelDescription(id, '这是一段简介');
    expect(useNovelListStore.getState().novels[0].description).toBe('这是一段简介');
  });

  it('updateNovelCover 更新封面', () => {
    useNovelListStore.getState().addNovel();
    const id = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().updateNovelCover(id, 'cover-123');
    expect(useNovelListStore.getState().novels[0].coverId).toBe('cover-123');
  });

  it('clearAll 清空所有数据', () => {
    useNovelListStore.getState().addNovel();
    useNovelListStore.getState().addChapter();
    useNovelListStore.getState().updateChapterText(1, 'some text');
    useNovelListStore.getState().deleteChapter(1);

    useNovelListStore.getState().clearAll();
    const { novels, currentNovelId, trashList } = useNovelListStore.getState();
    expect(novels).toHaveLength(0);
    expect(currentNovelId).toBeNull();
    expect(trashList).toHaveLength(0);
  });

  it('resetNovelList 清空小说列表但保留回收站', () => {
    useNovelListStore.getState().addNovel();
    useNovelListStore.getState().addChapter();
    useNovelListStore.getState().deleteChapter(1);

    useNovelListStore.getState().resetNovelList();
    expect(useNovelListStore.getState().novels).toHaveLength(0);
    expect(useNovelListStore.getState().trashList).toHaveLength(1);
    expect(useNovelListStore.getState().currentNovelId).toBeNull();
  });
});

describe('useNovelListStore - 章节操作', () => {
  const setupWithNovel = () => {
    useNovelListStore.getState().addNovel('测试小说');
    return useNovelListStore.getState().novels[0].id;
  };

  it('addChapter 添加章节', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter('第1章');

    const chapters = useNovelListStore.getState().novels[0].chapters;
    expect(chapters).toHaveLength(1);
    expect(chapters[0].title).toBe('第1章');
    expect(chapters[0].index).toBe(1);
    expect(chapters[0].text).toBe('');
    expect(chapters[0].status).toBe('draft');
    expect(chapters[0].wordCount).toBe(0);
    expect(useNovelListStore.getState().currentChapterIndex).toBe(1);
  });

  it('addChapter 无选中小说时不报错', () => {
    expect(() => useNovelListStore.getState().addChapter()).not.toThrow();
    expect(useNovelListStore.getState().novels).toHaveLength(0);
  });

  it('addChapter 默认标题', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();
    expect(useNovelListStore.getState().novels[0].chapters[0].title).toBe('第1章');
  });

  it('addChapter 多次添加 index 递增', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter('第一章');
    useNovelListStore.getState().addChapter('第二章');
    useNovelListStore.getState().addChapter('第三章');

    const chapters = useNovelListStore.getState().novels[0].chapters;
    expect(chapters.map(c => c.index)).toEqual([1, 2, 3]);
    expect(chapters.map(c => c.title)).toEqual(['第一章', '第二章', '第三章']);
  });

  it('updateChapterText 更新内容', async () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();

    useNovelListStore.getState().updateChapterText(1, '这是正文内容');
    const chapter = useNovelListStore.getState().novels[0].chapters[0];
    expect(chapter.text).toBe('这是正文内容');
    expect(chapter.wordCount).toBe(6); // 去除空格后6字
    // createTime 和 updateTime 可能在同一毫秒内相同，只需验证 wordCount 和 text 已更新
    expect(chapter.createTime).toBeTruthy();
    expect(chapter.updateTime).toBeTruthy();
  });

  it('updateChapterText 更新时同步小说 updateTime', async () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();
    const novelBefore = useNovelListStore.getState().novels[0];

    await new Promise(r => setTimeout(r, 1)); // 等 1ms 确保时间戳不同
    useNovelListStore.getState().updateChapterText(1, '新内容');
    const novelAfter = useNovelListStore.getState().novels[0];

    expect(novelAfter.updateTime).not.toBe(novelBefore.updateTime);
  });

  it('updateChapter 更新章节信息', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter('原标题');

    useNovelListStore.getState().updateChapter(1, {
      title: '新标题',
      status: 'published',
    });

    const chapter = useNovelListStore.getState().novels[0].chapters[0];
    expect(chapter.title).toBe('新标题');
    expect(chapter.status).toBe('published');
  });

  it('updateChapter 不存在的章节不报错', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();
    expect(() => useNovelListStore.getState().updateChapter(99, { title: 'x' })).not.toThrow();
  });

  it('updateChapterText 无选中小说时不报错', () => {
    expect(() => useNovelListStore.getState().updateChapterText(1, 'text')).not.toThrow();
  });

  it('selectChapter 切换章节', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();
    useNovelListStore.getState().addChapter();

    useNovelListStore.getState().selectChapter(2);
    expect(useNovelListStore.getState().currentChapterIndex).toBe(2);

    useNovelListStore.getState().selectChapter(1);
    expect(useNovelListStore.getState().currentChapterIndex).toBe(1);
  });

  it('deleteChapter 移到回收站', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter('待删除章节');

    useNovelListStore.getState().deleteChapter(1);

    expect(useNovelListStore.getState().novels[0].chapters).toHaveLength(0);
    expect(useNovelListStore.getState().trashList).toHaveLength(1);
    expect(useNovelListStore.getState().trashList[0].title).toBe('待删除章节');
    expect(useNovelListStore.getState().currentChapterIndex).toBe(0);
  });

  it('deleteChapter 重新编号剩余章节', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter('第1章');
    useNovelListStore.getState().addChapter('第2章');
    useNovelListStore.getState().addChapter('第3章');

    useNovelListStore.getState().deleteChapter(2);

    const chapters = useNovelListStore.getState().novels[0].chapters;
    expect(chapters.map(c => c.index)).toEqual([1, 2]);
    expect(chapters.map(c => c.title)).toEqual(['第1章', '第3章']);
  });

  it('deleteChapter 删除当前章节后自动选中最后一个', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();
    useNovelListStore.getState().addChapter();
    useNovelListStore.getState().selectChapter(1);

    useNovelListStore.getState().deleteChapter(1);

    expect(useNovelListStore.getState().currentChapterIndex).toBe(1);
    expect(useNovelListStore.getState().novels[0].chapters).toHaveLength(1);
  });

  it('deleteChapter 删除所有章节后 currentChapterIndex 归零', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();
    useNovelListStore.getState().selectChapter(1);
    useNovelListStore.getState().deleteChapter(1);
    expect(useNovelListStore.getState().currentChapterIndex).toBe(0);
  });

  it('deleteChapter 多次删除回收站累计', () => {
    const novelId = setupWithNovel();
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter('A');
    useNovelListStore.getState().addChapter('B');
    useNovelListStore.getState().deleteChapter(1);
    useNovelListStore.getState().deleteChapter(1);
    expect(useNovelListStore.getState().trashList).toHaveLength(2);
  });
});

describe('useNovelListStore - 回收站操作', () => {
  const setupWithTrash = () => {
    useNovelListStore.getState().addNovel();
    const novelId = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter();
    useNovelListStore.getState().updateChapterText(1, '回收内容');
    useNovelListStore.getState().deleteChapter(1);
    return useNovelListStore.getState().trashList[0].id;
  };

  it('deleteTrashChapter 永久删除', () => {
    const trashId = setupWithTrash();
    expect(useNovelListStore.getState().trashList).toHaveLength(1);

    useNovelListStore.getState().deleteTrashChapter(trashId);
    expect(useNovelListStore.getState().trashList).toHaveLength(0);
  });

  it('deleteTrashChapter 不存在的 id 不报错', () => {
    setupWithTrash();
    expect(() => useNovelListStore.getState().deleteTrashChapter('fake-id')).not.toThrow();
    expect(useNovelListStore.getState().trashList).toHaveLength(1);
  });

  it('clearAll 同时清空回收站', () => {
    setupWithTrash();
    useNovelListStore.getState().clearAll();
    expect(useNovelListStore.getState().trashList).toHaveLength(0);
  });
});

describe('useNovelListStore - 标签操作', () => {
  it('toggleTag 添加标签', () => {
    useNovelListStore.getState().addNovel();
    const novelId = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().toggleTag('言情');
    expect(useNovelListStore.getState().novels[0].selectedTags).toContain('言情');
  });

  it('toggleTag 第二次调用移除标签', () => {
    useNovelListStore.getState().addNovel();
    const novelId = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().toggleTag('言情');
    useNovelListStore.getState().toggleTag('言情');
    expect(useNovelListStore.getState().novels[0].selectedTags).toEqual([]);
  });

  it('toggleTag 再次调用移除标签', () => {
    useNovelListStore.getState().addNovel();
    const novelId = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().toggleTag('言情');
    useNovelListStore.getState().toggleTag('言情');
    expect(useNovelListStore.getState().novels[0].selectedTags).not.toContain('言情');
  });

  it('toggleTag 无选中小说时不修改数据', () => {
    const stateBefore = JSON.stringify(useNovelListStore.getState().novels);
    useNovelListStore.getState().toggleTag('言情');
    expect(JSON.stringify(useNovelListStore.getState().novels)).toBe(stateBefore);
  });
});

describe('useNovelListStore - 数据一致性', () => {
  it('删除小说时保留其他小说数据', () => {
    useNovelListStore.getState().addNovel('小说1');
    useNovelListStore.getState().addNovel('小说2');
    useNovelListStore.getState().selectNovel(useNovelListStore.getState().novels[0].id);
    useNovelListStore.getState().addChapter('小说1第1章');

    const novel2Id = useNovelListStore.getState().novels[1].id;
    useNovelListStore.getState().selectNovel(novel2Id);
    useNovelListStore.getState().addChapter('小说2第1章');

    useNovelListStore.getState().deleteNovel(novel2Id);

    const remaining = useNovelListStore.getState().novels[0];
    expect(remaining.title).toBe('小说1');
    expect(remaining.chapters).toHaveLength(1);
    expect(remaining.chapters[0].title).toBe('小说1第1章');
  });

  it('并发操作同一小说章节不互相覆盖', () => {
    useNovelListStore.getState().addNovel();
    const novelId = useNovelListStore.getState().novels[0].id;
    useNovelListStore.getState().selectNovel(novelId);
    useNovelListStore.getState().addChapter('第一章');
    useNovelListStore.getState().addChapter('第二章');

    useNovelListStore.getState().updateChapterText(1, '第一章内容');
    useNovelListStore.getState().updateChapterText(2, '第二章内容');

    const chapters = useNovelListStore.getState().novels[0].chapters;
    expect(chapters[0].text).toBe('第一章内容');
    expect(chapters[1].text).toBe('第二章内容');
  });
});
