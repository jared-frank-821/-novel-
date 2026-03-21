import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Chapter {
  id: string;
  index: number;
  title: string;
  text: string;
  updateTime: string;
  createTime: string;
  status: string;
  wordCount: number;
}

export interface TrashChapter {
  id: string;
  title: string;
  text: string;
  updateTime: string;
  createTime: string;
  status: string;
  wordCount: number;
}

export interface Novel {
  id: string;
  title: string;
  author?: string;
  description?: string;
  category?: string;
  status?: string;
  coverId?: string;//存 IndexedDB 的图片 ID
  createTime: string;
  updateTime: string;
  chapters: Chapter[];
  selectedTags: string[];
}

type NovelListStore = {
  novels: Novel[];
  currentNovelId: string | null;
  currentChapterIndex: number;
  trashList: TrashChapter[];

  // 小说操作
  addNovel: (title?: string) => void;
  updateNovel: (id: string, data: Partial<Novel>) => void;
  updateNovelCover:(id:string,coverId:string) => void;
  deleteNovel: (id: string) => void;
  selectNovel: (id: string) => void;
  toggleTag:(tag:string) =>void;

  // 章节操作
  addChapter: (title?: string) => void;
  updateChapterText: (index: number, text: string) => void;
  updateChapter: (index: number, data: Partial<Chapter>) => void;
  selectChapter: (index: number) => void;
  deleteChapter: (index: number) => void;
  resetNovelList: () => void;

  // 回收站操作
  deleteTrashChapter: (id: string) => void;
  // 清空所有数据
  clearAll: () => void;
}

