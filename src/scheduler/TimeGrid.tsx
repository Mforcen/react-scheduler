import { useRef, useEffect, useState } from "react";

import type { EventItem } from "./types";
import { TimeIndex } from "./TimeIndex";
import { TimeColumn } from "./TimeColumn";

import "./timeview.css";

type Props = {
  events: EventItem[];
  onCreate: (e: EventItem) => void;
  onUpdate: (e: EventItem) => void;
  onDelete: (e: EventItem) => void;
  startHour?: number;
  endHour?: number;
};

export default function TimeGrid({
  events,
  onCreate,
  onUpdate,
  onDelete,
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
    const col_start = new Date(d);
    col_start.setHours(0, 0, 0, 0);
    const col_end = new Date(d);
    col_end.setHours(23, 59, 59, 999);
    return events.filter((ev) => {
      const st = ev.start;
      return st >= col_start && st <= col_end;
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
            onUpdate={onUpdate}
            onDelete={onDelete}
            height={height}
          ></TimeColumn>
        ))}
      </div>
    </div>
  );
}
