// Browser-local preview files only. Never use this store as an upload or backup.
export async function localArtworkSample(key: string, file?: File | null): Promise<File | undefined> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("lockscreened-local-artwork", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("samples");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("Local artwork storage is unavailable."));
  });
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("samples", file === undefined ? "readonly" : "readwrite");
      const store = transaction.objectStore("samples");
      const request = file === undefined ? store.get(key) : file === null ? store.delete(key) : store.put(file, key);
      transaction.oncomplete = () => resolve(file === undefined ? request.result : undefined);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error("Local artwork storage was interrupted."));
    });
  } finally {
    db.close();
  }
}
