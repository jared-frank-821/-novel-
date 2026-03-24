'use client';

import { useEffect, useMemo, useState } from 'react';
import { Book } from 'lucide-react';
import useNovelListStore from '@/store/useNovelListStore';
import { getImageUrl, saveImage } from '@/store/useImageDB';
import { useRef } from 'react';
import Link from 'next/link';
import CategoriesContent from '@/components/categories/CategoriesContent';

function formatWordCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)} 万字`;
  return `${n.toLocaleString()} 字`;
}
interface informationContentProps{
  /** 是否紧凑模式（嵌入中间面板时使用） */
  compact?: boolean;//核心设计：compact 模式。因为分类界面原来是为全屏页面设计的（有 min-h-screen bg-gray-100/80 p-6），嵌入中间面板后布局不同。compact=true 时只输出精简结构：
}
export default function InformationPage({ compact =false}:informationContentProps) {
  const { novels, currentNovelId, updateNovel, selectChapter } = useNovelListStore();
  const currentNovel = novels.find(n => n.id === currentNovelId);

  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const currentNovelWordCount=currentNovel?.chapters.reduce((sum, ch) => sum + ch.wordCount, 0) ?? 0;
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

  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState('');

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const authorInitial =
    currentNovel?.author?.trim()?.charAt(0) || '作';

  const startEditDesc = () => {
    setDescDraft(currentNovel?.description || '');
    setEditingDesc(true);
  };

  const saveDesc = () => {
    if (currentNovelId) updateNovel(currentNovelId, { description: descDraft });
    setEditingDesc(false);
  };

  const cancelDesc = () => {
    setEditingDesc(false);
  };

  const startEditTitle = () => {
    setTitleDraft(currentNovel?.title || '');
    setEditingTitle(true);
  };

  const saveTitle = () => {
    if(currentNovelId){
      updateNovel(currentNovelId,{title:titleDraft});
      setEditingTitle(false);
    }
  };

  const cancelTitle = () => {
    setEditingTitle(false);
  };

  const handleChangeCover = () => {
    // TODO: 逻辑自行编写
    fileInputRef.current?.click(); // 模拟点击打开文件选择器
  };

  const jumpToRead = (chapterIndex: number) => {
    selectChapter(chapterIndex);
  };
  const finishNovel = () =>{
    if(currentNovelId){
      updateNovel(currentNovelId,{status:'已完结'});
    }
  }
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !currentNovelId) return;
                  try {
                    const newCoverId = await saveImage(file);        // 存入 IndexedDB，拿回 id
                    updateNovel(currentNovelId, { coverId: newCoverId }); // 更新小说记录
                  } catch (err) {
                    console.error('封面保存失败', err);
                  }
                  e.target.value = '';
                }}
             
             />
              <div className="shrink-0 mx-auto sm:mx-0 flex flex-col items-center gap-2">
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
                <button
                  type="button"
                  onClick={handleChangeCover}
                  className="rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors w-full"
                >
                  更改封面
                </button>
              </div>

              {/* 中间：书名、标签、字数、最近更新 */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                {editingTitle ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={e => setTitleDraft(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                      autoFocus
                    />
                    <div className="flex justify-center sm:justify-start gap-2">
                      <button
                        type="button"
                        onClick={cancelTitle}
                        className="rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={saveTitle}
                        className="rounded bg-amber-500 px-3 py-1 text-xs text-white hover:bg-amber-600 transition-colors"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                      {currentNovel.title || '无标题'}
                    </h1>
                    <button
                      type="button"
                      onClick={startEditTitle}
                      className="shrink-0 rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      改名
                    </button>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="rounded border border-amber-400/80 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                    {currentNovel.status || '连载中'}
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-700">总字数：{formatWordCount(currentNovelWordCount)}</p>

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
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-gray-900">作品简介</h2>
                {!editingDesc && (
                  <button
                    type="button"
                    onClick={startEditDesc}
                    className="shrink-0 rounded border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    改写简介
                  </button>
                )}
              </div>
              <div className="mt-3 border-t border-gray-200" />
              {editingDesc ? (
                <div className="mt-4 space-y-2">
                  <textarea
                    value={descDraft}
                    onChange={e => setDescDraft(e.target.value)}
                    rows={5}
                    className="w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder="请输入小说简介..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelDesc}
                      className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={saveDesc}
                      className="rounded bg-amber-500 px-3 py-1.5 text-xs text-white hover:bg-amber-600 transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-gray-700 whitespace-pre-wrap">
                  {currentNovel.description?.trim() || '暂无简介'}
                </p>
              )}
              </div>

              <div className="border-t border-gray-100 px-6 py-6 sm:px-8 sm:py-8">
                <h2 className="text-lg font-bold text-gray-900">
                  目录 · {chapterCount}章
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  共{chapterCount}章
                </p>

                {chapterCount === 0 ? (
                  <p className="mt-8 text-center text-sm text-gray-400">暂无章节</p>
                ) : (
                  <ul  className="mt-6 grid grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3" >
                    {chaptersSorted.map(ch => (
                      <li
                        key={ch.id}
                        className="flex min-w-0 items-baseline gap-1 text-sm text-gray-800 cursor-pointer hover:text-amber-600 transition-colors"
                        onClick={() => jumpToRead(ch.index)}
                      >
                        <Link
                          href="/read"
                          className="min-w-0 flex gap-1"
                          onClick={() => jumpToRead(ch.index)}
                        >
                          <span className="shrink-0 text-gray-500">第{ch.index}章</span>
                          <span className="min-w-0 truncate">{ch.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* 标签选择 */}
            <div className="mt-6 rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden px-6 py-6 sm:px-8 sm:py-6">
              <CategoriesContent />
            </div>
          </>
        )}
      </div>

      {/* 右下角固定按钮（逻辑可自行接） */}
      {currentNovel ? (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            type="button"
            onClick={finishNovel}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-black/15 transition-colors hover:bg-gray-800"
          >
            是否结束作品？
          </button>
        </div>
      ) : null}
    </div>
  );
}
