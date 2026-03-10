"use client";

import dynamic from 'next/dynamic';
import { Save, Download, Upload, X } from "lucide-react";
import { useState } from "react";

// 动态导入编辑器组件
const Editor = dynamic(() => import('../components/Editor/Editor'), {
  ssr: false,
  loading: () => <div className="text-center py-12">编辑器加载中...</div>
});

export default function EditorPage() {
  const [title, setTitle] = useState("新小说");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleSave = () => {
    if (fileName.trim()) {
      alert(`小说 "${fileName}" 已保存！`);
      setShowSaveModal(false);
      setFileName("");
    }
  };

  return (
    <div className="space-y-8">
      {/* 页面标题和操作按钮 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">小说编辑器</h1>
          <p className="text-gray-600 mt-2">开始创作你的故事，支持实时保存和格式编辑</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
          >
            <Save size={18} />
            保存作品
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md">
            <Download size={18} />
            导出
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-md">
            <Upload size={18} />
            导入
          </button>
        </div>
      </div>

      {/* 小说标题输入 */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          小说标题
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="请输入小说标题..."
        />
      </div>

      {/* 编辑器区域 */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-lg font-semibold text-gray-900">编辑区域</h2>
          <p className="text-sm text-gray-600">使用气泡菜单进行格式编辑，内容自动保存</p>
        </div>
        <div className="p-6">
          <Editor />
        </div>
      </div>

      {/* 保存模态框 */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">保存作品</h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作品名称
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="请输入作品名称..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述（可选）
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={3}
                  placeholder="添加作品描述..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSaveModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">使用提示</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• 选中文本会出现气泡菜单，可进行加粗、斜体等格式编辑</li>
          <li>• 内容会自动保存到本地存储</li>
          <li>• 使用快捷键 Ctrl+S 快速保存</li>
          <li>• 支持导出为多种格式（JSON、HTML、纯文本）</li>
        </ul>
      </div>
    </div>
  );
}