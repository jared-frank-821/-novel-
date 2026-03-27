import { createClient } from './client';

const BUCKET_NAME = 'cover';

/** 缓存当前登录用户的真实 UUID（由外部在 auth 状态变化时注入） */
let cachedUserId: string | null = null;

export function setCoverStorageUserId(uid: string | null): void {
  cachedUserId = uid;
}

class CoverStorageService {
  private supabase = createClient();

  /** 使用缓存的用户 ID，未登录时降级为匿名 */
  private getUserId(): string {
    return cachedUserId ?? '__anonymous__';
  }

  private getStoragePath(coverId: string): string {
    const userId = this.getUserId();
    return `${userId}/${coverId}`;
  }

  async uploadCover(file: File, coverId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${coverId}.${fileExt}`;
      const filePath = this.getStoragePath(fileName);

      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('[CoverStorage] Upload error:', error);
        return { success: false, error: error.message };
      }

      const { data: urlData } = this.supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return { success: true, url: urlData.publicUrl };
    } catch (err) {
      console.error('[CoverStorage] Upload exception:', err);
      return { success: false, error: err instanceof Error ? err.message : '上传失败' };
    }
  }

  async downloadCover(coverId: string, fileName?: string): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    try {
      const fileExt = fileName?.split('.').pop() || 'jpg';
      const filePath = this.getStoragePath(`${coverId}.${fileExt}`);

      const { data, error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .download(filePath);

      if (error) {
        console.error('[CoverStorage] Download error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, blob: data };
    } catch (err) {
      console.error('[CoverStorage] Download exception:', err);
      return { success: false, error: err instanceof Error ? err.message : '下载失败' };
    }
  }

  async deleteCover(coverId: string, fileName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const fileExt = fileName?.split('.').pop() || 'jpg';
      const filePath = this.getStoragePath(`${coverId}.${fileExt}`);

      const { error } = await this.supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('[CoverStorage] Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('[CoverStorage] Delete exception:', err);
      return { success: false, error: err instanceof Error ? err.message : '删除失败' };
    }
  }

  async getPublicUrl(coverId: string, fileName?: string): Promise<string | null> {
    try {
      const fileExt = fileName?.split('.').pop() || 'jpg';
      const filePath = this.getStoragePath(`${coverId}.${fileExt}`);

      const { data } = this.supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error('[CoverStorage] Get URL error:', err);
      return null;
    }
  }
}

export const coverStorage = new CoverStorageService();
