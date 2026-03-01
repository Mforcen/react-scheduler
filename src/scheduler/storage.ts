import type { EventItem } from "./types";

const KEY = "scheduler.events.v1";
export const loadEvents = (): EventItem[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
};
export const saveEvents = (ev: EventItem[]) =>
  localStorage.setItem(KEY, JSON.stringify(ev));
