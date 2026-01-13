import { STORE_NAMES } from "../constants";
import { initDB } from "./indexedDb";
import type { GeneralNote } from "@/types";

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

// Save a general note (create or update)
export async function saveGeneralNote(
  note: Omit<GeneralNote, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<GeneralNote> {
  const db = await initDB();
  const now = new Date().toISOString();

  const fullNote: GeneralNote = {
    id: note.id || generateId(),
    date: note.date,
    title: note.title,
    noteText: note.noteText,
    hasDueDate: note.hasDueDate,
    dueDate: note.dueDate,
    createdAt: note.id ? (await getGeneralNote(note.id))?.createdAt || now : now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.GENERAL_NOTES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.GENERAL_NOTES);
    const request = store.put(fullNote);

    request.onsuccess = () => resolve(fullNote);
    request.onerror = () => reject(request.error);
  });
}

// Get a general note by ID
export async function getGeneralNote(id: string): Promise<GeneralNote | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.GENERAL_NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.GENERAL_NOTES);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

// Get all general notes for a specific date
export async function getGeneralNotesByDate(date: string): Promise<GeneralNote[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.GENERAL_NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.GENERAL_NOTES);
    const index = store.index("date");
    const request = index.getAll(IDBKeyRange.only(date));

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// Get all general notes with due dates in a range (for notification scheduling)
export async function getGeneralNotesWithDueDates(
  startDate: string,
  endDate: string
): Promise<GeneralNote[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.GENERAL_NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.GENERAL_NOTES);
    const index = store.index("dueDate");
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.getAll(range);

    request.onsuccess = () => {
      // Filter to only include notes with hasDueDate: true
      const notes = (request.result || []).filter(
        (note: GeneralNote) => note.hasDueDate
      );
      resolve(notes);
    };
    request.onerror = () => reject(request.error);
  });
}

// Delete a general note
export async function deleteGeneralNote(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.GENERAL_NOTES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.GENERAL_NOTES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get dates that have general notes (for calendar indicators)
export async function getDatesWithGeneralNotes(
  startDate: string,
  endDate: string
): Promise<Set<string>> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.GENERAL_NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.GENERAL_NOTES);
    const index = store.index("date");
    const range = IDBKeyRange.bound(startDate, endDate);
    const request = index.openCursor(range);

    const dates = new Set<string>();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        dates.add(cursor.value.date);
        cursor.continue();
      } else {
        resolve(dates);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// Get all general notes (for export or backup)
export async function getAllGeneralNotes(): Promise<GeneralNote[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.GENERAL_NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.GENERAL_NOTES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
