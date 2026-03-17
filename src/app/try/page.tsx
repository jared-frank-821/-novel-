'use client';

import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Menu,
  Undo2,
  Redo2,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  PenLine,
  GitBranch,
  MoreHorizontal,
  Upload,
  Info,
  Tag,
  BookOpen, 
  Pencil,
  Trash2,
  Users,
  FileText,
  Inbox,
  Plus,
  MessageCircle,
  Lightbulb,
} from 'lucide-react';
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner";
// import { Button } from "@/components/ui/button"
import  useNovelListStore  from '@/store/useNovelListStore';

export default function TextCompletionPage() {
  const { 
    novelList, //小说列表
    currentChapterIndex, //当前章节索引
    trashList,//回收站列表
    selectChapter, //选择章节
    updateChapterText, //更新章节内容
    updateChapter, //更新章节
    addChapter ,//添加章节
    deleteChapter,//删除章节
    deleteTrashChapter//删除回收站章节
  } = useNovelListStore();//使用 Zustand store 获取小说列表和当前选中的章节索引

  // 获取当前选中的章节内容
  const currentChapter = novelList.find(c => c.index === currentChapterIndex);
  const content = currentChapter?.text || '';
  
  // const [input, setInput] = useState('');
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rightPanelInput, setRightPanelInput] = useState('');
  const [smartComplete, setSmartComplete] = useState(true);
  const [leftOpen, setLeftOpen] = useState<'chapters' | 'trash' | null>('chapters');
  const [rightTab, setRightTab] = useState<'ai' | 'inspiration'>('ai');
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null);

  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error' | 'no-key'>('checking');
  const [apiMessage, setApiMessage] = useState('正在检测API连接...');
