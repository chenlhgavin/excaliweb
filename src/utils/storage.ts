import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'excaliweb';
const STORE_NAME = 'handles';
const DIR_HANDLE_KEY = 'directoryHandle';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        db.createObjectStore(STORE_NAME);
      },
    });
  }
  return dbPromise;
}

export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, handle, DIR_HANDLE_KEY);
}

export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await getDB();
    const handle = await db.get(STORE_NAME, DIR_HANDLE_KEY);
    if (handle) {
      const permission = await handle.queryPermission({ mode: 'readwrite' });
      if (permission === 'granted') {
        return handle;
      }
      const requestedPermission = await handle.requestPermission({ mode: 'readwrite' });
      if (requestedPermission === 'granted') {
        return handle;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearDirectoryHandle(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, DIR_HANDLE_KEY);
}
