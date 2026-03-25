'use client';

import { useEffect } from 'react';
import useNovelListStore from '@/store/useNovelListStore';
import { Cloud, CloudOff, Loader2, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface SyncStatusIndicatorProps {
  className?: string;
}

export function SyncStatusIndicator({ className = '' }: SyncStatusIndicatorProps) {
  const { syncState, isInitialized, initSync, forceSync, subscribeSync } = useNovelListStore();

  useEffect(() => {
    if (!isInitialized) {
      initSync();
    }
    const unsubscribe = subscribeSync();
    return unsubscribe;
  }, [isInitialized, initSync, subscribeSync]);

  const getStatusIcon = () => {
    switch (syncState.status) {
      case 'syncing':
        return <Loader2 className="size-3.5 animate-spin" />;
      case 'success':
        return <Check className="size-3.5 text-green-500" />;
      case 'error':
        return <AlertCircle className="size-3.5 text-red-500" />;
      default:
        return <Cloud className="size-3.5" />;
    }
  };

  const getStatusText = () => {
    switch (syncState.status) {
      case 'syncing':
        return '同步中...';
      case 'success':
        return syncState.lastSyncTime
          ? `已同步 ${formatTime(syncState.lastSyncTime)}`
          : '已同步';
      case 'error':
        return syncState.error || '同步失败';
      default:
        return '已保存到云端';
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span className="text-gray-500">{getStatusText()}</span>
      {syncState.status === 'error' && (
        <button
          onClick={() => forceSync()}
          className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
          title="重试"
        >
          <RefreshCw className="size-3" />
        </button>
      )}
    </div>
  );
}
