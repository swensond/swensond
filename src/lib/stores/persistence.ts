import { writable, type Writable } from "svelte/store";

export function persisted<T>(
  key: string,
  initialValue: T,
): Writable<T> {
  const browser = typeof window !== "undefined";

  const stored = browser
    ? localStorage.getItem(key)
    : null;

  const value = stored
    ? JSON.parse(stored)
    : initialValue;

  const store = writable<T>(value);

  store.subscribe((state) => {
    if (!browser) return;

    localStorage.setItem(
      key,
      JSON.stringify(state),
    );
  });

  return store;
}