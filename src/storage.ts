import type { EventItem } from "./scheduler/types";

const KEY = "scheduler.events.v1";
export const loadEvents = (): EventItem[] => {
  try {
    const events = JSON.parse(localStorage.getItem(KEY) || "[]");
    const parsed = events.map((e: any) => {
      return {
        ...e,
        start: new Date(e.start),
        end: new Date(e.end),
      };
    });
    return parsed;
  } catch {
    return [];
  }
};
export const saveEvents = (ev: EventItem[]) => localStorage.setItem(KEY, JSON.stringify(ev));
