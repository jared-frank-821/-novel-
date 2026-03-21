'use client';

import useNovelListStore from '@/store/useNovelListStore';

type Category = {
  id: string;
  label: string;
  totalCount: number;
  tags: string[];
};

const CATEGORIES: Category[] = [
  {
    id: 'theme',
    label: '题材',
    totalCount: 1,
    tags: [
      '言情', '现实情感', '悬疑', '惊悚', '科幻', '武侠', '脑洞', '太空歌剧',
      '赛博朋克', '游戏', '仙侠', '历史', '玄幻', '奇幻', '都市', '军事',
      '电竞', '体育', '现实', '诸天无限', '快穿',
    ],
  },
  {
    id: 'plot',
    label: '情节',
    totalCount: 3,
    tags: [
      '出轨', '系统', '权谋', '婚姻', '家庭', '校园', '职场', '娱乐圈',
      '重生', '穿越', '犯罪', '丧尸', '探险', '宫斗宅斗', '克苏鲁',
      '规则怪谈', '团宠', '囤物资', '先婚后爱', '追妻火葬场', '破镜重圆',
      '争霸', '超能力/异能', '玄学风水', '种田', '直播', '萌宝', '美食',
      '鉴宝', '聊天群', '卡牌', '弹幕',
    ],
  },
  {
    id: 'mood',
    label: '情绪',
    totalCount: 3,
    tags: [
      '求生', '纯爱', 'HE', 'BE', '甜宠', '虐恋', '暗恋', '先虐后甜',
      '沙雕', '爽文', '复仇', '反转', '逆袭', '励志', '烧脑', '热血',
      '打脸', '多视角反转', '治愈', '反套路', '搞笑吐槽', '无CP',
    ],
  },
  {
    id: 'timespace',
    label: '时空',
    totalCount: 1,
    tags: ['古代', '现代', '未来', '架空', '民国'],
  },
];

const TAG_TO_CAT: Record<string, string> = CATEGORIES.reduce((acc, cat) => {
  cat.tags.forEach((t) => { acc[t] = cat.id; });
  return acc;
}, {} as Record<string, string>);

const INIT_MAP: Record<string, string[]> = {
  theme: [],
  plot: [],
  mood: [],
  timespace: [],
};

interface CategoriesContentProps {
  /** 是否紧凑模式（嵌入中间面板时使用） */
  compact?: boolean;//核心设计：compact 模式。因为分类界面原来是为全屏页面设计的（有 min-h-screen bg-gray-100/80 p-6），嵌入中间面板后布局不同。compact=true 时只输出精简结构：
}

export default function CategoriesContent({ compact = false }: CategoriesContentProps) {
  const currentNovelId = useNovelListStore((s) => s.currentNovelId);
  const toggleTag = useNovelListStore((s) => s.toggleTag);

  const selectedTags = useNovelListStore((s) => {
    if (!s.currentNovelId) return [];
    return s.novels.find((n) => n.id === s.currentNovelId)?.selectedTags ?? [];
  });

  const selectedMap: Record<string, string[]> = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = selectedTags.length > 0
      ? selectedTags.filter((t) => TAG_TO_CAT[t] === cat.id)
      : INIT_MAP[cat.id] ?? [];
    return acc;
  }, {} as Record<string, string[]>);

  function selectTag(tag: string, catId: string) {
    const catDef = CATEGORIES.find((c) => c.id === catId);
    const limit = catDef?.totalCount ?? 1;
    const sameCatTags = selectedTags.filter((t) => TAG_TO_CAT[t] === catId);

    if (!sameCatTags.includes(tag) && sameCatTags.length >= limit) return;
    toggleTag(tag);
  }

  const content = !currentNovelId ? (
    <p className="text-sm text-gray-400">请先在左侧选择或创建一本小说。</p>
  ) : (
    <div className="space-y-6">
      {CATEGORIES.map((cat) => {
        const selected = selectedMap[cat.id] ?? [];
        return (
          <section key={cat.id}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">{cat.label}</span>
              <span className="text-xs text-gray-400">
                {selected.length}/{cat.totalCount}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.tags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => selectTag(tag, cat.id)}
                  className={`
                    inline-flex items-center rounded px-2.5 py-1 text-sm cursor-pointer select-none
                    ${selected.includes(tag)
                      ? 'border border-emerald-500 bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  {tag}
                </span>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );

  if (compact) {
    return (
      <div className="flex flex-col h-full overflow-auto">
        <h2 className="text-lg font-bold text-gray-900 shrink-0">标签</h2>
        <hr className="mt-2 mb-4 border-gray-200 shrink-0" />
        <div className="flex-1">{content}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100/80 p-6">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">标签</h1>
        <hr className="mt-3 border-gray-200" />
        <div className="mt-6">{content}</div>
      </div>
    </div>
  );
}
