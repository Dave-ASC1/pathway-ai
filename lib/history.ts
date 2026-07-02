"use client";

import { useSyncExternalStore } from "react";

export type SavedItemType = "resume" | "career" | "roadmap" | "interview";

export type SavedItem = {
  id: string;
  type: SavedItemType;
  title: string;
  createdAt: number;
  // Shape depends on type; rendered by the Saved page.
  data: unknown;
};

const KEY = "pathway-saved-results";
const EMPTY: SavedItem[] = [];

let cache: SavedItem[] | null = null;
const listeners = new Set<() => void>();

function readStorage(): SavedItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as SavedItem[]) : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStorage(items: SavedItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  cache = items;
  listeners.forEach((listener) => listener());
}

function getSnapshot(): SavedItem[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function getServerSnapshot(): SavedItem[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep in sync if another tab changes storage.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = readStorage();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** React hook: returns the current list of saved items, reactively. */
export function useSavedItems(): SavedItem[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Save a new result. Returns the created item's id. */
export function saveItem(type: SavedItemType, title: string, data: unknown): string {
  const items = readStorage();
  const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const item: SavedItem = { id, type, title, createdAt: Date.now(), data };
  writeStorage([item, ...items]);
  return id;
}

/** Delete a saved result by id. */
export function deleteItem(id: string) {
  writeStorage(readStorage().filter((item) => item.id !== id));
}
