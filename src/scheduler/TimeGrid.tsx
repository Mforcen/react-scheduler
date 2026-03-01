import React, { useRef, useEffect, useState } from "react";
import { parseISO } from "date-fns";

import type { EventItem } from "./types";
import type { Positioned } from "./utils";
import { TimeIndex } from "./TimeIndex";
import { TimeColumn } from "./TimeColumn";

type Props = {
  events: EventItem[];
  onCreate: (e: EventItem) => void;
  onMove: (id: string, deltaMinutes: number) => void;
  onResize: (id: string, deltaMinutes: number) => void;
  onEdit: (id: string) => void;
  startHour?: number;
  endHour?: number;
};

export default function TimeGrid({
  events,
  onCreate,
  onMove,
  onResize,
  onEdit,
  startHour = 6,
  endHour = 22,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(1000);
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (ref.current) setHeight(ref.current.clientHeight);
    });
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay() + i);
    return d;
  });

  const eventsByDay = days.map((d) => {
    const s = new Date(d);
    s.setHours(0, 0, 0, 0);
    const e = new Date(d);
    e.setHours(23, 59, 59, 999);
    return events.filter((ev) => {
      const st = parseISO(ev.start);
      return st >= s && st <= e;
    });
  });

  return (
    <div style={{ display: "flex" }}>
      <TimeIndex startHour={startHour} endHour={endHour} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${days.length}, 1fr)`,
        }}
        ref={ref}
      >
        {days.map((day, di) => (
          <TimeColumn
            key={di}
            events={eventsByDay[di] || []}
            day={day}
            di={di}
            startHour={startHour}
            endHour={endHour}
            onCreate={onCreate}
            onResize={onResize}
            onEdit={onEdit}
            onMove={onMove}
            height={height}
          ></TimeColumn>
        ))}
      </div>
    </div>
  );
}
