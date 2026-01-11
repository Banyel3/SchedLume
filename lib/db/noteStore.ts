import { ClassNote } from "@/types";
import { STORE_NAMES } from "../constants";
import { initDB } from "./indexedDb";

export async function getNotesForDate(date: string): Promise<ClassNote[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.NOTES);
    const index = store.index("date");
    const request = index.getAll(date);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getNote(
  classInstanceKey: string
): Promise<ClassNote | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.NOTES);
    const index = store.index("classInstanceKey");
    const request = index.get(classInstanceKey);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function saveNote(note: ClassNote): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.NOTES);
    const updatedNote = { ...note, updatedAt: new Date().toISOString() };
    const request = store.put(updatedNote);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteNote(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.NOTES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllNotes(): Promise<ClassNote[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.NOTES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getDatesWithNotes(
  startDate: string,
  endDate: string
): Promise<Set<string>> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.NOTES, "readonly");
    const store = tx.objectStore(STORE_NAMES.NOTES);
    const dates = new Set<string>();
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const note = cursor.value as ClassNote;
        if (
          note.date >= startDate &&
          note.date <= endDate &&
          note.noteText.trim()
        ) {
          dates.add(note.date);
        }
        cursor.continue();
      } else {
        resolve(dates);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function hasNoteForClass(
  classInstanceKey: string
): Promise<boolean> {
  const note = await getNote(classInstanceKey);
  return note !== null && note.noteText.trim().length > 0;
}
