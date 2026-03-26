'use client';

import { createClient } from './client';
import type { Novel, SyncState, SyncStatus } from './types';
import { getImageBlob } from '@/store/useImageDB';
import { readPersistedNovelsFromLocalStorage } from '@/store/novelListPersistUser';
export type SyncListener = (state: SyncState) => void;

class SupabaseSyncService {
  private supabase = createClient();
  private listeners: Set<SyncListener> = new Set();
  private userId: string | null = null;
  private syncState: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    error: null,
    pendingChanges: 0,
  };
  private syncTimeout: NodeJS.Timeout | null = null;
  private debounceDelay = 2000;
  private isUnsubscribing = false;
  private authStateChangedReady = false;

  constructor() {
    this.initAuthListener();
  }

  // 监听 Auth 状态变化，userId 始终保持与登录态同步
  private async initAuthListener() {
    // 首次加载时尝试获取已登录用户
    const { data: sessionData } = await this.supabase.auth.getSession();
    if (sessionData?.session?.user) {
      this.userId = sessionData.session.user.id;
    }

    // 持续监听后续的登录/登出事件
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((_event, session) => {
      if (this.isUnsubscribing) return;
      this.userId = session?.user?.id ?? null;
    });

    this.authStateChangedReady = true;
  }

  private ensureUserId(): string {
    if (!this.userId) {
      throw new Error('用户未登录，无法同步');
    }
    return this.userId;
  }

  private updateState(updates: Partial<SyncState>) {
    this.syncState = { ...this.syncState, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.syncState));
  }

  subscribe(listener: SyncListener) {
    this.listeners.add(listener);
    listener(this.syncState);
    return () => this.listeners.delete(listener);
  }

  private setStatus(status: SyncStatus, error: string | null = null) {
    this.updateState({
      status,
      error,
      lastSyncTime: status === 'success' ? new Date().toISOString() : this.syncState.lastSyncTime,
    });
  }

  async uploadNovels(novels: Novel[]): Promise<void> {
    if (!novels || novels.length === 0) return;

    const userId = this.userId;
    if (!userId) {
      console.warn('[SupabaseSync] 未登录，跳过上传');
      return;
    }

    this.setStatus('syncing');

    try {
      // 收集所有小说中用到的、非空的 coverId，并行上传它们
      const coverPromises = novels
        .map(novel => novel.coverId)
        .filter(Boolean) // 过滤掉空值
        .map(coverId => this.uploadCoverIfNeed(coverId as string, userId));

      // 等待所有用到的封面上传完毕
      await Promise.all(coverPromises);

      const payload = novels.map(novel => ({
        user_id: userId, // 真实 UUID
        novel_id: novel.id, // 小说 UUID
        title: novel.title,
        author: novel.author || '',
        description: novel.description || '',
        status: novel.status || '连载中',
        cover_id: novel.coverId || '',
        create_time: novel.createTime,
        update_time: novel.updateTime,
        chapters: novel.chapters as unknown as string,// JSONB 格式存整本小说
        selected_tags: novel.selectedTags,
      }));

      console.log('[SupabaseSync] uploadNovels 上传 payload，user_id:', userId, 'novels数量:', novels.length);

      const { data, error } = await this.supabase
        .from('novels')
        .upsert(payload, { onConflict: 'user_id,novel_id' });

      if (error) {
        console.error('[SupabaseSync] uploadNovels 详细错误:', JSON.stringify(error, null, 2));
        throw new Error(error.message || '上传失败');
      }

      this.setStatus('success');
    } catch (err) {
      console.error('[SupabaseSync] uploadNovels error:', err);
      this.setStatus('error', err instanceof Error ? err.message : '上传失败');
    }
  }

  async fetchNovels(): Promise<Novel[] | null> {
    const userId = this.userId;
    if (!userId) return null;

    this.setStatus('syncing');

    try {
      console.log('[SupabaseSync] fetchNovels 当前 user_id:', this.userId);
      const { data, error } = await this.supabase
        .from('novels')
        .select('*')
        .eq('user_id', userId)
        .order('update_time', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        this.setStatus('success');
        return null;
      }

      const novels: Novel[] = data.map(row => ({
        id: row.novel_id,
        title: row.title,
        author: row.author,
        description: row.description,
        status: row.status,
        coverId: row.cover_id || undefined,
        createTime: row.create_time,
        updateTime: row.update_time,
        chapters: typeof row.chapters === 'string' ? JSON.parse(row.chapters) : (row.chapters || []),
        selectedTags: row.selected_tags || [],
      }));

      this.setStatus('success');
      return novels;
    } catch (err) {
      console.error('[SupabaseSync] fetchNovels error:', err);
      this.setStatus('error', err instanceof Error ? err.message : '获取数据失败');
      return null;
    }
  }

  // 上传封面到 Supabase Storage
  async uploadCoverIfNeed(coverId: string, userId?: string): Promise<void> {
    if (!coverId) return;

    const uid = userId ?? this.userId;
    if (!uid) return; // 未登录不传封面

    try {
      // 1. 从 IndexedDB 提取实际图片文件
      const fileBlob = await getImageBlob(coverId);
      if (!fileBlob) return; // 本地没有这个图片，跳过

      // 2. 构造文件路径
      const mimeToExt = (mime: string) => {
        const map: Record<string, string> = {
          'image/jpeg': 'jpg', 'image/png': 'png',
          'image/gif': 'gif', 'image/webp': 'webp',
          'image/avif': 'avif',
        };
        return map[mime] || 'jpg';
      };
      const fileExt = mimeToExt(fileBlob.type);
      const filePath = `${uid}/${coverId}.${fileExt}`;

      // 3. 上传到 cover 存储桶
      console.log(`[SupabaseSync] Uploading cover ${coverId} to bucket 'cover'`);
      const { error } = await this.supabase.storage
        .from('cover')
        .upload(filePath, fileBlob, {
          upsert: true,
          contentType: fileBlob.type
        });

      if (error) {
        console.error('[SupabaseSync] Cover upload failed:', error.message);
      } else {
        console.log(`[SupabaseSync] Cover ${coverId} uploaded successfully.`);
      }
    } catch (err) {
      console.error('[SupabaseSync] uploadCoverIfNeed error:', err);
    }
  }

  async deleteNovel(novelId: string): Promise<void> {
    const userId = this.userId;
    if (!userId) return;

    try {
      const { error } = await this.supabase
        .from('novels')
        .delete()
        .eq('user_id', userId)
        .eq('novel_id', novelId);

      if (error) throw error;
    } catch (err) {
      console.error('[SupabaseSync] deleteNovel error:', err);
    }
  }

  debouncedSync(novels: Novel[]) {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
    this.updateState({ pendingChanges: this.syncState.pendingChanges + 1 });
    this.syncTimeout = setTimeout(() => {
      this.uploadNovels(novels);
    }, this.debounceDelay);
  }

  async init(): Promise<Novel[] | null> {
    const localList = readPersistedNovelsFromLocalStorage() as Novel[] | null;
    const localNovels = localList?.length ? localList : null;
    const hasLocal = !!localNovels?.length;

    const userId = this.userId;
    if (!userId) {
      return localNovels;
    }

    const cloudNovels = await this.fetchNovels();
    const hasCloud = cloudNovels && cloudNovels.length > 0;

    if (!hasLocal && !hasCloud) {
      return null;
    }

    if (hasLocal && !hasCloud) {
      // 新用户没有云端数据，直接返回本地，不触发 upsert（避免 RLS 冲突）
      console.log('[SupabaseSync] init: 新用户无云端数据，直接使用本地数据');
      return localNovels!;
    }

    if (!hasLocal && hasCloud) {
      return cloudNovels;
    }

    const local = localNovels!;
    const cloud = cloudNovels!;

    const merged = this.mergeNovels(local, cloud);
    await this.uploadNovels(merged);
    return merged;
  }

  private mergeNovels(local: Novel[], cloud: Novel[]): Novel[] {
    const merged = new Map<string, Novel>();

    for (const novel of local) {
      merged.set(novel.id, novel);
    }

    for (const cloudNovel of cloud) {
      const localNovel = merged.get(cloudNovel.id);
      if (!localNovel) {
        merged.set(cloudNovel.id, cloudNovel);
      } else {
        const localTime = new Date(localNovel.updateTime).getTime();
        const cloudTime = new Date(cloudNovel.updateTime).getTime();
        if (cloudTime > localTime) {
          merged.set(cloudNovel.id, cloudNovel);
        }
      }
    }

    return Array.from(merged.values());
  }

  getState(): SyncState {
    return this.syncState;
  }

  // 登出时清理资源
  destroy() {
    this.isUnsubscribing = true;
    this.listeners.clear();
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }
  }
}

export const supabaseSync = new SupabaseSyncService();
