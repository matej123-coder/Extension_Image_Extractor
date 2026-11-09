import type { Images } from "../types/types";

const DB_NAME = "ImageDB";
const DB_VERSION = 1;
const STORE_NAME = "sessions";

interface StoredSession {
  id: string;
  images: Images[];
  expiresAt: number;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImages(images: Images[]): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const session: StoredSession = {
      id: "current",
      images: images,
      expiresAt: Date.now() + 20 * 60 * 1000,
    };

    // Replace the previous session.
    store.clear();
    store.put(session);

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };

    transaction.onabort = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getImages(): Promise<Images[]> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get("current");

    request.onsuccess = () => {
      const session = request.result as StoredSession | undefined;

      if (!session || Date.now() > session.expiresAt) {
        store.clear();
        return;
      }

      const images: Images[] = session.images.map((image) => ({
        ...image,
        imageUrl: URL.createObjectURL(image.image),
      }));

      resolve(images);
    };

    request.onerror = () => reject(request.error);

    transaction.oncomplete = () => {
      db.close();
    };

    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}