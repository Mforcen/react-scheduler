import type React from "react";
import type { EventItem } from "./types";
import { format } from "date-fns";
import { mkId } from "./utils";
import "./monthview.css";

export interface MonthCellProps {
  day: Date;
  events: EventItem[];
  isCurrentMonth: boolean;
  onCreate: (e: EventItem) => void;
  onClick: (e: EventItem, evt: React.MouseEvent) => void;
}

const MAX_VISIBLE = 3;

export const MonthCell = ({ day, events, isCurrentMonth, onCreate, onClick }: MonthCellProps) => {
  const handleCreate = (day: Date, ev: React.PointerEvent) => {
    if ((ev.target as HTMLElement).closest(".scheduler-mv-event")) return;
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(10, 0, 0, 0);
    onCreate({ id: mkId(), title: "New event", start, end, color: undefined });
  };

  const visible = events.slice(0, MAX_VISIBLE);
  const remaining = events.length - MAX_VISIBLE;

  return (
    <div
      className={`scheduler-mv-cell${isCurrentMonth ? "" : " scheduler-mv-cell-other"}`}
      onPointerDown={(ev) => handleCreate(day, ev)}
    >
      <div className="scheduler-mv-cell-day">{format(day, "d")}</div>
      <div className="scheduler-mv-cell-events">
        {visible.map((ev) => (
          <div
            key={ev.id}
            className="scheduler-mv-event"
            style={{ background: ev.color || "#3a86ff" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              onClick(ev, e);
            }}
          >
            {ev.title}
          </div>
        ))}
        {remaining > 0 && <div className="scheduler-mv-more">+{remaining} more</div>}
      </div>
    </div>
  );
};
