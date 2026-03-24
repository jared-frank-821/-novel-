import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchableSelect, CATEGORIES, ALL_TAGS, TAGS_BY_CATEGORY, getTagsByCategory, getCategoryByTag } from './select';

const defaultProps = {
  value: '',
  onChange: vi.fn(),
  placeholder: '搜索或选择...',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SearchableSelect - 工具函数', () => {
  it('CATEGORIES 包含4个分类', () => {
    expect(CATEGORIES).toHaveLength(4);
    expect(CATEGORIES.map(c => c.id)).toEqual(['theme', 'plot', 'mood', 'timespace']);
  });

  it('ALL_TAGS 包含所有标签', () => {
    expect(ALL_TAGS).toContain('言情');
    expect(ALL_TAGS).toContain('古代');
    expect(ALL_TAGS).toContain('HE');
  });

  it('TAGS_BY_CATEGORY 按分类分组', () => {
    expect(TAGS_BY_CATEGORY['theme']).toEqual(['言情', '现实情感', '悬疑', '惊悚', '科幻', '武侠']);
    expect(TAGS_BY_CATEGORY['plot']).toEqual(['出轨', '系统', '权谋', '婚姻', '家庭', '校园', '职场', '娱乐圈']);
  });

  it('getTagsByCategory 返回指定分类标签', () => {
    expect(getTagsByCategory('theme')).toEqual(CATEGORIES[0].tags);
    expect(getTagsByCategory('nonexistent')).toEqual([]);
  });

  it('getCategoryByTag 返回标签所属分类', () => {
    const cat = getCategoryByTag('言情');
    expect(cat?.id).toBe('theme');
    expect(cat?.label).toBe('题材');
  });

  it('getCategoryByTag 不存在的标签返回 undefined', () => {
    expect(getCategoryByTag('不存在的标签')).toBeUndefined();
  });
});

describe('SearchableSelect - 组件渲染', () => {
  it('渲染时显示 placeholder', () => {
    render(<SearchableSelect {...defaultProps} />);
    expect(screen.getByText('搜索或选择...')).toBeInTheDocument();
  });

  it('选中值时显示值而非 placeholder', () => {
    render(<SearchableSelect {...defaultProps} value="言情" />);
    expect(screen.getByText('言情')).toBeInTheDocument();
    expect(screen.queryByText('搜索或选择...')).not.toBeInTheDocument();
  });

  it('有值时显示清除按钮', () => {
    render(<SearchableSelect {...defaultProps} value="言情" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});

describe('SearchableSelect - 交互', () => {
  it('点击容器打开下拉菜单', () => {
    render(<SearchableSelect {...defaultProps} />);
    fireEvent.click(screen.getByText('搜索或选择...'));
    // 搜索输入框应该出现
    expect(screen.getByPlaceholderText('搜索分类...')).toBeInTheDocument();
  });

  it('点击外部关闭下拉菜单', () => {
    render(<SearchableSelect {...defaultProps} />);
    fireEvent.click(screen.getByText('搜索或选择...'));
    expect(screen.getByPlaceholderText('搜索分类...')).toBeInTheDocument();

    fireEvent.mouseDown(document);
    expect(screen.queryByPlaceholderText('搜索分类...')).not.toBeInTheDocument();
  });

  it('选中标签后关闭菜单并触发 onChange', () => {
    render(<SearchableSelect {...defaultProps} />);
    fireEvent.click(screen.getByText('搜索或选择...'));

    // 点击"言情"标签
    fireEvent.click(screen.getByText('言情'));

    expect(defaultProps.onChange).toHaveBeenCalledWith('言情');
    expect(screen.queryByPlaceholderText('搜索分类...')).not.toBeInTheDocument();
  });

  it('点击清除按钮清空值并触发 onChange', () => {
    render(<SearchableSelect {...defaultProps} value="言情" />);
    const clearBtn = screen.getByRole('button');
    fireEvent.click(clearBtn);

    expect(defaultProps.onChange).toHaveBeenCalledWith('');
  });

  it('搜索过滤标签', () => {
    render(<SearchableSelect {...defaultProps} />);
    fireEvent.click(screen.getByText('搜索或选择...'));

    const input = screen.getByPlaceholderText('搜索分类...');
    fireEvent.change(input, { target: { value: '言' } });

    expect(screen.getByText('言情')).toBeInTheDocument();
  });

  it('搜索无匹配时显示空状态', () => {
    render(<SearchableSelect {...defaultProps} />);
    fireEvent.click(screen.getByText('搜索或选择...'));

    const input = screen.getByPlaceholderText('搜索分类...');
    fireEvent.change(input, { target: { value: 'xyz123' } });

    expect(screen.getByText('未找到匹配的分类')).toBeInTheDocument();
  });

  it('分类筛选按钮点击切换', () => {
    render(<SearchableSelect {...defaultProps} />);
    fireEvent.click(screen.getByText('搜索或选择...'));

    // 点击"题材"分类筛选
    const themeBtn = screen.getByRole('button', { name: '题材' });
    fireEvent.click(themeBtn);

    // 题材按钮应有选中样式（通过 bg-blue-500 class）
    expect(themeBtn).toHaveClass('bg-blue-500');
  });
});
