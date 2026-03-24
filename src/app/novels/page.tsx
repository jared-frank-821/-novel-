"use client";
import useNovelListStore from "@/store/useNovelListStore";
import Link from "next/link";
import { Drawer } from "@/components/ui/drawer"
import InformationPage from "@/components/information/page"
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { SearchableSelect, CATEGORIES, ALL_TAGS } from "@/components/ui/select"

export default function NovelsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const {novels,currentNovelId,selectNovel,deleteNovel,selectChapter}=useNovelListStore()
  const [searchText, setSearchText] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterStatus, setFilterStatus] = useState('全部');
  const novelsCount=novels.length
  const novelsContinueCount=novels.filter(novel => novel.status === '连载中').length
  const novelsFinishcount=novels.filter(novel => novel.status === '已完结').length
 const novelsWordCount=novels.reduce((acc,novel)=>acc+novel.chapters.reduce((acc,chapter)=>acc+chapter.wordCount,0),0)

  const filteredNovels = novels.filter(novel => {
    const matchSearch = novel.title.includes(searchText);
    const matchTag = !filterTag || novel.selectedTags.includes(filterTag);
    const matchStatus = filterStatus === '全部' || novel.status === filterStatus;
    return matchSearch && matchTag && matchStatus;
  });
  const handeleView=(id:string)=>{
    selectNovel(id)
  
  }
  const jumpToEditor=(id:string)=>{
    selectNovel(id)
    selectChapter(0)
  }
  return (
    <div className="space-y-8">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的小说</h1>
          <p className="text-gray-600 mt-2">管理你的所有小说作品</p>
        </div>
        
        <Link 
          href="/editor" 
          className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          新建小说
        </Link>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 搜索框 */}
          <div className="relative">
            <input
              type="text"
              placeholder="搜索小说..."
              onChange={(e)=>setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* 分类筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            <SearchableSelect
              value={filterTag}
              onChange={setFilterTag}
              placeholder="搜索分类..."
            />
          </div>

          {/* 状态筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              状态
            </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg ..."
           >
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
       { filteredNovels.map((novels)=>{
        let wordCount=novels.chapters.reduce((acc,chapter)=>acc+chapter.wordCount,0)
          return (
            <div key={novels.id} className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="h-40 bg-linear-to-r from-blue-500 to-purple-600 relative">
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                {novels.status}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-gray-900">{novels.title}</h3>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {novels.description}
              </span>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {novels.description}
            </p>

            {/* 元数据 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-500">
                <span>作者：{novels.author}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>字数：{wordCount}字</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>创建：{novels.createTime}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>更新：{novels.updateTime}</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              <button  onClick={() => {
                selectNovel(novels.id)
                setDrawerOpen(true)
              }} className="flex-1 px-4 py-2 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">
                查看
              </button>
              <Link href="/editor"  onClick={()=>jumpToEditor(novels.id)} className="flex-1 px-4 py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all">
                编辑
              </Link>
                      
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="lg" className="bg-red-500 text-white! hover:!bg-red-600! hover:!border-red-600!">删除</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>确定删除吗？</AlertDialogTitle>
                    <AlertDialogDescription>
                      删除后将无法恢复，请谨慎操作。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>取消</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" size="lg" onClick={()=>deleteNovel(novels.id)}>删除</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            


            </div>
          </div>
        </div>
          )})}
     

        {/* 空卡片 - 用于新建 */}
        <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-dashed border-blue-300 overflow-hidden hover:border-blue-400 transition-colors duration-300">
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
            
            <Link href="/editor" className="w-full px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md">
              创建新小说
            </Link>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-linear-to-r from-blue-50 to-blue-100 rounded-2xl p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">创作统计</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-blue-600">{novelsCount}</div>
            <div className="text-gray-600">总作品数</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-green-600">{novelsFinishcount}</div>
            <div className="text-gray-600">已完结</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-yellow-600">{novelsContinueCount}</div>
            <div className="text-gray-600">连载中</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <div className="text-3xl font-bold text-purple-600">{novelsWordCount}</div>
            <div className="text-gray-600">总字数</div>
          </div>
        </div>
      </div>

      {/* 详情抽屉 */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="小说详情"
      >
        <div className="h-full overflow-y-auto">
          <InformationPage />
        </div>
      </Drawer>
    </div>
  );
}