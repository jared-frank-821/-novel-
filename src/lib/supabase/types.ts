export interface Novel {
  id: string;
  title: string;
  author?: string;
  description?: string;
  status?: string;
  coverId?: string;
  createTime: string;
  updateTime: string;
  chapters: Chapter[];
  selectedTags: string[];
}

export interface Chapter {
  id: string;
  index: number;
  title: string;
  text: string;
  updateTime: string;
  createTime: string;
  status: string;
  wordCount: number;
}

export interface TrashChapter {
  id: string;
  title: string;
  text: string;
  updateTime: string;
  createTime: string;
  status: string;
  wordCount: number;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: string | null;
  error: string | null;
  pendingChanges: number;
}