//   const [promptTextIndex, setPromptTextIndex] = useState(0);
// const [promptTextList, setPromptTextList] = useState<{index: number; text: string}[]>([]);
  useEffect(() => {//调用api的函数
    const checkApiConnection = async () => {
      try {
        const response = await fetch('/api/completion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: '测试' }),
        });
        if (response.ok) {
          setApiStatus('connected');
          setApiMessage('API连接正常');
        } else {
          const errorData = await response.json();
          setApiStatus('error');
          setApiMessage(errorData.message || response.statusText);
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : '无法连接';
        if (msg.includes('API key') || msg.includes('environment')) {
          setApiStatus('no-key');
          setApiMessage('请配置 .env.local 中的 DEEPSEEK_API_KEY');
        } else {
          setApiStatus('error');
          setApiMessage(msg);
        }
      }
    };
    checkApiConnection();
  }, []);

  const runCompletion = async (promptText: string) => {
    if (!promptText.trim()) {
      alert('请先输入要续写的内容');
      return;
    }
    setIsLoading(true);
    setCompletion('');
    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
          setCompletion(result);
        }
      } else {
        const err = await response.json().catch(() => ({}));
        alert(err.message || '请求失败');
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : '请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillBody = () => runCompletion(content);
  const handleRightSend = () => {//发送右侧输入的内容到api
    runCompletion(rightPanelInput);
    setRightPanelInput('');
  };

  const wordCount = (content + completion).replace(/\s/g, '').length;

  const handleSaveArticle = () => {
    if (currentChapterIndex > 0) {
      updateChapterText(currentChapterIndex, content);
      toast.success("保存成功！");
    } else {
      toast.error("请先选择或创建一个章节");
    }
  };

  // 处理文本内容变化
  const handleContentChange = (newContent: string) => {
    if (currentChapterIndex > 0) {
      updateChapterText(currentChapterIndex, newContent);
    }
  };
  return (
    <>
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 顶栏 */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50 shrink-0">
        <div className="flex items-center gap-4">
          <button type="button" className="flex items-center gap-1 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="size-4" /> 退出
          </button>
          <span className="text-sm text-gray-500">已保存到云端</span>
          <span className="text-sm text-gray-600">
            本章字数: {content.replace(/\s/g, '').length} 总字数: {wordCount}
          </span>
          <Info className="size-4 text-gray-400" />
          <Toaster />  
        </div>
      
      </header>

      <div className="flex flex-1 min-h-0">
        {/* 左侧边栏 */}
        <aside className="w-56 border-r border-gray-200 bg-gray-50/80 flex flex-col shrink-0">
          <div className="flex items-center gap-2 px-3 py-3 border-b border-gray-200">
            <Menu className="size-4 text-gray-500" />
            <span className="font-medium text-gray-900">我的作品</span>
          </div>
          <nav className="p-2 space-y-0.5 text-sm">
            {[
              { key: 'info', label: '作品信息', icon: FileText },
              { key: 'tags', label: '标签', icon: Tag },
              { key: 'outline', label: '大纲', icon: BookOpen },
              { key: 'chars', label: '角色', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200"
              >
                <ChevronRight className="size-4" />
                <Icon className="size-4" />
                {label}
              </button>
            ))}
            <div className="pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setLeftOpen(leftOpen === 'chapters' ? null : 'chapters')}
                  className="flex-1 flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-200 font-medium"
                >
                  {leftOpen === 'chapters' ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  <FileText className="size-4" />
                  章节
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-700 shrink-0"
                  onClick={() => {
                    // TODO: 在此添加「添加章节」的逻辑
                    addChapter();//添加章节
                  }}
                  title="添加章节"
                >
                  {/* 添加章节按钮 */}
                  <Plus className="size-4" />
                </button>
              </div>
              {leftOpen === 'chapters' && (//// 只有当左侧栏展开"章节"时才显示
                <div className="pl-6 pr-2 py-1 space-y-0.5">
                  {novelList.map((chapter) => (//用map遍历小说列表，把每一章节都拿出来
                    editingChapterIndex === chapter.index ? (//如果当前编辑的章节索引等于章节索引，则显示输入框
                      // 输入框的显示
                      <div key={chapter.index} className="flex items-center gap-2 w-full py-1.5">
                        <input 
                        type="text" 
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        defaultValue={chapter.title}
                        autoFocus
                        // 1. 失去焦点时保存并退出 (体验更好)
                        onBlur={(e) => {
                          updateChapter(chapter.index, { title: e.target.value });
                          setEditingChapterIndex(null); // 假设你的设置函数叫这个，记得把 index 设为 null 或 -1
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            // 2. 按回车时保存
                            updateChapter(chapter.index, { title: e.currentTarget.value });
                            // 3. 关键：必须关闭编辑状态，才会切换回非编辑的显示界面
                            setEditingChapterIndex(null); 
                          }
                          // 4. 可选：按 Esc 取消编辑
                          if (e.key === 'Escape') {
                            setEditingChapterIndex(null);
                          }
                        }}
                      />
                      </div>
                    ) : (
                      // 章节列表的显示
                      <button 
                        key={chapter.index}
                        type="button" 
                        onClick={() => selectChapter(chapter.index)}
                        className={`flex items-center gap-2 w-full py-1.5 text-gray-600 hover:text-gray-900 ${currentChapterIndex === chapter.index ? 'bg-gray-200 font-medium' : ''}`}
                      >
                        {chapter.title} <span className="text-gray-400 ml-auto">{chapter.wordCount}字</span>
                        {/* 静态编辑图标 */}
                        <Pencil 
                          className="size-3.5 text-gray-400 hover:text-blue-500 ml-2" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingChapterIndex(chapter.index);
                          }}
                        />
                        {/* 静态删除图标 */}
                        <Trash2 className="size-3.5 text-gray-400 hover:text-red-500 ml-2" onClick={(e)=>{
                          e.stopPropagation();
                          deleteChapter(chapter.index);// 阻止事件冒泡,防止触发点击章节事件
                          toast.info('删除成功');
                        }} />
                      </button>
                    )
                  ))}
                  {novelList.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">暂无章节，点击 + 添加</p>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setLeftOpen(leftOpen === 'trash' ? null : 'trash')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200"
            >
              {leftOpen === 'trash' ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <Inbox className="size-4" />
              回收站
            </button>
            {leftOpen === 'trash' && (
                <div className="pl-6 pr-2 py-1 space-y-0.5">
                  {trashList.map((trashChapter) => (
                    <div 
                      key={trashChapter.id}
                      className="flex items-center gap-2 w-full py-1.5 text-gray-400"
                    >
                      {trashChapter.title} <span className="text-gray-400 ml-auto">{trashChapter.wordCount}字</span>
                      <Trash2 className="size-3.5 text-gray-400 hover:text-red-500 ml-2" onClick={(e)=>{
                        e.stopPropagation();
                        deleteTrashChapter(trashChapter.id);
                        toast.info('已彻底删除');
                      }} />
                    </div>
                  ))}
                  {trashList.length === 0 && (
                    <p className="text-xs text-gray-400 py-2">暂无回收文章</p>
                  )}
                </div>
              )}
          </nav>
        </aside>

        {/* 中间编辑区 */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* 格式工具栏 */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 shrink-0">
            <button type="button" className="p-2 rounded hover:bg-gray-100" title="撤销"><Undo2 className="size-4" /></button>
            <button type="button" className="p-2 rounded hover:bg-gray-100" title="重做"><Redo2 className="size-4" /></button>
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <button type="button" className="px-2 py-1 text-xs rounded hover:bg-gray-100 font-medium">H1</button>
            <button type="button" className="px-2 py-1 text-xs rounded hover:bg-gray-100 font-medium">H2</button>
            <button type="button" className="px-2 py-1 text-xs rounded hover:bg-gray-100 font-medium">H3</button>
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <button type="button" className="p-2 rounded hover:bg-gray-100"><Bold className="size-4" /></button>
            <button type="button" className="p-2 rounded hover:bg-gray-100"><Italic className="size-4" /></button>
            <button type="button" className="p-2 rounded hover:bg-gray-100"><Underline className="size-4" /></button>
            <button type="button" className="p-2 rounded hover:bg-gray-100"><Strikethrough className="size-4" /></button>
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <button type="button" className="p-2 rounded hover:bg-gray-100"><List className="size-4" /></button>
            <button type="button" className="p-2 rounded hover:bg-gray-100"><ListOrdered className="size-4" /></button>
            <button type="button" className="p-2 rounded hover:bg-gray-100"><AlignLeft className="size-4" /></button>
          </div>

          {/* AI 创作提示 + 按钮 */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <p className="text-sm text-gray-600 mb-3">AI帮你高效完成创作!</p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleFillBody}
                disabled={isLoading || apiStatus !== 'connected'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <PenLine className="size-4" /> 填写正文
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 text-sm font-medium"
              >
                <GitBranch className="size-4" /> 填写情节
              </button>
              <button
                type="button"
                onClick={handleSaveArticle}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium"
              >
                <Upload className="size-4" /> 保存文章
              </button>
              <button type="button" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100">
                <MoreHorizontal className="size-4" />
              </button>
            </div>
          </div>

          {/* 智能补全 + 字体字号 */}
          <div className="flex items-center gap-4 px-4 py-2 border-b border-gray-100 text-sm shrink-0">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={smartComplete}
                onChange={(e) => setSmartComplete(e.target.checked)}
                className="rounded border-gray-300"
              />
              智能补全
            </label>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">字体: 默认</span>
            <span className="text-gray-600">字号: 标准</span>
          </div>

          {/* 主编辑区 */}
          <div className="flex-1 p-4 overflow-auto">
            <textarea //文本内容具体获得位置，通过input（用usestate来设置的）来获得内容，然后通过onChange来设置内容
              className="w-full h-full min-h-[200px] p-4 border-0 resize-none focus:ring-0 focus:outline-none text-gray-900 placeholder:text-gray-400"
              value={content}// 从 Zustand 取值
              onChange={(e)=>handleContentChange(e.target.value)}// 用户输入时，调用 Zustand 的 action 存值,存到zustand里
              placeholder="在此填写正文..."
            />
            {completion && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">续写结果：</p>
                <div className="text-gray-700 whitespace-pre-wrap">{completion}</div>
              </div>
            )}
            {apiStatus !== 'connected' && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                {apiMessage}
              </div>
            )}
          </div>
        </section>

        {/* 右侧 AI 助手 */}
        <aside className="w-80 border-l border-gray-200 bg-gray-50/80 flex flex-col shrink-0">
          <div className="flex border-b border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setRightTab('inspiration')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm ${rightTab === 'inspiration' ? 'text-gray-900 font-medium border-b-2 border-emerald-500' : 'text-gray-500'}`}
            >
              <Lightbulb className="size-4" /> 灵感卡片
            </button>
            <button
              type="button"
              onClick={() => setRightTab('ai')}
              className={`flex-1 flex items-center justify-center gap-1 py-3 text-sm ${rightTab === 'ai' ? 'text-gray-900 font-medium border-b-2 border-emerald-500' : 'text-gray-500'}`}
            >
              <MessageCircle className="size-4" /> AI对话
            </button>
          </div>
          <div className="flex-1 flex flex-col p-4 min-h-0 overflow-hidden">
            {rightTab === 'ai' && (
              <>
                <div className="mb-4 shrink-0">
                  <p className="text-xs text-gray-500 mb-2">内容由AI生成，仅供参考</p>
                  <div className="p-3 rounded-lg bg-white border border-gray-200">
                    <p className="text-sm text-gray-700">
                      嗨! 我是智能写作助手。今天想写什么故事?
                    </p>
                  </div>
                </div>
                <div className="mt-auto space-y-2 shrink-0">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Upload className="size-3" /> 上传文件
                    <span className="ml-auto">引用内容 0/50000字</span>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none placeholder:text-gray-400"
                    rows={2}
                    placeholder="写作课如何写好? 试试..."
                    value={rightPanelInput}
                    onChange={(e) => setRightPanelInput(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">默认工具</span>
                    <button
                      type="button"
                      onClick={handleRightSend}
                      disabled={isLoading || apiStatus !== 'connected'}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-sm"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </>
            )}
            {rightTab === 'inspiration' && (
              <div className="text-sm text-gray-500 text-center py-8">灵感卡片内容区域</div>
            )}
          </div>
        </aside>
      </div>
    </div>
    <Toaster />
    </>
  );
}
