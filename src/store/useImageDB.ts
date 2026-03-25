import { coverStorage } from '@/lib/supabase/coverStorage';

const DB_NAME = 'NovelCoversDB';
const STORE_NAME = 'covers';
const DB_VERSION = 1;
// 打开数据库
const openDB = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);//打开（或创建）数据库
    request.onupgradeneeded = (e) => {// 首次创建时会触发，在这里建表（只执行一次）
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });//每条记录的主键必须是 id 字段
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
// 保存图片，返回 id
export const saveImage = async (file: File): Promise<string> => {
  const db = await openDB();
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ id, blob: file, name: file.name });//直接存 File 对象（它是 Blob 的子类），不需要转 Base64
    tx.oncomplete = async () => {
      db.close();
      // 同时上传到云端
      await coverStorage.uploadCover(file, id);
      resolve(id);
    };//表示整个事务成功后才关闭连接、返回 ID
    tx.onerror = () => reject(tx.error);
  });
};
// 通过 id 删除图片
export const deleteImage = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = async () => {
      db.close();
      // 同时删除云端封面
      await coverStorage.deleteCover(id);
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
};
// 通过 id 读取图片，返回 object URL（用完需 revoke）
export const getImageUrl = async (id: string): Promise<string | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);//get(id) —— 按主键查一条记录
    req.onsuccess = () => {
      db.close();
      if (req.result) {
        resolve(URL.createObjectURL(req.result.blob));// Blob 转成浏览器能直接渲染的 blob: 开头的临时 URL
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
};
// 通过 id 读取图片，返回原始 Blob（用于上传到云端）
export const getImageBlob = async (id: string): Promise<Blob | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => {
      db.close();
      if (req.result) {
        resolve(req.result.blob);
      } else {
        resolve(null);
      }
    };
    req.onerror = () => reject(req.error);
  });
};
// 获取云端封面 URL（优先返回云端 URL）
export const getCloudCoverUrl = async (id: string): Promise<string | null> => {
  const url = await coverStorage.getPublicUrl(id);
  return url;
};
// 从云端下载封面并保存到本地
export const syncCoverFromCloud = async (id: string): Promise<string | null> => {
  const result = await coverStorage.downloadCover(id);
  if (result.success && result.blob) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ id, blob: result.blob, name: `${id}.jpg` });
      tx.oncomplete = () => {
        db.close();
        resolve(URL.createObjectURL(result.blob!));
      };
      tx.onerror = () => reject(tx.error);
    });
  }
  return null;
};
// 批量同步云端封面到本地（初始化时使用）
export const syncAllCoversFromCloud = async (coverIds: string[]): Promise<void> => {
  for (const id of coverIds) {
    const db = await openDB();
    const exists = await new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(!!req.result);
      req.onerror = () => resolve(false);
    });
    db.close();

    if (!exists) {
      await syncCoverFromCloud(id);
    }
  }
};
