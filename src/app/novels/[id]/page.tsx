export default function NovelDetailPage() {
  return (
    <div className="space-y-8">
      {/* 返回按钮和操作按钮 */}
      <div className="flex items-center justify-between">
        <a href="/novels" className="text-blue-600 hover:text-blue-800 transition-colors">
          ← 返回小说列表
        </a>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md">
            编辑
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md">
            删除
          </button>
        </div>
      </div>

      {/* 小说封面和基本信息 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* 封面区域 */}
          <div className="w-48 h-64 bg-white/20 rounded-xl flex items-center justify-center">
            <div className="text-4xl">📖</div>
          </div>
          
          {/* 基本信息 */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl font-bold">星辰之海</h1>
              <span className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                连载中
              </span>
              <span className="px-4 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                科幻
              </span>
            </div>
            
            <p className="text-xl text-blue-100 mb-6">
              一部关于星际探险的科幻小说，讲述人类探索未知宇宙的故事。
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-blue-200">作者</div>
                <div className="text-lg font-semibold">张三</div>
              </div>
              <div>
                <div className="text-sm text-blue-200">字数</div>
                <div className="text-lg font-semibold">12.5万字</div>
              </div>
              <div>
                <div className="text-sm text-blue-200">创建时间</div>
                <div className="text-lg font-semibold">2026-03-01</div>
              </div>
              <div>
                <div className="text-sm text-blue-200">最后更新</div>
                <div className="text-lg font-semibold">2026-03-10</div>
              </div>
              <div>
                <div className="text-sm text-blue-200">章节数</div>
                <div className="text-lg font-semibold">24章</div>
              </div>
              <div>
                <div className="text-sm text-blue-200">阅读量</div>
                <div className="text-lg font-semibold">1,234次</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧：章节列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">章节列表</h2>
            
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((chapter) => (
                <div
                  key={chapter}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">第{chapter}章</div>
                      <div className="text-sm text-gray-500">章节标题示例</div>
                    </div>
                    <div className="text-sm text-gray-500">3,456字</div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
              添加新章节
            </button>
          </div>
        </div>

        {/* 右侧：小说内容预览 */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">内容预览</h2>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                阅读全文
              </button>
            </div>
            
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-bold text-gray-900 mb-4">第一章：星空启程</h3>
              
              <p className="text-gray-700 mb-4">
                在遥远的未来，人类已经掌握了星际旅行的技术。星舰"探索者号"正准备启程，前往未知的星系进行科学考察。
              </p>
              
              <p className="text-gray-700 mb-4">
                舰长李明站在指挥台上，望着窗外浩瀚的星空。这是他第三次执行深空任务，但每次看到这无垠的宇宙，心中依然充满敬畏。
              </p>
              
              <p className="text-gray-700 mb-4">
                "所有系统检查完毕，舰长。"副官的声音从通讯器中传来。
              </p>
              
              <p className="text-gray-700 mb-4">
                "很好，准备启动跃迁引擎。"李明深吸一口气，"目标：NGC-2317星系。"
              </p>
              
              <p className="text-gray-700">
                星舰开始震动，引擎发出低沉的轰鸣声。窗外的星星开始拉长，变成一道道流光。下一秒，探索者号消失在原地，开始了它的星际之旅。
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  本章字数：1,234字 | 阅读时间：约5分钟
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    上一章
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    下一章
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 评论区域 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg border border-blue-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">读者评论</h2>
            
            <div className="space-y-6">
              {/* 评论1 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    读
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">读者A</div>
                    <div className="text-sm text-gray-500">2026-03-09 14:30</div>
                  </div>
                </div>
                <p className="text-gray-700">
                  这一章写得真精彩！星际旅行的描写让人身临其境，期待下一章！
                </p>
              </div>
              
              {/* 评论2 */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    书
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">书迷B</div>
                    <div className="text-sm text-gray-500">2026-03-08 20:15</div>
                  </div>
                </div>
                <p className="text-gray-700">
                  科幻设定很合理，人物塑造也很立体。希望作者能保持这个水准！
                </p>
              </div>
              
              {/* 添加评论 */}
              <div>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={4}
                  placeholder="写下你的评论..."
                />
                <div className="flex justify-end mt-3">
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
                    发表评论
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}