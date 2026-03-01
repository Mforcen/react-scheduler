import { parseISO, roundToNearestMinutes } from "date-fns";
import type { EventItem } from "./types";

export const snapTo = (date: Date, minutes: any = 15) =>
  roundToNearestMinutes(date, { nearestTo: minutes });

export const mkId = () => Math.random().toString(36).slice(2, 10);

export type Positioned = EventItem & {
  top: number;
  height: number;
  col: number;
  cols: number;
};

type EventTs = EventItem & {
  _start_ts: number;
  _end_ts: number;
};

export function layoutEvents(
  items: EventItem[],
  dayStartHour = 0,
  dayEndHour = 24,
  heightPx = 1,
): Positioned[] {
  const fullHeight = dayEndHour * 60 - dayStartHour * 60;

  const mapped = items.map((it) => ({
    ...it,
    _start_ts: parseISO(it.start).getTime(),
    _end_ts: parseISO(it.end).getTime(),
  })) as EventTs[];
  mapped.sort((a, b) => a._start_ts - b._start_ts);

  const groups: EventTs[][] = [];
  for (const ev of mapped) {
    let placed = false;
    for (const group of groups) {
      const overlap = group.some(
        (x) => x._start_ts < ev._end_ts && x._end_ts > ev._start_ts,
      );
      if (overlap) {
        group.push(ev);
        placed = true;
        break;
      }
      if (!group.some((x) => x._end_ts > ev._start_ts)) {
        group.push(ev);
        placed = true;
        break;
      }
    }
    if (!placed) {
      const group = [ev];
      groups.push(group);
    }
  }

  const result: Positioned[] = [];
  for (const group of groups) {
    const cols = [];
    for (const ev of group) {
      let placedCol = false;
      for (const col of cols) {
        if (col[col.length - 1]!._end_ts <= ev._start_ts) {
          col.push(ev);
          placedCol = true;
          break;
        }
      }
      if (!placedCol) cols.push([ev]);
    }
    for (let col_idx = 0; col_idx < cols.length; col_idx++) {
      for (const ev of cols[col_idx]!) {
        const start = new Date(ev._start_ts);
        const dayStart = new Date(start);
        dayStart.setHours(dayStartHour, 0, 0, 0);
        const top = (ev._start_ts - dayStart.getTime()) / (1000 * 60); // minutes from start
        const height = (ev._end_ts - ev._start_ts) / (1000 * 60); // minutes
        result.push({
          id: ev.id,
          title: ev.title,
          start: ev.start,
          end: ev.end,
          color: ev.color,
          top: (top / fullHeight) * heightPx,
          height: (height / fullHeight) * heightPx,
          col: col_idx,
          cols: cols.length,
        });
      }
    }
  }
  return result;
}
