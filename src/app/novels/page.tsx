export default function NovelsPage() {
  return (
    <div className="space-y-8">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的小说</h1>
          <p className="text-gray-600 mt-2">管理你的所有小说作品</p>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
          新建小说
        </button>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索小说..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 分类筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option value="全部">全部</option>
              <option value="科幻">科幻</option>
              <option value="武侠">武侠</option>
              <option value="都市">都市</option>
            </select>
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状态
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors">
              <option value="全部">全部</option>
              <option value="连载中">连载中</option>
              <option value="已完结">已完结</option>
            </select>
          </div>
        </div>
      </div>

      {/* 小说列表 - 示例卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 小说卡片 1 */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                连载中
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">小说标题</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                科幻
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              这里是小说描述，可以在这里简要介绍小说的内容和特点...
            </p>

            {/* 元数据 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <span>作者：作者名</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>字数：12.5万字</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>创建：2026-03-01</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>更新：2026-03-10</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                查看
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                编辑
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all">
                删除
              </button>
            </div>
          </div>
        </div>

        {/* 小说卡片 2 */}
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="h-40 bg-gradient-to-r from-green-500 to-teal-600 relative">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                已完结
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">另一个小说</h3>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                武侠
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              这是另一部小说的描述，展示不同的分类和状态...
            </p>

            {/* 元数据 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <span>作者：另一位作者</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>字数：8.9万字</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>创建：2026-02-15</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>更新：2026-03-08</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                查看
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                编辑
              </button>
              <button className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all">
                删除
              </button>
            </div>
          </div>
        </div>

        {/* 空卡片 - 用于新建 */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300 overflow-hidden hover:border-blue-400 transition-colors duration-300">
          <div className="h-40 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl text-blue-400 mb-2">+</div>
              <div className="text-blue-600 font-medium">添加新小说</div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">开始创作</h3>
            <p className="text-gray-600 mb-6">
              点击这里开始创作你的下一部小说作品
            </p>
            
            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
              创建新小说
            </button>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">创作统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600">6</div>
            <div className="text-gray-600">总作品数</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600">2</div>
            <div className="text-gray-600">已完结</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-yellow-600">4</div>
            <div className="text-gray-600">连载中</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600">753,000</div>
            <div className="text-gray-600">总字数</div>
          </div>
        </div>
      </div>
    </div>
  );
}