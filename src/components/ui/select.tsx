'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

// 从 CategoriesContent 复制过来的分类定义
export type Category = {
  id: string;
  label: string;
  totalCount: number;
  tags: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: 'theme',
    label: '题材',
    totalCount: 1,
    tags: ['言情', '现实情感', '悬疑', '惊悚', '科幻', '武侠'],
  },
  {
    id: 'plot',
    label: '情节',
    totalCount: 3,
    tags: ['出轨', '系统', '权谋', '婚姻', '家庭', '校园', '职场', '娱乐圈'],
  },
  {
    id: 'mood',
    label: '情绪',
    totalCount: 3,
    tags: ['求生', '纯爱', 'HE', 'BE', '甜宠', '虐恋', '暗恋', '先虐后甜'],
  },
  {
    id: 'timespace',
    label: '时空',
    totalCount: 1,
    tags: ['古代', '现代', '未来', '架空', '民国'],
  },
];

// 扁平化所有标签
export const ALL_TAGS = CATEGORIES.flatMap((cat) => cat.tags);

// 按分类分组的标签
export const TAGS_BY_CATEGORY = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat.tags;
  return acc;
}, {} as Record<string, string[]>);

// 根据分类ID获取标签列表
export function getTagsByCategory(categoryId: string): string[] {
  return TAGS_BY_CATEGORY[categoryId] || [];
}

// 获取标签所属的分类
export function getCategoryByTag(tag: string): Category | undefined {
  return CATEGORIES.find((cat) => cat.tags.includes(tag));
}

// 搜索框组件 - 支持输入搜索和分类选择
interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchableSelect({
  value,
  onChange,
  placeholder = '搜索或选择...',
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 打开时聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 过滤标签
  const filteredTags = ALL_TAGS.filter((tag) => {
    const matchesSearch = tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || TAGS_BY_CATEGORY[selectedCategory]?.includes(tag);
    return matchesSearch && matchesCategory;
  });

  // 按分类分组显示
  const groupedTags = CATEGORIES.map((cat) => ({
    ...cat,
    tags: cat.tags.filter(
      (tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'all' || cat.id === selectedCategory)
    ),
  })).filter((cat) => cat.tags.length > 0 || searchTerm === '');

  const handleSelect = (tag: string) => {
    onChange(tag);
    setIsOpen(false);
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg cursor-pointer bg-white hover:border-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {value || placeholder}
        </span>
        {value && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="ml-auto p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {/* 搜索输入框 */}
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索分类..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 分类筛选 */}
          <div className="p-2 border-b border-gray-100 flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 py-1 text-xs rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 标签列表 */}
          <div className="max-h-64 overflow-y-auto p-2">
            {groupedTags.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-4">未找到匹配的分类</p>
            ) : (
              groupedTags.map((cat) => (
                <div key={cat.id} className="mb-3 last:mb-0">
                  <div className="text-xs font-medium text-gray-500 mb-1 px-1">
                    {cat.label}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleSelect(tag)}
                        className={`px-2 py-1 text-sm rounded-md transition-colors ${
                          value === tag
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
