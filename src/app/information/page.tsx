'use client';

import { useEffect, useMemo, useState } from 'react';
import { Book } from 'lucide-react';
import useNovelListStore from '@/store/useNovelListStore';
import { getImageUrl } from '@/store/useImageDB';

function formatWordCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)} 万字`;
  return `${n.toLocaleString()} 字`;
}

export default function InformationPage() {
  const { novels, currentNovelId } = useNovelListStore();
  const currentNovel = novels.find(n => n.id === currentNovelId);

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

  const totalWordCount = currentNovel?.chapters.reduce((sum, ch) => sum + ch.wordCount, 0) ?? 0;
  const chapterCount = currentNovel?.chapters.length ?? 0;

  const chaptersSorted = useMemo(() => {
    if (!currentNovel) return [];
    return [...currentNovel.chapters].sort((a, b) => a.index - b.index);
  }, [currentNovel]);

  const latestChapter = useMemo(() => {
    if (!currentNovel?.chapters.length) return null;
    return [...currentNovel.chapters].sort(
      (a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    )[0];
  }, [currentNovel]);

  const authorInitial =
    currentNovel?.author?.trim()?.charAt(0) || '作';

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 pb-28 pt-6">
        {!currentNovel ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 p-16 text-center">
            <Book className="size-14 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无选中作品，请在编辑器选择一部小说</p>
          </div>
        ) : (
          <>
            {/* 顶部：封面 + 元信息 + 作者（无开始阅读 / 下载 / 二维码） */}
            <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 pb-8">
              {/* 封面 */}
              <div className="shrink-0 mx-auto sm:mx-0">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="w-[140px] sm:w-[160px] aspect-3/4 object-cover rounded-md shadow-md ring-1 ring-black/5"
                  />
                ) : (
                  <div className="w-[140px] sm:w-[160px] aspect-3/4 rounded-md bg-gray-200 flex items-center justify-center shadow-inner ring-1 ring-black/5">
                    <Book className="size-14 text-gray-400" />
                  </div>
                )}
              </div>

              {/* 中间：书名、标签、字数、最近更新 */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {currentNovel.title || '无标题'}
                </h1>

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="rounded border border-amber-400/80 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                    {currentNovel.status || '连载中'}
                  </span>
                  {currentNovel.category ? (
                    <span className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600">
                      {currentNovel.category}
                    </span>
                  ) : null}
                  {(currentNovel.selectedTags ?? []).map(tag => (
                    <span
                      key={tag}
                      className="rounded border border-gray-300 bg-white px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <p className="mt-4 text-sm text-gray-700">{formatWordCount(totalWordCount)}</p>

                {latestChapter ? (
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">
                    最近更新: 第{latestChapter.index}章 {latestChapter.title}{' '}
                    {new Date(latestChapter.updateTime).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                ) : (
                  <p className="mt-2 text-xs sm:text-sm text-gray-500">暂无章节</p>
                )}
              </div>

              {/* 右侧：作者 */}
              <aside className="shrink-0 flex flex-row sm:flex-col items-center sm:items-end gap-3 justify-center sm:justify-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-base font-semibold text-gray-600 ring-2 ring-white shadow-sm">
                  {authorInitial}
                </div>
                <div className="text-center sm:text-right min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                    <span className="font-medium text-gray-900">
                      {currentNovel.author || '未知作者'}
                    </span>
                    <span className="rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600">
                      作者
                    </span>
                  </div>
                  <p className="mt-1 max-w-[220px] text-xs text-gray-500 line-clamp-2 sm:ml-auto">
                    本地创作 · 钢笔小说
                  </p>
                </div>
              </aside>
            </header>

            {/* 下方白卡片：简介 + 目录三列 */}
            <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <h2 className="text-lg font-bold text-gray-900">作品简介</h2>
                <div className="mt-3 border-t border-gray-200" />
                <p className="mt-4 text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                  {currentNovel.description?.trim() || '暂无简介'}
                </p>
              </div>

              <div className="border-t border-gray-100 px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="text-lg font-bold text-gray-900">
                  目录 · {chapterCount}章
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  第一卷：{currentNovel.category || '正文'} · 共{chapterCount}章
                </p>

                {chapterCount === 0 ? (
                  <p className="mt-8 text-center text-sm text-gray-400">暂无章节</p>
                ) : (
                  <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    {chaptersSorted.map(ch => (
                      <li
                        key={ch.id}
                        className="flex min-w-0 items-baseline gap-1 text-sm text-gray-800"
                      >
                        <span className="shrink-0 text-gray-500">第{ch.index}章</span>
                        <span className="min-w-0 truncate">{ch.title}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 右下角固定按钮（逻辑可自行接） */}
      {currentNovel ? (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            type="button"
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/15 transition-colors hover:bg-gray-800"
          >
            是否结束作品？
          </button>
        </div>
      ) : null}
    </div>
  );
}
