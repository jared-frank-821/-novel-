'use client';

import { createClient } from './client';
import type { Novel, SyncState, SyncStatus } from './types';
import { getImageBlob } from '@/store/useImageDB';
export type SyncListener = (state: SyncState) => void;

class SupabaseSyncService {
  private supabase = createClient();
  private listeners: Set<SyncListener> = new Set();
  private userId: string;
  private syncState: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    error: null,
    pendingChanges: 0,
  };
  private syncTimeout: NodeJS.Timeout | null = null;
  private debounceDelay = 2000;

  constructor() {
    this.userId = this.getUserId();
  }

  private getUserId(): string {
    if (typeof window === 'undefined') return 'anonymous';
    let id = localStorage.getItem('sb_user_id');
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('sb_user_id', id);
    }
    return id;
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

    this.setStatus('syncing');

    try {

      // 收集所有小说中用到的、非空的 coverId，并行上传它们
      const coverPromises = novels
        .map(novel => novel.coverId)
        .filter(Boolean) // 过滤掉空值
        .map(coverId => this.uploadCoverIfNeed(coverId as string));
      
      // 等待所有用到的封面上传完毕（如果图片多，这里也可以不加 await 让它在后台慢慢传，看你需求）
      await Promise.all(coverPromises);

      const payload = novels.map(novel => ({
        user_id: this.userId, // 从 localStorage 拿/生成的匿名 ID
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

      const { error } = await this.supabase
        .from('novels')
        .upsert(payload, { onConflict: 'user_id,novel_id' });

      if (error) throw error;

      this.setStatus('success');
    } catch (err) {
      console.error('[SupabaseSync] uploadNovels error:', err);
      this.setStatus('error', err instanceof Error ? err.message : '上传失败');
    }
  }

  async fetchNovels(): Promise<Novel[] | null> {
    this.setStatus('syncing');

    try {
      const { data, error } = await this.supabase
        .from('novels')
        .select('*')
        .eq('user_id', this.userId)
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

  // 新增：上传封面到 Supabase Storage
  async uploadCoverIfNeed(coverId: string): Promise<void> {
    if (!coverId) return;

    try {
      // 1. 从 IndexedDB 提取实际图片文件
      const fileBlob = await getImageBlob(coverId);
      if (!fileBlob) return; // 如果本地没有这个图片，直接跳过

      // 2. 构造文件路径：用 用户ID/封面ID 作为路径，避免不同用户的文件冲突
      const filePath = `${this.userId}/${coverId}`;

      // 3. 上传到 cover 存储桶
      console.log(`[SupabaseSync] Uploading cover ${coverId} to bucket 'cover'`);
      const { error } = await this.supabase.storage
        .from('cover')
        .upload(filePath, fileBlob, {
          upsert: true, // 关键：如果已经存在同名文件，则覆盖更新
          contentType: fileBlob.type // 保持图片原来的格式
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
    try {
      const { error } = await this.supabase
        .from('novels')
        .delete()
        .eq('user_id', this.userId)
        .eq('novel_id', novelId);

      if (error) throw error;
    } catch (err) {
      console.error('[SupabaseSync] deleteNovel error:', err);
    }
  }

  debouncedSync(novels: Novel[]) {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);// 清除上一次的定时器
    }
    this.updateState({ pendingChanges: this.syncState.pendingChanges + 1 });
    this.syncTimeout = setTimeout(() => {
      this.uploadNovels(novels);// 2秒后才真正上传
    }, this.debounceDelay);
  }

  async init(): Promise<Novel[] | null> {
    const localData = localStorage.getItem('novelList');
    const localNovels: { state?: { novels?: Novel[] } } = localData ? JSON.parse(localData) : {};
    const hasLocal = localNovels?.state?.novels && localNovels.state.novels.length > 0;

    const cloudNovels = await this.fetchNovels();
    const hasCloud = cloudNovels && cloudNovels.length > 0;

    if (!hasLocal && !hasCloud) {
      return null;
    }

    if (hasLocal && !hasCloud) {
      await this.uploadNovels(localNovels.state!.novels!);
      return localNovels.state!.novels!;
    }

    if (!hasLocal && hasCloud) {
      return cloudNovels;
    }

    const local = localNovels.state!.novels!;
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
}

export const supabaseSync = new SupabaseSyncService();
