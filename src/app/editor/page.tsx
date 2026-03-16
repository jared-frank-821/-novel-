"use client";

import { FileStack, BookmarkPlus } from "lucide-react";

export default function EditorPage() {
  return (
    <div className="space-y-10">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">小说写作</h1>
        <p className="text-gray-600 mt-2">选择创作类型，开始你的故事</p>
      </div>

      {/* 新的创作 */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">新的创作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* 长篇小说 */}
          <article className="group relative flex items-start gap-5 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-emerald-200 to-emerald-100" />
            <div className="shrink-0 w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center">
              <FileStack className="size-7 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">长篇小说</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                多章节小说，情节连贯连载更新
              </p>
              <button
                type="button"
                className="mt-4 px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
              >
                开始创作
              </button>
            </div>
          </article>

          {/* 短篇小说 */}
          <article className="group relative flex items-start gap-5 p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-linear-to-b from-sky-200 to-sky-100" />
            <div className="shrink-0 w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center">
              <BookmarkPlus className="size-7 text-sky-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 mb-1">短篇小说</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                两万字以内的短篇故事，情节简单节奏快
              </p>
              <button
                type="button"
                className="mt-4 px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors"
              >
                开始创作
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
