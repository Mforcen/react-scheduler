import { useEffect, useRef, useState } from "react";
import { addMinutes, format } from "date-fns";
import { jsx, jsxs } from "react/jsx-runtime";
//#region src/scheduler/TimeIndex.tsx
const TimeIndex = ({ endHour, startHour }) => {
  return /* @__PURE__ */ jsx("div", {
    style: { marginTop: "34px" },
    className: "scheduler-tv-time-col",
    children: Array.from({ length: endHour - startHour }).map((_, i) => {
      const h = startHour + i;
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "scheduler-tv-time-row",
          children: format(/* @__PURE__ */ new Date().setHours(h, 0, 0, 0), "HH:00"),
        },
        i,
      );
    }),
  });
};
//#endregion
//#region src/scheduler/utils.ts
const mkId = () => Math.random().toString(36).slice(2, 10);
function layoutEvents(items, dayStartHour = 0, dayEndHour = 24, heightPx = 1) {
  const fullHeight = dayEndHour * 60 - dayStartHour * 60;
  const mapped = items.map((it) => ({
    ...it,
    _start_ts: it.start.getTime(),
    _end_ts: it.end.getTime(),
  }));
  mapped.sort((a, b) => a._start_ts - b._start_ts);
  const groups = [];
  for (const ev of mapped) {
    let placed = false;
    for (const group of groups) {
      if (group.some((x) => x._start_ts < ev._end_ts && x._end_ts > ev._start_ts)) {
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
  const result = [];
  for (const group of groups) {
    const cols = [];
    for (const ev of group) {
      let placedCol = false;
      for (const col of cols)
        if (col[col.length - 1]._end_ts <= ev._start_ts) {
          col.push(ev);
          placedCol = true;
          break;
        }
      if (!placedCol) cols.push([ev]);
    }
    for (let col_idx = 0; col_idx < cols.length; col_idx++)
      for (const ev of cols[col_idx]) {
        const start = new Date(ev._start_ts);
        const dayStart = new Date(start);
        dayStart.setHours(dayStartHour, 0, 0, 0);
        const top = (ev._start_ts - dayStart.getTime()) / (1e3 * 60);
        const height = (ev._end_ts - ev._start_ts) / (1e3 * 60);
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
  return result;
}
//#endregion
//#region src/scheduler/TimeColumn.tsx
const TimeColumn = ({
  events,
  day,
  startHour,
  endHour,
  onCreate,
  onUpdate,
  onDelete,
  height,
  di,
}) => {
  const totalMinutes = (endHour - startHour) * 60;
  const pixelsPerMinute = height / totalMinutes;
  const yToMinutes = (y) => {
    const mins = Math.round(y / pixelsPerMinute);
    const snapped = Math.max(0, Math.min(totalMinutes, Math.round(mins / 15) * 15));
    return startHour * 60 + snapped;
  };
  const handleCreate = (day, ev, onCreate) => {
    const current = ev.target;
    if (!current) return;
    const rect = current.getBoundingClientRect();
    const minutes = yToMinutes(ev.clientY - rect.top);
    const start = new Date(day);
    start.setHours(0, 0, 0, 0);
    start.setMinutes(minutes, 0, 0);
    const e = addMinutes(start, 30);
    onCreate({
      id: mkId(),
      title: "New event",
      start,
      end: e,
      color: void 0,
    });
  };
  const positioned = layoutEvents(events, startHour, endHour, height);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "scheduler-tv-day",
      onPointerDown: (ev) => {
        if (ev.target.closest(".event")) return;
        handleCreate(day, ev, onCreate);
      },
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "scheduler-tv-day-header",
            children: format(day, "EEE dd"),
          },
          di,
        ),
        /* @__PURE__ */ jsx("div", {
          className: "scheduler-tv-day-body",
          children: positioned.map((p) =>
            /* @__PURE__ */ jsx(
              EventBlock,
              {
                pos: p,
                onMove: (delta) => {
                  p.start = addMinutes(p.start, delta / pixelsPerMinute);
                  p.end = addMinutes(p.end, delta / pixelsPerMinute);
                  onUpdate(p);
                },
                onResize: (delta) => {
                  p.end = addMinutes(p.end, delta / pixelsPerMinute);
                  onUpdate(p);
                },
                onEdit: () => null,
              },
              p.id,
            ),
          ),
        }),
      ],
    },
    di,
  );
};
const EventBlock = ({ pos, onMove, onResize, onEdit }) => {
  const [topPx, setTopPx] = useState(pos.top);
  const [heightPx, setHeightPx] = useState(pos.height);
  const leftPct = (pos.col / pos.cols) * 100;
  const widthPct = 100 / pos.cols;
  useEffect(() => {
    setTopPx(pos.top);
    setHeightPx(pos.height);
  }, [pos]);
  let dragStartY = 0;
  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY = e.clientY;
    const startTop = topPx;
    const move = (ev) => {
      setTopPx(ev.clientY - dragStartY + startTop);
    };
    const up = (ev) => {
      onMove(ev.clientY - dragStartY);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  const onResizePointerDown = (e) => {
    e.stopPropagation();
    let startY = e.clientY;
    console.log("startY", startY);
    const startHeight = heightPx;
    const move = (ev) => {
      setHeightPx(startHeight + (ev.clientY - startY));
    };
    const up = (ev) => {
      onResize(ev.clientY - startY);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "scheduler-tv-event",
    style: {
      top: topPx,
      height: Math.max(20, heightPx),
      left: `${leftPct}%`,
      width: `calc(${widthPct}% - 6px)`,
      background: pos.color || "#3a86ff",
    },
    onPointerDown,
    onDoubleClick: onEdit,
    tabIndex: 0,
    role: "button",
    "aria-label": `${pos.title} ${pos.start} - ${pos.end}`,
    onKeyDown: (e) => {
      if (e.key === "ArrowUp") onMove(-15);
      if (e.key === "ArrowDown") onMove(15);
      if (e.key === "Enter") onEdit();
      if (e.key === "PageUp") onResize(15);
      if (e.key === "PageDown") onResize(-15);
    },
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "scheduler-tv-event-title",
        children: pos.title,
      }),
      /* @__PURE__ */ jsx("div", {
        className: "scheduler-tv-resize-handle",
        onPointerDown: onResizePointerDown,
      }),
    ],
  });
};
//#endregion
//#region src/scheduler/TimeGrid.tsx
function TimeGrid({ events, onCreate, onUpdate, onDelete, startHour = 6, endHour = 22 }) {
  const ref = useRef(null);
  const [height, setHeight] = useState(1e3);
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (ref.current) setHeight(ref.current.clientHeight);
    });
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = /* @__PURE__ */ new Date(/* @__PURE__ */ new Date());
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
  return /* @__PURE__ */ jsxs("div", {
    style: { display: "flex" },
    children: [
      /* @__PURE__ */ jsx(TimeIndex, {
        startHour,
        endHour,
      }),
      /* @__PURE__ */ jsx("div", {
        style: {
          display: "grid",
          gridTemplateColumns: `repeat(${days.length}, 1fr)`,
        },
        ref,
        children: days.map((day, di) =>
          /* @__PURE__ */ jsx(
            TimeColumn,
            {
              events: eventsByDay[di] || [],
              day,
              di,
              startHour,
              endHour,
              onCreate,
              onUpdate,
              onDelete,
              height,
            },
            di,
          ),
        ),
      }),
    ],
  });
}
//#endregion
//#region src/scheduler/Scheduler.tsx
const Scheduler = ({ events, create_cb, update_cb, delete_cb }) => {
  return /* @__PURE__ */ jsx("div", {
    style: {
      padding: 12,
      position: "relative",
    },
    children: /* @__PURE__ */ jsx(TimeGrid, {
      events,
      onCreate: create_cb,
      onUpdate: update_cb,
      onDelete: delete_cb,
    }),
  });
};
//#endregion
export { Scheduler };
