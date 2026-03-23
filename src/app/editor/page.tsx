'use client';

import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { Underline as UnderlineExtension } from '@tiptap/extension-underline';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
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
  Download,
  Sparkles,
  Loader2,
  Highlighter,
  Book,
  Library,
  FolderOpen,
  X,
  FolderPlus,
  Image,
  Tags,
} from 'lucide-react';
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner";
// import { Button } from "@/components/ui/button"
import useNovelListStore from '@/store/useNovelListStore';
import { saveImage,getImageUrl,deleteImage } from '@/store/useImageDB';
import CategoriesContent from '@/components/categories/CategoriesContent';
import InformationPage from '@/components/information/page';
export default function TextCompletionPage() {
  const {
    novels,
    currentNovelId,
    currentChapterIndex,
    trashList,
    selectNovel,
    updateNovel,
    addNovel,
    deleteNovel,
    selectChapter,
    updateChapterText,
    updateChapter,
    addChapter,
    deleteChapter,
    deleteTrashChapter,
    updateNovelCover,
  } = useNovelListStore();

  // 获取当前选中的小说
  const currentNovel = novels.find(n => n.id === currentNovelId);
  // 获取当前选中的章节
  const currentChapter = currentNovel?.chapters.find(c => c.index === currentChapterIndex);
  const content = currentChapter?.text || '';
  
  // const [input, setInput] = useState('');
  const [completion, setCompletion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [smartComplete, setSmartComplete] = useState(true);
  const [leftOpen, setLeftOpen] = useState<'chapters' | 'trash' |'categories'|'information'| null>('chapters');
  const [rightTab, setRightTab] = useState<'ai' | 'inspiration'>('ai');
  const [middleView, setMiddleView] = useState<'editor' | 'categories' |'novelinformation'>('editor');//控制中间区域显示什么
  const [coverUrl, setCoverUrl] = useState<string | null>(null);//封面图的 blob URL，渲染到 <img> 上
  const [isUploadingCover, setIsUploadingCover] = useState(false);//上传中的 loading 状态，用来禁用按钮和显示转圈图标

  // 加载封面
  useEffect(() => {
    if (!currentNovel?.coverId) { setCoverUrl(null); return; }//没封面就清空，返回
    let cancelled = false;// 竞态保护：如果用户快速切换小说，先发起的请求后返回，不应该覆盖最新的封面
    setCoverUrl(null);
    getImageUrl(currentNovel.coverId).then(url => {
      if (!cancelled && url) setCoverUrl(url);
    });
    return () => { cancelled = true; };
  }, [currentNovel?.coverId]);

  // 上传封面
  const handleUploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];// 拿用户选中的文件（input type="file" 的标准用法）
    if (!file || !currentNovelId) return;
    if (!file.type.startsWith('image/')) { toast.error('请选择图片文件'); return; }
    setIsUploadingCover(true);//开始上传，禁用按钮、显示转圈
    try {
      const coverId = await saveImage(file);//保存图片，返回 ID
      await updateNovelCover(currentNovelId, coverId);//更新小说封面
      toast.success('封面上传成功');
    } catch {
      toast.error('上传失败');//上传失败，显示错误提示
    } finally {
      setIsUploadingCover(false);//上传完成，恢复按钮、隐藏转圈
      e.target.value = '';//清空 input 值，允许重复选择同一文件
    }
  };
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null);
  const [hasSelection, setHasSelection] = useState(false);//hasSelection - 是否有选中的文字（控制工具栏按钮显示
  const [isPolishing, setIsPolishing] = useState(false);//isPolishing - 是否正在润色（控制润色按钮的禁用状态
  const [chatInput, setChatInput] = useState(''); // AI 对话输入，与 useChat 配合

  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error' | 'no-key'>('checking');
  const [apiMessage, setApiMessage] = useState('正在检测API连接...');
  const [showNovelSelector, setShowNovelSelector] = useState(false);
  const [editingNovelId, setEditingNovelId] = useState<string | null>(null);

  // 点击外部关闭小说选择器
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.novel-selector')) {
        setShowNovelSelector(false);
      }
    };
    if (showNovelSelector) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNovelSelector]);

  // AI 对话：连接 /api/chat，用于右侧「AI对话」分支
  const { messages, sendMessage, status: chatStatus } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  });

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

  const handleFillBody = () => {
    setRightTab('inspiration'); // 续写结果展示在灵感卡片，先切到该 tab
    runCompletion(content);
  };

  const totalWordCount = currentNovel?.chapters.reduce((sum, chapter) => sum + (chapter.wordCount || 0), 0) || 0;

  const handleSaveArticle = () => {
    if (currentChapterIndex > 0) {
      updateChapterText(currentChapterIndex, content);
      toast.success("保存成功！");
    } else {
      toast.error("请先选择或创建一个章节");
    }
  };

  // 添加新小说
  const handleAddNovel = () => {
    addNovel();
    setShowNovelSelector(false);
  };

  // 切换小说
  const handleSelectNovel = (id: string) => {
    selectNovel(id);
    setShowNovelSelector(false);
  };

  // 处理文本内容变化 - Tiptap 编辑器回调
  const handleContentChange = (newContent: string) => {
    if (currentChapterIndex > 0) {
      updateChapterText(currentChapterIndex, newContent);
    }
  };
