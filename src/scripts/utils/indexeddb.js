import { openDB } from "idb";

const DB_NAME = "AppDatabase";
const DB_VERSION = 2;

const STORE_NAMES = {
  API_CACHE: "apiCache",
  USER_STORIES: "userStories",
  SAVED_STORIES: "savedStories",
  NOTIFICATIONS: "notifications",
};

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db, oldVersion, newVersion) {
    if (!db.objectStoreNames.contains(STORE_NAMES.API_CACHE)) {
      db.createObjectStore(STORE_NAMES.API_CACHE, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(STORE_NAMES.USER_STORIES)) {
      db.createObjectStore(STORE_NAMES.USER_STORIES, { autoIncrement: true });
    }
    if (!db.objectStoreNames.contains(STORE_NAMES.SAVED_STORIES)) {
      db.createObjectStore(STORE_NAMES.SAVED_STORIES, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(STORE_NAMES.NOTIFICATIONS)) {
      db.createObjectStore(STORE_NAMES.NOTIFICATIONS, { keyPath: "id" });
    }
  },
});

export const addData = async (storeName, data) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction(storeName, "readwrite");
    await tx.store.put(data);
    await tx.done;
  } catch (error) {
    console.error(`Gagal menambahkan data ke ${storeName}:`, error);
  }
};

export const getData = async (storeName, key = null) => {
  try {
    const db = await dbPromise;
    return key ? db.get(storeName, key) : db.getAll(storeName);
  } catch (error) {
    console.error(`Gagal mengambil data dari ${storeName}:`, error);
    return null;
  }
};

export const deleteData = async (storeName, key) => {
  try {
    const db = await dbPromise;
    const tx = db.transaction(storeName, "readwrite");
    await tx.store.delete(key);
    await tx.done;
  } catch (error) {
    console.error(`Gagal menghapus data dari ${storeName}:`, error);
  }
};

export { STORE_NAMES };
