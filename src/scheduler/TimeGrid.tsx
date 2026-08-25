import { useRef, useEffect, useState } from "react";

import type { EventItem } from "./types";
import { TimeIndex } from "./TimeIndex";
import { TimeColumn } from "./TimeColumn";

import "./timeview.css";

type Props = {
  events: EventItem[];
  onCreate: (e: EventItem) => void;
  onUpdate: (e: EventItem) => void;
  onClick: (e: EventItem, evt: React.MouseEvent) => void;
  startDay: number;
  nDays: number;
  startDate: Date;
  startHour: number;
  endHour: number;
};

export default function TimeGrid({
  events,
  onCreate,
  onUpdate,
  onClick,
  startDay,
  nDays,
  startDate,
  startHour,
  endHour,
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

  const days = Array.from({ length: nDays }).map((_, i) => {
    const d = new Date(startDate);
    d.setHours(0, 0, 0, 0);
    const offset = (d.getDay() - startDay + 7) % 7;
    d.setDate(d.getDate() - offset + i);
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
    <div style={{ display: "flex", flex: 1 }}>
      <TimeIndex startHour={startHour} endHour={endHour} />
      <div
        className="scheduler-tv-grid"
        style={{
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
            onClick={onClick}
            height={height}
          ></TimeColumn>
        ))}
      </div>
    </div>
  );
}
