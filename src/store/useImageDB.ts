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
    tx.oncomplete = () => { db.close(); resolve(id); };//表示整个事务成功后才关闭连接、返回 ID
    tx.onerror = () => reject(tx.error);
  });
};
// 通过 id 删除图片
export const deleteImage = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
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