// 工具函数：生成唯一ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const useNovelListStore = create<NovelListStore>()(
  persist(
    (set, get) => ({
      novels: [],
      currentNovelId: null,
      currentChapterIndex: 0,
      trashList: [],

      // 添加新小说
      addNovel: (title?: string) => {
        const { novels } = get();
        const now = new Date().toISOString();
        const newNovel: Novel = {
          id: generateId(),
          title: title || `新小说 ${novels.length + 1}`,
          author: '作者',
          description: '',
          category: '未分类',
          status: '连载中',
          createTime: now,
          updateTime: now,
          chapters: [],
          selectedTags: [],
        };
        set({
          novels: [...novels, newNovel],
          currentNovelId: newNovel.id,
          currentChapterIndex: 0,
        });
      },

      // 更新小说信息
      updateNovel: (id: string, data: Partial<Novel>) => {
        const { novels } = get();
        const updatedList = novels.map(novel =>
          novel.id === id//如果id相同，则更新小说信息
            ? { ...novel, ...data, updateTime: new Date().toISOString() }//...novel是展开小说信息，...data是展开更新数据，会覆盖掉传进来的数据，updateTime是更新时间
            : novel//否则保持原样
        );
        set({ novels: updatedList });//更新小说列表
      },
      //更新小说封面
      updateNovelCover: async (id: string, coverId: string) => {
        const { novels } = get();
        const updatedList = novels.map(novel =>
          novel.id === id
            ? { ...novel, coverId, updateTime: new Date().toISOString() }
            : novel
        );
        set({ novels: updatedList });
      },

      // 删除小说
      deleteNovel: (id: string) => {
        const { novels, currentNovelId } = get();
        const filteredList = novels.filter(novel => novel.id !== id);

        // 如果删除的是当前选中的小说，选择另一个
        let newCurrentId = currentNovelId;
        if (currentNovelId === id) {
          newCurrentId = filteredList.length > 0 ? filteredList[0].id : null;
        }

        set({
          novels: filteredList,
          currentNovelId: newCurrentId,
          currentChapterIndex: 0,
        });
      },

      // 切换当前小说
      selectNovel: (id: string) => {
        set({
          currentNovelId: id,
          currentChapterIndex: 0,
        });
      },
      //切换标签
      toggleTag: (tag: string) => {
        const { novels, currentNovelId } = get();
        if (!currentNovelId) return;
        const updatedNovels = novels.map(novel => {
          if (novel.id !== currentNovelId) return novel;
          const selectedTags = novel.selectedTags.includes(tag)
            ? novel.selectedTags.filter(t => t !== tag)
            : [...novel.selectedTags, tag];
          return { ...novel, selectedTags };
        });
        console.log('[toggleTag] tag:', tag, '-> novels after:', JSON.stringify(updatedNovels.map(n => ({ id: n.id, selectedTags: n.selectedTags }))));
        set({ novels: updatedNovels });
      },

      // 在当前小说中添加章节
      addChapter: (title?: string) => {
        const { novels, currentNovelId } = get();
        if (!currentNovelId) return;

        const novelIndex = novels.findIndex(n => n.id === currentNovelId);
        if (novelIndex === -1) return;

        const novel = novels[novelIndex];
        const newIndex = novel.chapters.length > 0
          ? Math.max(...novel.chapters.map(c => c.index)) + 1
          : 1;
        const now = new Date().toISOString();

        const newChapter: Chapter = {
          id: generateId(),
          index: newIndex,
          title: title || `第${newIndex}章`,
          text: '',
          updateTime: now,
          createTime: now,
          status: 'draft',
          wordCount: 0,
        };

        const updatedNovels = [...novels];
        updatedNovels[novelIndex] = {
          ...novel,
          chapters: [...novel.chapters, newChapter],
          updateTime: now,
        };

        set({
          novels: updatedNovels,
          currentChapterIndex: newIndex,
        });
      },

      // 更新章节内容
      updateChapterText: (index: number, text: string) => {
        const { novels, currentNovelId } = get();
        if (!currentNovelId) return;

        const novelIndex = novels.findIndex(n => n.id === currentNovelId);
        if (novelIndex === -1) return;

        const updatedChapters = novels[novelIndex].chapters.map(chapter =>
          chapter.index === index
            ? {
                ...chapter,
                text,
                updateTime: new Date().toISOString(),
                wordCount: text.replace(/\s/g, '').length,
              }
            : chapter
        );

        const updatedNovels = [...novels];
        updatedNovels[novelIndex] = {
          ...novels[novelIndex],
          chapters: updatedChapters,
          updateTime: new Date().toISOString(),
        };

        set({ novels: updatedNovels });
      },

      // 更新章节信息
      updateChapter: (index: number, data: Partial<Chapter>) => {
        const { novels, currentNovelId } = get();
        if (!currentNovelId) return;

        const novelIndex = novels.findIndex(n => n.id === currentNovelId);
        if (novelIndex === -1) return;

        const updatedChapters = novels[novelIndex].chapters.map(chapter =>
          chapter.index === index
            ? { ...chapter, ...data, updateTime: new Date().toISOString() }
            : chapter
        );

        const updatedNovels = [...novels];
        updatedNovels[novelIndex] = {
          ...novels[novelIndex],
          chapters: updatedChapters,
          updateTime: new Date().toISOString(),
        };

        set({ novels: updatedNovels });
      },

      // 选择章节
      selectChapter: (index: number) => {
        set({ currentChapterIndex: index });
      },

      // 删除章节（移到回收站）
      deleteChapter: (index: number) => {
        const { novels, currentNovelId, currentChapterIndex, trashList } = get();
        if (!currentNovelId) return;

        const novelIndex = novels.findIndex(n => n.id === currentNovelId);
        if (novelIndex === -1) return;

        const novel = novels[novelIndex];
        const chapterToDelete = novel.chapters.find(c => c.index === index);
        if (!chapterToDelete) return;

        // 从章节列表中移除
        const filteredChapters = novel.chapters.filter(c => c.index !== index);

        // 更新章节索引
        const reindexedChapters = filteredChapters.map((ch, i) => ({
          ...ch,
          index: i + 1,
        }));

        // 处理当前选中的章节
        let newCurrentIndex = currentChapterIndex;
        if (currentChapterIndex === index) {
          newCurrentIndex = reindexedChapters.length > 0
            ? reindexedChapters[reindexedChapters.length - 1].index
            : 0;
        }

        // 创建回收站章节
        const newTrashChapter: TrashChapter = {
          id: generateId(),
          title: chapterToDelete.title,
          text: chapterToDelete.text,
          updateTime: new Date().toISOString(),
          createTime: chapterToDelete.createTime,
          status: chapterToDelete.status,
          wordCount: chapterToDelete.wordCount,
        };

        const updatedNovels = [...novels];
        updatedNovels[novelIndex] = {
          ...novel,
          chapters: reindexedChapters,
          updateTime: new Date().toISOString(),
        };

        set({
          novels: updatedNovels,
          currentChapterIndex: newCurrentIndex,
          trashList: [...trashList, newTrashChapter],
        });
      },

      // 重置（清空所有小说数据）
      resetNovelList: () => {
        set({
          novels: [],
          currentNovelId: null,
          currentChapterIndex: 0,
        });
      },

      // 删除回收站章节
      deleteTrashChapter: (id: string) => {
        const { trashList } = get();
        const filteredTrashList = trashList.filter(c => c.id !== id);
        set({ trashList: filteredTrashList });
      },

      // 清空所有数据（包括回收站）
      clearAll: () => {
        set({
          novels: [],
          currentNovelId: null,
          currentChapterIndex: 0,
          trashList: [],
        });
      },
    }),
    {
      name: 'novelList',
      storage: createJSONStorage(() => localStorage),
      // 只持久化这 4 个字段，避免写入旧版遗留的 novelList 等
      partialize: (state) => ({
        novels: state.novels,
        currentNovelId: state.currentNovelId,
        currentChapterIndex: state.currentChapterIndex,
        trashList: state.trashList,
      }),
      // 恢复时只认新结构，忽略旧版的 novelList，避免 state 里出现脏数据
      merge: (persistedState, currentState) => {
        const p = persistedState as Record<string, unknown> | null;
        if (!p || typeof p !== 'object') return currentState;
        const currentNovelId = p.currentNovelId === null || typeof p.currentNovelId === 'string'
          ? p.currentNovelId
          : currentState.currentNovelId;
        const novels = Array.isArray(p.novels)
          ? p.novels.map(novel => ({
              ...novel,
              selectedTags: Array.isArray((novel as Record<string, unknown>).selectedTags)
                ? (novel as Record<string, unknown>).selectedTags as string[]
                : [],
            }))
          : currentState.novels;
        console.log('[merge] restored novels:', JSON.stringify(novels.map(n => ({ id: n.id, selectedTags: n.selectedTags }))));
        return {
          ...currentState,
          novels,
          currentNovelId,
          currentChapterIndex: typeof p.currentChapterIndex === 'number' ? p.currentChapterIndex : currentState.currentChapterIndex,
          trashList: Array.isArray(p.trashList) ? p.trashList : currentState.trashList,
        };
      },
    }
  )
);

export default useNovelListStore;
