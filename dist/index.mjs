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
  onClick,
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
                onClick: (e) => {
                  onClick(p, e);
                },
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
const EventBlock = ({ pos, onMove, onResize, onClick }) => {
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
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStartY = e.clientY;
    const startTop = topPx;
    const move = (ev) => {
      setTopPx(ev.clientY - dragStartY + startTop);
    };
    const up = (ev) => {
      const dy = ev.clientY - dragStartY;
      if (Math.abs(dy) < 5) onMove(dy);
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
    onDoubleClick: onClick,
    tabIndex: 0,
    role: "button",
    onKeyDown: (e) => {
      if (e.key === "ArrowUp") onMove(-15);
      if (e.key === "ArrowDown") onMove(15);
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
function TimeGrid({
  events,
  onCreate,
  onUpdate,
  onClick,
  startDay,
  nDays,
  startDate,
  startHour,
  endHour,
}) {
  const ref = useRef(null);
  const [height, setHeight] = useState(1e3);
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
              onClick,
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
//#region src/scheduler/MonthCell.tsx
const MAX_VISIBLE = 3;
const MonthCell = ({ day, events, isCurrentMonth, onCreate, onClick }) => {
  const handleCreate = (day, ev) => {
    if (ev.target.closest(".scheduler-mv-event")) return;
    const start = new Date(day);
    start.setHours(9, 0, 0, 0);
    const end = new Date(day);
    end.setHours(10, 0, 0, 0);
    onCreate({
      id: mkId(),
      title: "New event",
      start,
      end,
      color: void 0,
    });
  };
  const visible = events.slice(0, MAX_VISIBLE);
  const remaining = events.length - MAX_VISIBLE;
  return /* @__PURE__ */ jsxs("div", {
    className: `scheduler-mv-cell${isCurrentMonth ? "" : " scheduler-mv-cell-other"}`,
    onPointerDown: (ev) => handleCreate(day, ev),
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "scheduler-mv-cell-day",
        children: format(day, "d"),
      }),
      /* @__PURE__ */ jsxs("div", {
        className: "scheduler-mv-cell-events",
        children: [
          visible.map((ev) =>
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "scheduler-mv-event",
                style: { background: ev.color || "#3a86ff" },
                onPointerDown: (e) => {
                  e.stopPropagation();
                  onClick(ev, e);
                },
                children: ev.title,
              },
              ev.id,
            ),
          ),
          remaining > 0 &&
            /* @__PURE__ */ jsxs("div", {
              className: "scheduler-mv-more",
              children: ["+", remaining, " more"],
            }),
        ],
      }),
    ],
  });
};
//#endregion
//#region src/scheduler/MonthGrid.tsx
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function MonthGrid({ events, onCreate, onUpdate: _, onClick, startDay, startDate }) {
  const firstOfMonth = new Date(startDate);
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);
  const start = new Date(firstOfMonth);
  const offset = (start.getDay() - startDay + 7) % 7;
  start.setDate(start.getDate() - offset);
  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const weeks = [];
  for (let w = 0; w < 6; w++) weeks.push(days.slice(w * 7, (w + 1) * 7));
  const dayNames = [...DAY_NAMES.slice(startDay), ...DAY_NAMES.slice(0, startDay)];
  const eventsByDay = days.map((d) => {
    const colStart = new Date(d);
    colStart.setHours(0, 0, 0, 0);
    const colEnd = new Date(d);
    colEnd.setHours(23, 59, 59, 999);
    return events.filter((ev) => ev.start <= colEnd && ev.end >= colStart);
  });
  const monthNum = startDate.getMonth();
  return /* @__PURE__ */ jsxs("div", {
    className: "scheduler-mv",
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "scheduler-mv-header",
        children: dayNames.map((name) =>
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "scheduler-mv-header-cell",
              children: name,
            },
            name,
          ),
        ),
      }),
      /* @__PURE__ */ jsx("div", {
        className: "scheduler-mv-body",
        children: weeks.map((week, wi) =>
          /* @__PURE__ */ jsx(
            "div",
            {
              className: "scheduler-mv-week",
              children: week.map((day, di) => {
                const idx = wi * 7 + di;
                return /* @__PURE__ */ jsx(
                  MonthCell,
                  {
                    day,
                    events: eventsByDay[idx] || [],
                    isCurrentMonth: day.getMonth() === monthNum,
                    onCreate,
                    onClick,
                  },
                  idx,
                );
              }),
            },
            wi,
          ),
        ),
      }),
    ],
  });
}
//#endregion
//#region src/scheduler/Scheduler.tsx
const Scheduler = ({
  events,
  createCb,
  updateCb,
  clickCb,
  startDate = /* @__PURE__ */ new Date(),
  startDay = 1,
  nDays = 7,
  startHour = 6,
  endHour = 22,
  view = "week",
}) => {
  return /* @__PURE__ */ jsx("div", {
    style: {
      padding: 12,
      position: "relative",
    },
    children:
      view === "month"
        ? /* @__PURE__ */ jsx(MonthGrid, {
            events,
            onCreate: createCb,
            onUpdate: updateCb,
            onClick: clickCb,
            startDay,
            startDate,
          })
        : /* @__PURE__ */ jsx(TimeGrid, {
            events,
            onCreate: createCb,
            onUpdate: updateCb,
            onClick: clickCb,
            startDay,
            nDays,
            startDate,
            startHour,
            endHour,
          }),
  });
};
//#endregion
export { Scheduler };