// 在 useEditor 之前创建一个 ref 存储定时器
const debounceRef = useRef<NodeJS.Timeout | null>(null);//创建一个 useRef 来存储定时器,这个定时器会在2秒后执行handleContentChange函数,使用 ref 而不是 state，是因为 ref 的变化不会触发组件重新渲染


  // Tiptap 编辑器实例
  const editor = useEditor({
    extensions: [StarterKit, Highlight.configure({ multicolor: true }), UnderlineExtension],//配置编辑器的扩展包。StarterKit 是 Tiptap 提供的默认扩展，包含常见的富文本功能（如标题、列表、粗体、斜体等）
    content: content,//设置编辑器的初始内容。content 变量来自 Zustand store（当前章节的文本内容）。
    immediatelyRender: false,//设置为 false，避免在组件初始化时立即渲染编辑器内容。
    onUpdate: ({ editor }) => {
      const text=editor.getText()
      //清除之前定时器
      if(debounceRef.current){
        clearTimeout(debounceRef.current)
      }
      //设置新的定时器
      debounceRef.current=setTimeout(()=>{
        handleContentChange(text)//这是内容变化回调——当用户在编辑器中输入/删除内容时触发。({ editor }) 是 Tiptap 传递的事件
      },2000)
    },
    editorProps: {//配置编辑器的 DOM 属性，这里主要是给编辑器内容区设置 CSS 类名（样式）。
      attributes: {
        class: 'w-full h-full min-h-[200px] p-4 focus:outline-none text-gray-900 placeholder:text-gray-400',
      },
    },
  });

  // 同步编辑器内容当章节切换时
  useEffect(() => {
    if (editor && editor.getText() !== content) {//当用户切换章节时，content 变量会变
      editor.commands.setContent(content);//editor.commands.setContent(content) 用新章节的内容替换编辑器当前内容
    }
  }, [content, editor]);//依赖项：当 content 或 editor 发生变化时，执行同步操作。

  // 监听选区变化
  useEffect(() => {
    if (!editor) return;
    
    const handleSelectionChange = () => {
      const { from, to } = editor.state.selection;//editor.state.selection 包含 from 和 to 两个位置： from === to → 光标位置（没有选中文字）from !== to → 选中了文字
      setHasSelection(from !== to);
    };
    
    editor.on('selectionUpdate', handleSelectionChange);
    return () => {
      editor.off('selectionUpdate', handleSelectionChange);
    };
  }, [editor]);

  // AI 润色/改写函数
  const handleAIPolish = async (mode: 'polish' | 'simplify' | 'expand' | 'rewrite') => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');//editor.state.doc.textBetween(from, to) - 获取选中的文字
    
    if (!selectedText || selectedText.trim() === '') {
      toast.warning('请先选中需要润色的文字');
      return;
    }

    setIsPolishing(true);
    try {
      const response = await fetch('/api/polish', {//调用 AI 接口
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selectedText, mode })
      });

      const data = await response.json();
      
      if (data.result) {
        editor.chain().focus().deleteSelection().insertContent(data.result).run();//替换选中的文本
        toast.success('润色完成');
      } else if (data.message) {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('润色失败:', error);
      toast.error('润色失败，请稍后重试');
    } finally {
      setIsPolishing(false);
    }
  };

