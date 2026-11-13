// Browser-local source handoff. Keys isolate signed-in owners and projects.
// Explicit private uploads remain a separate workspace action.
type StoredSource = { file: File; path: string };
export async function localTraitHandoff(userId: string, collectionId: string, files?: File[] | null): Promise<File[]> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("lockscreened-local-trait-handoff", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("sources");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Browser artwork storage is unavailable."));
  });
  try {
    const rows = await new Promise<StoredSource[]>((resolve, reject) => {
      const transaction = db.transaction("sources", files === undefined ? "readonly" : "readwrite");
      const store = transaction.objectStore("sources");
      const key = JSON.stringify([userId, collectionId]);
      const request = files === undefined ? store.get(key) : files === null ? store.delete(key) : store.put(files.map(file => ({ file, path: file.webkitRelativePath || file.name })), key);
      transaction.oncomplete = () => resolve(files === undefined ? request.result || [] : []);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Browser artwork storage was interrupted."));
    });
    return rows.map(({ file, path }) => {
      const restored = new File([file], file.name, { type: file.type, lastModified: file.lastModified });
      Object.defineProperty(restored, "webkitRelativePath", { value: path });
      return restored;
    });
  } finally { db.close(); }
}
