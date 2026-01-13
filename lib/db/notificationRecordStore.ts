import { STORE_NAMES } from "../constants";
import { initDB } from "./indexedDb";
import type { NotificationRecord } from "@/types";

// Record that a notification was shown for a note on a given date
export async function recordNotificationShown(
  noteId: string,
  notificationDate: string
): Promise<NotificationRecord> {
  const db = await initDB();
  const now = new Date().toISOString();

  const record: NotificationRecord = {
    id: `${noteId}:${notificationDate}`,
    noteId,
    notificationDate,
    shownAt: now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTIFICATION_RECORDS, "readwrite");
    const store = tx.objectStore(STORE_NAMES.NOTIFICATION_RECORDS);
    const request = store.put(record);

    request.onsuccess = () => resolve(record);
    request.onerror = () => reject(request.error);
  });
}

// Check if a notification has already been shown for a note on a given date
export async function hasNotificationBeenShown(
  noteId: string,
  notificationDate: string
): Promise<boolean> {
  const db = await initDB();
  const id = `${noteId}:${notificationDate}`;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTIFICATION_RECORDS, "readonly");
    const store = tx.objectStore(STORE_NAMES.NOTIFICATION_RECORDS);
    const request = store.get(id);

    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all notification records for a note
export async function getNotificationRecordsByNoteId(
  noteId: string
): Promise<NotificationRecord[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTIFICATION_RECORDS, "readonly");
    const store = tx.objectStore(STORE_NAMES.NOTIFICATION_RECORDS);
    const index = store.index("noteId");
    const request = index.getAll(IDBKeyRange.only(noteId));

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Clear old notification records (before a given date)
export async function clearOldNotificationRecords(beforeDate: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTIFICATION_RECORDS, "readwrite");
    const store = tx.objectStore(STORE_NAMES.NOTIFICATION_RECORDS);
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        const record = cursor.value as NotificationRecord;
        if (record.notificationDate < beforeDate) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// Delete all notification records for a specific note
export async function deleteNotificationRecordsForNote(noteId: string): Promise<void> {
  const records = await getNotificationRecordsByNoteId(noteId);
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTIFICATION_RECORDS, "readwrite");
    const store = tx.objectStore(STORE_NAMES.NOTIFICATION_RECORDS);

    let completed = 0;
    const total = records.length;

    if (total === 0) {
      resolve();
      return;
    }

    records.forEach((record) => {
      const request = store.delete(record.id);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
}
