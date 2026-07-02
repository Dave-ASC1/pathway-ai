"use client";

import { useCallback, useSyncExternalStore } from "react";

// Session-scoped state shared across page navigations within the same tab.
// Backed by sessionStorage so it survives client-side navigation and full
// reloads, but clears when the tab closes. Nothing is sent to a server.

const listeners = new Map<string, Set<() => void>>();
const cache = new Map<string, unknown>();

function readValue<T>(key: string, initial: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  if (typeof window === "undefined") return initial;
  try {
    const raw = window.sessionStorage.getItem(key);
    const value = raw != null ? (JSON.parse(raw) as T) : initial;
    cache.set(key, value);
    return value;
  } catch {
    return initial;
  }
}

/** Read a session value once (non-reactive). Returns initial on the server. */
export function readSession<T>(key: string, initial: T): T {
  return readValue(key, initial);
}

/** Write a session value and notify any subscribed components. */
export function writeSession<T>(key: string, value: T) {
  cache.set(key, value);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore quota or serialization errors.
    }
  }
  listeners.get(key)?.forEach((listener) => listener());
}

/**
 * Like useState, but persisted to sessionStorage under `key`.
 * `initial` must be a stable reference (a primitive or module-level constant)
 * so server and hydration snapshots match.
 */
export function useSessionState<T>(key: string, initial: T): [T, (value: T) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(onChange);
      return () => {
        set.delete(onChange);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => readValue(key, initial), [key, initial]);
  const getServerSnapshot = useCallback(() => initial, [initial]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setValue = useCallback((next: T) => writeSession(key, next), [key]);

  return [value, setValue];
}
