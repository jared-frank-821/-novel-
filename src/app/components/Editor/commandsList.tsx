// components/Editor/CommandsList.tsx
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Sparkles, TextQuote, Heading1, Heading2 } from 'lucide-react';

export const CommandsList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      // 确保命令被正确调用，传递 editor 和 range
      if (props.command && typeof props.command === 'function') {
        props.command(item);
      }
    }
  };

  // 允许父组件（Tiptap）控制滚动和选中逻辑
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  // 当 items 变化时重置选中索引
  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden min-w-45 p-1">
      {props.items.length === 0 ? (
        <div className="px-3 py-2 text-sm text-gray-500">没有找到匹配的命令</div>
      ) : (
        props.items.map((item: any, index: number) => (
          <button
            key={index}
            onClick={() => selectItem(index)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-md ${
              index === selectedIndex ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            {item.title}
          </button>
        ))
      )}
    </div>
  );
});

CommandsList.displayName = 'CommandsList';