useEffect(()=>{//当左侧栏的打开状态变化时，如果当前不是分类界面，则切换到编辑器界面
  if(leftOpen!=='categories' && leftOpen!=='information'){
    setMiddleView('editor')
  }
},[leftOpen])
  // 切换中间面板显示分类界面
  const handleNavigateToCategories = () => {
    setLeftOpen('categories');
    setMiddleView(middleView === 'categories' ? 'editor' : 'categories');
  };

  // 切换中间面板显示小说信息界面
  const handleNavigateToInformation = ()=>{
    setLeftOpen('information');
    setMiddleView(middleView ==='novelinformation' ? 'editor' : 'novelinformation');
  }
  // 高亮颜色选项
  const highlightColors = [
    { name: '黄色', class: 'bg-yellow-200' },
    { name: '绿色', class: 'bg-green-200' },
    { name: '蓝色', class: 'bg-blue-200' },
    { name: '粉色', class: 'bg-pink-200' },
    { name: '紫色', class: 'bg-purple-200' },
    { name: '取消', class: 'bg-gray-200' },
  ];

  // 导出数据为 JSON 文件
  const exportToJson = () => {
    const data = localStorage.getItem('novelList');
    const blob = new Blob([data || '{}'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `小说备份-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功！');
  };

  // 从 JSON 文件导入数据
  const importFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // 验证数据格式 - 新格式有 novels 数组
        if (!data.state?.novels && !data.novels) {
          throw new Error('无效的备份文件');
        }

        // 恢复数据到 localStorage
        localStorage.setItem('novelList', JSON.stringify(data));

        toast.success('导入成功！即将刷新页面...');

        // 延迟刷新页面
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        toast.error('导入失败：无效的备份文件');
        console.error(err);
      }
    };
    reader.readAsText(file);

    // 清空 input 值，允许重复选择同一文件
    event.target.value = '';
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

          {/* 小说选择器 */}
          <div className="relative novel-selector">
            <button
              type="button"
              onClick={() => setShowNovelSelector(!showNovelSelector)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Library className="size-4" />
              <span className="font-medium text-gray-900">
                {currentNovel?.title || '选择小说'}
              </span>
              <ChevronDown className="size-4 text-gray-500" />
            </button>

            {/* 小说下拉列表 */}
            {showNovelSelector && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-2 border-b border-gray-100">
                  <button
                    type="button"
                    onClick={handleAddNovel}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
                  >
                    <FolderPlus className="size-4" />
                    新建小说
                  </button>
                </div>
                <div className="max-h-60 overflow-auto p-1">
                  {novels.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-gray-400 text-center">暂无小说</p>
                  ) : (
                    novels.map(novel => (
                      <div
                        key={novel.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer ${
                          currentNovelId === novel.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectNovel(novel.id)}
                      >
                        <Book className="size-4 text-gray-400" />
                        <span className="flex-1 text-sm truncate">{novel.title}</span>
                        <span className="text-xs text-gray-400">
                          {novel.chapters.length}章
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNovel(novel.id);
                            toast.info('小说已删除');
                          }}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <span className="text-sm text-gray-600">
            本章字数: {content.replace(/\s/g, '').length} 总字数: {totalWordCount}
          </span>
          <Info className="size-4 text-gray-400" />
          <Toaster />
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportToJson}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
          >
            <Download className="size-4" />
            导出备份
          </button>
          <label className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors cursor-pointer">
            <Upload className="size-4" />
            导入备份
            <input
              type="file"
              accept=".json"
              onChange={importFromJson}
              className="hidden"
            />
          </label>
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
            {/* 作品信息 - 当前小说 */}
            <button
              type="button"
              onClick={handleNavigateToInformation}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-gray-600 hover:bg-gray-200"
            >
              {middleView === 'novelinformation' ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <FolderOpen className="size-4" />
              作品信息
            </button>

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
                    if (!currentNovelId) {
                      toast.warning('请先创建或选择一个小说');
                      return;
                    }
                    addChapter();
                  }}
                  title="添加章节"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              {leftOpen === 'chapters' && (
                <div className="pl-6 pr-2 py-1 space-y-0.5">
                  {!currentNovel ? (
                    <p className="text-xs text-gray-400 py-2">请先选择小说</p>
                  ) : currentNovel.chapters.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">暂无章节，点击 + 添加</p>
                  ) : (
                    currentNovel.chapters.map((chapter) => (
                      editingChapterIndex === chapter.index ? (
                        <div key={chapter.index} className="flex items-center gap-2 w-full py-1.5">
                          <input
                            type="text"
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            defaultValue={chapter.title}
                            autoFocus
                            onBlur={(e) => {
                              updateChapter(chapter.index, { title: e.target.value });
                              setEditingChapterIndex(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                updateChapter(chapter.index, { title: e.currentTarget.value });
                                setEditingChapterIndex(null);
                              }
                              if (e.key === 'Escape') {
                                setEditingChapterIndex(null);
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <button
                          key={chapter.index}
                          type="button"
                          onClick={() => selectChapter(chapter.index)}
                          className={`flex items-center gap-2 w-full py-1.5 text-gray-600 hover:text-gray-900 ${currentChapterIndex === chapter.index ? 'bg-gray-200 font-medium' : ''}`}
                        >
                          {chapter.title} <span className="text-gray-400 ml-auto">{chapter.wordCount}字</span>
                          <Pencil
                            className="size-3.5 text-gray-400 hover:text-blue-500 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChapterIndex(chapter.index);
                            }}
                          />
                          <Trash2 className="size-3.5 text-gray-400 hover:text-red-500 ml-2" onClick={(e) => {
                            e.stopPropagation();
                            deleteChapter(chapter.index);
                            toast.info('删除成功');
                          }} />
                        </button>
                      )
                    ))
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleNavigateToCategories}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 ${
                middleView === 'categories' ? 'bg-gray-200 font-medium text-gray-900' : 'text-gray-600'
              }`}
            >
              {middleView === 'categories' ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
              <Tags className="size-4" />
              分类
            </button>
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

        {/* 中间编辑区 / 分类面板 */}
        <section className="flex-1 flex flex-col min-w-0">
          {middleView === 'categories' ? (
            /* 分类标签界面 */
            <div className="flex-1 p-6 overflow-auto bg-gray-50">
              <CategoriesContent compact />
            </div>
          ) : middleView === 'novelinformation' ? (
            /* 小说信息界面 */
            <div className="flex-1 overflow-auto bg-gray-50">
              <InformationPage compact />
            </div>
          ) : (
            <>
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
            
            {/* AI 润色工具栏 - 选中文字时显示 */}
            {hasSelection && (//如果没有选中文字，hasseltciton为false，不会显示AI润色工具栏
              <>
                <span className="w-px h-5 bg-gray-200 mx-1" />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500 mr-1">AI:</span>
                  <button
                    type="button"
                    onClick={() => handleAIPolish('polish')}
                    disabled={isPolishing}
                    className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                    title="润色"
                  >
                    {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    润色
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAIPolish('simplify')}
                    disabled={isPolishing}
                    className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
                    title="精简"
                  >
                    精简
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAIPolish('expand')}
                    disabled={isPolishing}
                    className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
                    title="扩展"
                  >
                    扩展
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAIPolish('rewrite')}
                    disabled={isPolishing}
                    className="px-2 py-1 text-xs rounded hover:bg-purple-100 transition-colors disabled:opacity-50"
                    title="改写"
                  >
                    改写
                  </button>
                </div>
              </>
            )}
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
                <PenLine className="size-4" /> 续写正文
              </button>
              <button
                type="button"
                onClick={() => {
                  setRightTab('inspiration');
                  runCompletion(content);
                }}
                disabled={isLoading || apiStatus !== 'connected'}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <GitBranch className="size-4" /> 续写情节
              </button>
              <label
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploadingCover ? <Loader2 className="size-4 animate-spin" /> : <Image className="size-4" />}
                {isUploadingCover ? '上传中...' : '上传封面'}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"//隐藏 <input>，只显示按钮
                  onChange={handleUploadCover}
                  disabled={isUploadingCover || !currentNovelId}//禁用：上传中 或 没选中小说
                />
              </label>
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

          {/* 主编辑区：续写结果已移至右侧「灵感卡片」 */}
          <div className="flex-1 p-4 overflow-auto">
            {editor && (
              <BubbleMenu 
                editor={editor} 
                className="flex items-center gap-1 p-1 bg-gray-900 text-white rounded-lg shadow-xl"
              >
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('bold') ? 'bg-gray-700' : ''}`}
                  title="加粗 (Ctrl+B)"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('italic') ? 'bg-gray-700' : ''}`}
                  title="斜体 (Ctrl+I)"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={`p-1.5 rounded hover:bg-gray-700 transition-colors ${editor.isActive('underline') ? 'bg-gray-700' : ''}`}
                  title="下划线 (Ctrl+U)"
                >
                  <Underline size={16} />
                </button>
                
                <div className="w-px h-5 bg-gray-600 mx-1"></div>

                {/* 高亮颜色选择器 */}
                <div className="relative group">
                  <button
                    className={`p-1.5 rounded hover:bg-gray-700 transition-colors flex items-center gap-1 ${editor.isActive('highlight') ? 'bg-gray-700' : ''}`}
                    title="高亮"
                  >
                    <Highlighter size={16} />
                  </button>
                  {/* 颜色选择下拉 */}
                  <div className="absolute top-full left-0 mt-1 hidden group-hover:flex gap-1 p-1 bg-white rounded-lg shadow-lg border z-50">
                    {highlightColors.map((color, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (color.name === '取消') {
                            editor.chain().focus().unsetHighlight().run();
                          } else {
                            editor.chain().focus().toggleHighlight({ color: color.class }).run();
                          }
                        }}
                        className={`w-6 h-6 rounded-full ${color.class} hover:scale-110 transition-transform border border-gray-200`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="w-px h-5 bg-gray-600 mx-1"></div>

                {/* AI 润色按钮组 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleAIPolish('polish')}
                    disabled={isPolishing}
                    className="px-2 py-1 text-xs rounded hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-1"
                    title="润色"
                  >
                    {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    润色
                  </button>
                </div>
              </BubbleMenu>
            )}
            <EditorContent editor={editor} />
            {apiStatus !== 'connected' && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                {apiMessage}
              </div>
            )}
          </div>
            </>
          )}
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
                <p className="text-xs text-gray-500 mb-2 shrink-0">内容由AI生成，仅供参考</p>
                <div className="flex-1 overflow-auto space-y-3 mb-3 min-h-0">
                  {messages.length === 0 && (
                    <div className="p-3 rounded-lg bg-white border border-gray-200">
                      <p className="text-sm text-gray-700">嗨! 我是智能写作助手。今天想写什么故事?</p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-emerald-50 border border-emerald-200 ml-4'
                          : 'bg-white border border-gray-200 mr-4'
                      }`}
                    >
                      <span className="font-medium text-gray-500 text-xs block mb-1">
                        {message.role === 'user' ? '你' : 'AI'}
                      </span>
                      <div className="text-gray-700 whitespace-pre-wrap">
                        {message.parts
                          .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                          .map((p, i) => (
                            <span key={i}>{p.text}</span>
                          ))}
                      </div>
                    </div>
                  ))}
                  {(chatStatus === 'submitted' || chatStatus === 'streaming') && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <Loader2 className="size-4 animate-spin" />
                      正在回复…
                    </div>
                  )}
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
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatStatus !== 'ready'}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">默认工具</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (chatInput.trim()) {
                          sendMessage({ text: chatInput });
                          setChatInput('');
                        }
                      }}
                      disabled={chatStatus !== 'ready' || !chatInput.trim()}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 text-sm"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </>
            )}
            {rightTab === 'inspiration' && (
              <div className="flex flex-col h-full min-h-0 overflow-auto">
                {completion ? (
                  <div className="border border-gray-200 rounded-lg bg-white p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">续写结果：</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (editor) {
                            editor.commands.insertContent(completion);
                            setCompletion('');
                          }
                          toast.success('已插入正文');
                        }}
                        className="px-3 py-1 text-xs bg-emerald-500 text-white rounded hover:bg-emerald-600"
                      >
                        采用
                      </button>
                    </div>
                    <div className="text-gray-700 text-sm whitespace-pre-wrap">{completion}</div>
                    {isLoading && (
                      <div className="flex items-center gap-2 mt-2 text-gray-400 text-xs">
                        <Loader2 className="size-4 animate-spin" />
                        续写中…
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-8">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="size-4 animate-spin" /> 续写中…
                      </span>
                    ) : (
                      '点击「续写正文」或「续写情节」后，AI 生成的内容会显示在这里，可点击「采用」插入到正文。'
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
    <Toaster />
    </>
  );
}
