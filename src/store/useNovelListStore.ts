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

export interface TrashChapter {
  id: string;
  title: string;
  text: string;
  updateTime: string;
  createTime: string;
  status: string;
  wordCount: number;
}
type NovelListStore={
  novelList: Chapter[];
  trashList: TrashChapter[];
  currentChapterIndex: number;
  
  // 章节操作
  addChapter: (title?: string) => void;
  updateChapterText: (index: number, text: string) => void;
  updateChapter: (index: number, data: Partial<Chapter>) => void;
  selectChapter: (index: number) => void;
  deleteChapter: (index: number) => void;
  resetNovelList: () => void;
  // addTrashChapter: (chapter: TrashChapter) => void;
  deleteTrashChapter: (id: string) => void;
}

const useNovelListStore = create<NovelListStore>()(
  persist(
    (set, get) => ({
      novelList: [],
      currentChapterIndex: 0,
      trashList: [],

      addChapter: (title?: string) => {
        const { novelList } = get();//从本地存储中获取当前的小说列表
        const newIndex = novelList.length > 0 ? Math.max(...novelList.map(c => c.index)) + 1 : 1;//计算新的章节索引
        const now = new Date().toISOString();//获取当前时间
        const newChapter: Chapter = {//创建新的章节对象
          index: newIndex,
          title: title || `第${newIndex}章`,//设置章节标题
          text: '',//设置章节内容
          updateTime: now,
          createTime: now,//设置章节创建时间
          status: 'draft',
          wordCount: 0,//设置章节字数
        };
        set({ //更新小说列表
          novelList: [...novelList, newChapter],
          currentChapterIndex: newIndex//设置当前选中的章节索引
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
        const { novelList, currentChapterIndex, trashList } = get();
        
        // 找到要删除的章节
        const chapterToDelete = novelList.find(chapter => chapter.index === index);
        
        if (!chapterToDelete) return;

        // 从 novelList 中移除该章节
        const filteredList = novelList.filter(chapter => chapter.index !== index);
        
        // 如果删除的是当前选中的章节，选择最后一个
        let newCurrentIndex = currentChapterIndex;
        if (currentChapterIndex === index) {
          newCurrentIndex = filteredList.length > 0 
            ? filteredList[filteredList.length - 1].index 
            : 0;
        }
       
        // 创建回收站章节（使用唯一ID，避免与novelList的index冲突）
        const newTrashChapter: TrashChapter = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: chapterToDelete.title,
          text: chapterToDelete.text,
          updateTime: new Date().toISOString(),
          createTime: chapterToDelete.createTime,
          status: chapterToDelete.status,
          wordCount: chapterToDelete.wordCount,
        };
        
        set({ 
          novelList: filteredList,
          currentChapterIndex: newCurrentIndex,
          trashList: [...trashList, newTrashChapter]
        });
      },

      resetNovelList: () => {
        set({
          novelList: [],
          currentChapterIndex: 0,
        });
      },
      deleteTrashChapter: (id: string) => {
        const { trashList } = get();
        const filterTrashList = trashList.filter(c => c.id !== id);
        set({ trashList: filterTrashList });
      }
    }),
    {
       //这个 Zustand store 使用了 persist 中间件，它的作用是：
        // 初始化时：自动从 localStorage 的 novelList 键中读取数据并恢复状态
        // 状态更新时（调用 set 后）：自动将最新状态保存到 localStorage
      name: 'novelList',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useNovelListStore;
