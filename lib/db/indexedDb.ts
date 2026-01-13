import { DB_NAME, DB_VERSION, STORE_NAMES } from "../constants";

let dbInstance: IDBDatabase | null = null;

// Check if IndexedDB is available (client-side only)
const isClient =
  typeof window !== "undefined" && typeof indexedDB !== "undefined";

export async function initDB(): Promise<IDBDatabase> {
  if (!isClient) {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Base schedules store
      if (!db.objectStoreNames.contains(STORE_NAMES.BASE_SCHEDULES)) {
        const scheduleStore = db.createObjectStore(STORE_NAMES.BASE_SCHEDULES, {
          keyPath: "id",
        });
        scheduleStore.createIndex("weekday", "weekday", { unique: false });
        scheduleStore.createIndex(
          "weekday_startTime",
          ["weekday", "startTime"],
          { unique: false }
        );
      }

      // Overrides store
      if (!db.objectStoreNames.contains(STORE_NAMES.OVERRIDES)) {
        const overrideStore = db.createObjectStore(STORE_NAMES.OVERRIDES, {
          keyPath: "id",
        });
        overrideStore.createIndex("date", "date", { unique: false });
        overrideStore.createIndex(
          "date_baseScheduleId",
          ["date", "baseScheduleId"],
          { unique: false }
        );
      }

      // Notes store (class-specific notes)
      if (!db.objectStoreNames.contains(STORE_NAMES.NOTES)) {
        const noteStore = db.createObjectStore(STORE_NAMES.NOTES, {
          keyPath: "id",
        });
        noteStore.createIndex("date", "date", { unique: false });
        noteStore.createIndex("classInstanceKey", "classInstanceKey", {
          unique: true,
        });
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORE_NAMES.SETTINGS)) {
        db.createObjectStore(STORE_NAMES.SETTINGS, { keyPath: "id" });
      }

      // General notes store (v2) - standalone notes not tied to classes
      if (!db.objectStoreNames.contains(STORE_NAMES.GENERAL_NOTES)) {
        const generalNoteStore = db.createObjectStore(STORE_NAMES.GENERAL_NOTES, {
          keyPath: "id",
        });
        generalNoteStore.createIndex("date", "date", { unique: false });
        generalNoteStore.createIndex("dueDate", "dueDate", { unique: false });
      }

      // Notification records store (v2) - track shown notifications
      if (!db.objectStoreNames.contains(STORE_NAMES.NOTIFICATION_RECORDS)) {
        const notificationStore = db.createObjectStore(STORE_NAMES.NOTIFICATION_RECORDS, {
          keyPath: "id",
        });
        notificationStore.createIndex("noteId", "noteId", { unique: false });
      }
    };
  });
}

export async function clearAllData(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const storeNames = [
      STORE_NAMES.BASE_SCHEDULES,
      STORE_NAMES.OVERRIDES,
      STORE_NAMES.NOTES,
      STORE_NAMES.SETTINGS,
      STORE_NAMES.GENERAL_NOTES,
      STORE_NAMES.NOTIFICATION_RECORDS,
    ];

    const tx = db.transaction(storeNames, "readwrite");

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);

    storeNames.forEach((storeName) => {
      tx.objectStore(storeName).clear();
    });
  });
}

export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
