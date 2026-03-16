import { create } from "zustand";
import { persist,createJSONStorage } from "zustand/middleware";

export interface Chapter {
  index: number;
  title: string;
  text: string;
  updateTime: string;
  createTime: string;
  status: string;
  wordCount: number;
}

type NovelListStore={
  novelList: Chapter[];
  currentChapterIndex: number;
  
  // 章节操作
  addChapter: (title?: string) => void;
  updateChapterText: (index: number, text: string) => void;
  updateChapter: (index: number, data: Partial<Chapter>) => void;
  selectChapter: (index: number) => void;
  deleteChapter: (index: number) => void;
  resetNovelList: () => void;
}

const useNovelListStore = create<NovelListStore>()(
  persist(
    (set, get) => ({
      novelList: [],
      currentChapterIndex: 0,

      addChapter: (title?: string) => {
        const { novelList } = get();
        const newIndex = novelList.length > 0 ? Math.max(...novelList.map(c => c.index)) + 1 : 1;
        const now = new Date().toISOString();
        const newChapter: Chapter = {
          index: newIndex,
          title: title || `第${newIndex}章`,
          text: '',
          updateTime: now,
          createTime: now,
          status: 'draft',
          wordCount: 0,
        };
        set({ 
          novelList: [...novelList, newChapter],
          currentChapterIndex: newIndex
        });
      },

      updateChapterText: (index: number, text: string) => {
        const { novelList } = get();
        const updatedList = novelList.map(chapter => 
          chapter.index === index 
            ? { 
                ...chapter, 
                text, 
                updateTime: new Date().toISOString(),
                wordCount: text.replace(/\s/g, '').length 
              } 
            : chapter
        );
        set({ novelList: updatedList });
      },

      updateChapter: (index: number, data: Partial<Chapter>) => {
        const { novelList } = get();
        const updatedList = novelList.map(chapter => 
          chapter.index === index 
            ? { 
                ...chapter, 
                ...data,
                updateTime: new Date().toISOString()
              } 
            : chapter
        );
        set({ novelList: updatedList });
      },

      selectChapter: (index: number) => {
        set({ currentChapterIndex: index });
      },

      deleteChapter: (index: number) => {
        const { novelList, currentChapterIndex } = get();
        const filteredList = novelList.filter(chapter => chapter.index !== index);
        // 如果删除的是当前选中的章节，选择最后一个
        let newCurrentIndex = currentChapterIndex;
        if (currentChapterIndex === index) {
          newCurrentIndex = filteredList.length > 0 
            ? filteredList[filteredList.length - 1].index 
            : 0;
        }
        set({ 
          novelList: filteredList,
          currentChapterIndex: newCurrentIndex
        });
      },

      resetNovelList: () => {
        set({
          novelList: [],
          currentChapterIndex: 0,
        });
      },
    }),
    {
      name: 'novelList',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useNovelListStore;
