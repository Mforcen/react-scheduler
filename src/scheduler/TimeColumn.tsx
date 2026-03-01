import type React from "react";
import { layoutEvents, mkId, snapTo, type Positioned } from "./utils";
import type { EventItem } from "./types";
import { addMinutes, format } from "date-fns";
import { useEffect, useState } from "react";
import { formatISO } from "date-fns";

export interface TimeColumnProps {
  events: EventItem[];
  day: Date;
  startHour: number;
  endHour: number;
  onCreate: any;
  onMove: (id: string, deltaMinutes: number) => void;
  onResize: (id: string, deltaMinutes: number) => void;
  onEdit: (id: string) => void;
  height: number;
  di?: number;
}

export const TimeColumn: React.FC<TimeColumnProps> = ({
  events,
  day,
  startHour,
  endHour,
  onCreate,
  onMove,
  onResize,
  onEdit,
  height,
  di,
}: TimeColumnProps) => {
  const totalMinutes = (endHour - startHour) * 60;
  const pixelsPerMinute = height / totalMinutes;
  const yToMinutes = (y: number) => {
    const mins = Math.round(y / pixelsPerMinute);
    const snapped = Math.max(
      0,
      Math.min(totalMinutes, Math.round(mins / 15) * 15),
    );
    return startHour * 60 + snapped;
  };
  const handleCreate = (day: Date, ev: React.PointerEvent, onCreate: any) => {
    const current = ev.target as HTMLElement;
    if (!current) return;
    const rect = current.getBoundingClientRect();
    const y = ev.clientY - rect.top;
    const minutes = yToMinutes(y);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(minutes, 0, 0);
    const e = addMinutes(start, 30);
    const sched_ev = {
      id: mkId(),
      title: "New event",
      start: formatISO(start),
      end: formatISO(e),
      color: undefined,
    };
    onCreate(sched_ev);
  };
  const positioned = layoutEvents(events, startHour, endHour, height);
  return (
    <div
      className="day"
      key={di}
      onPointerDown={(ev) => {
        if ((ev.target as HTMLElement).closest(".event")) return;
        handleCreate(day, ev, onCreate);
      }}
    >
      <div key={di} className="day-header">
        {format(day, "EEE dd")}
      </div>
      <div className="day-body">
        {positioned.map((p) => (
          <EventBlock
            key={p.id}
            pos={p}
            onMove={(delta) => onMove(p.id, delta / pixelsPerMinute)}
            onResize={(delta) => onResize(p.id, delta / pixelsPerMinute)}
            onEdit={() => onEdit(p.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface EventBlockProps {
  pos: Positioned;
  onMove: (deltaPx: number) => void;
  onResize: (deltaPx: number) => void;
  onEdit: () => void;
}

const EventBlock = ({ pos, onMove, onResize, onEdit }: EventBlockProps) => {
  const [topPx, setTopPx] = useState(pos.top);
  const [heightPx, setHeightPx] = useState(pos.height);
  const leftPct = (pos.col / pos.cols) * 100;
  const widthPct = 100 / pos.cols;

  useEffect(() => {
    setTopPx(pos.top);
    setHeightPx(pos.height);
  }, [pos]);

  let dragStartY = 0;

  const onPointerDown = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    dragStartY = e.clientY;
    const startTop = topPx;
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - dragStartY;
      setTopPx(dy + startTop);
    };
    const up = (ev: PointerEvent) => {
      const dy = ev.clientY - dragStartY;
      onMove(dy);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const onResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    let startY = e.clientY;
    console.log("startY", startY);
    const startHeight = heightPx;
    const move = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      setHeightPx(startHeight + dy);
    };
    const up = (ev: PointerEvent) => {
      const dy = ev.clientY - startY;
      onResize(dy);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      className="event"
      style={{
        top: topPx,
        height: Math.max(20, heightPx),
        left: `${leftPct}%`,
        width: `calc(${widthPct}% - 6px)`,
        background: pos.color || "#3a86ff",
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onEdit}
      tabIndex={0}
      role="button"
      aria-label={`${pos.title} ${pos.start} - ${pos.end}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp") onMove(-15);
        if (e.key === "ArrowDown") onMove(15);
        if (e.key === "Enter") onEdit();
        if (e.key === "PageUp") onResize(15);
        if (e.key === "PageDown") onResize(-15);
      }}
    >
      <div className="event-title">{pos.title}</div>
      <div className="resize-handle" onPointerDown={onResizePointerDown} />
    </div>
  );
};
