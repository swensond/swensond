/** Minimal promise-based IndexedDB key/value store for the AniList cache.
    IndexedDB has a much larger quota than localStorage (~unbounded on most
    browsers vs ~5MB), so it can hold the per-id media records, season payloads
    and watched/calendar sets without quota errors. */

const DB_NAME = 'nexhunter';
const STORE_NAME = 'kv';
const DB_VERSION = 1;

interface KVPair {
    key: string;
    value: unknown;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'));
    });
    return dbPromise;
}

async function withStore<T>(
    mode: IDBTransactionMode,
    run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
    try {
        const db = await open();
        return await new Promise<T>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, mode);
            const req = run(tx.objectStore(STORE_NAME));
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'));
        });
    } catch {
        // IndexedDB unavailable (private mode, quota, blocked) - cache is
        // memory-only for the session.
        return null as T;
    }
}

export async function idbGet(key: string): Promise<unknown | undefined> {
    const result = await withStore<KVPair | undefined>('readonly', (s) => s.get(key));
    return result?.value;
}

export async function idbGetMany(keys: string[]): Promise<Map<string, unknown>> {
    const result = await withStore<KVPair[]>('readonly', (s) => s.getAll(keys));
    const map = new Map<string, unknown>();
    for (const pair of result ?? []) map.set(pair.key, pair.value);
    return map;
}

export async function idbSet(key: string, value: unknown): Promise<void> {
    await withStore('readwrite', (s) => s.put({ key, value } as KVPair));
}

export async function idbDelete(key: string): Promise<void> {
    await withStore('readwrite', (s) => s.delete(key));
}

export async function idbDeleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
        const db = await open();
        await new Promise<void>((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            for (const key of keys) store.delete(key);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'));
            tx.onabort = () => reject(tx.error ?? new Error('IndexedDB delete aborted'));
        });
    } catch {
        // Ignored - memory cache still covers the session.
    }
}

/** All stored keys, or only those starting with `prefix`. */
export async function idbKeys(prefix?: string): Promise<string[]> {
    const result = await withStore<IDBValidKey[]>('readonly', (s) => {
        const range = prefix ? IDBKeyRange.bound(prefix, prefix + '\uffff') : undefined;
        return s.getAllKeys(range);
    });
    return (result ?? []).map(String);
}