'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Home, BookOpen } from 'lucide-react';
import useNovelListStore from '@/store/useNovelListStore';
import { getImageUrl } from '@/store/useImageDB';

export default function ReadPage() {
  const { novels, currentNovelId, currentChapterIndex, selectNovel, selectChapter } = useNovelListStore();

  const currentNovel = novels.find(n => n.id === currentNovelId);
  const currentChapter = currentNovel?.chapters.find(ch => ch.index === currentChapterIndex);

  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!currentNovel?.coverId) {
      setCoverUrl(null);
      return;
    }
    let cancelled = false;
    getImageUrl(currentNovel.coverId).then(url => {
      if (!cancelled && url) setCoverUrl(url);
    });
    return () => { cancelled = true; };
  }, [currentNovel?.coverId]);

  const chaptersSorted = useMemo(() => {
    if (!currentNovel) return [];
    return [...currentNovel.chapters].sort((a, b) => a.index - b.index);
  }, [currentNovel]);

  const currentChapterListIndex = useMemo(() => {
    return chaptersSorted.findIndex(ch => ch.index === currentChapterIndex);
  }, [chaptersSorted, currentChapterIndex]);

  const prevChapter = currentChapterListIndex > 0 ? chaptersSorted[currentChapterListIndex - 1] : null;
  const nextChapter = currentChapterListIndex < chaptersSorted.length - 1 ? chaptersSorted[currentChapterListIndex + 1] : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const goToPrevChapter = () => {
    if (prevChapter) {
      selectChapter(prevChapter.index);
    }
  };

  const goToNextChapter = () => {
    if (nextChapter) {
      selectChapter(nextChapter.index);
    }
  };

  if (!currentNovel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无选中作品</p>
          <p className="text-gray-400 text-sm mt-2">请在左侧选择一部小说开始阅读</p>
        </div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="size-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">暂无选中章节</p>
          <p className="text-gray-400 text-sm mt-2">请选择一章开始阅读</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-amber-50 to-white">
      {/* 顶部信息栏 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-amber-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt=""
                className="w-10 h-14 object-cover rounded shadow-sm"
              />
            ) : (
              <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                <BookOpen className="size-5 text-gray-400" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-medium text-gray-900 truncate">
                {currentNovel.title}
              </h1>
              <p className="text-xs text-gray-500 truncate">
                第{currentChapter.index}章 {currentChapter.title}
              </p>
            </div>
          </div>

          <a
            href="/novels"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-amber-600 transition-colors"
          >
            <Home className="size-4" />
            <span>返回</span>
          </a>
        </div>
      </header>

      {/* 阅读内容区域 */}
      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* 章节标题 */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            第{currentChapter.index}章 {currentChapter.title}
          </h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span>字数：{currentChapter.wordCount.toLocaleString()}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            <span>更新：{formatDate(currentChapter.updateTime)}</span>
          </div>
        </div>

        {/* 章节内容 */}
        <article className="prose prose-lg prose-amber max-w-none">
          <div className="text-gray-800 leading-loose whitespace-pre-wrap">
            {currentChapter.text || '本章暂无内容...'}
          </div>
        </article>

        {/* 章节底部信息 */}
        <div className="mt-12 pt-8 border-t border-amber-100">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
            <span>本章字数：{currentChapter.wordCount.toLocaleString()} 字</span>
            <span>阅读时长约 {Math.max(1, Math.ceil(currentChapter.wordCount / 500))} 分钟</span>
          </div>

          {/* 上下章导航 */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={goToPrevChapter}
              disabled={!prevChapter}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                prevChapter
                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="size-5" />
              <span className="hidden sm:inline">上一章</span>
            </button>

            {/* 章节目录下拉 */}
            <select
              value={currentChapterIndex}
              onChange={(e) => selectChapter(Number(e.target.value))}
              className="flex-1 max-w-xs px-3 py-2.5 rounded-lg border border-amber-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {chaptersSorted.map((ch) => (
                <option key={ch.id} value={ch.index}>
                  第{ch.index}章 {ch.title}
                </option>
              ))}
            </select>

            <button
              onClick={goToNextChapter}
              disabled={!nextChapter}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${
                nextChapter
                  ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="hidden sm:inline">下一章</span>
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      </main>

      {/* 返回顶部按钮（可选） */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-3 bg-amber-500 text-white rounded-full shadow-lg hover:bg-amber-600 transition-colors"
        >
          <ChevronLeft className="size-5 rotate-90" />
        </button>
      </div>
    </div>
  );
}
