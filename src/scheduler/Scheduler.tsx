import { useEffect, useState } from "react";
import TimeGrid from "./TimeGrid";
import type { EventItem } from "./types";
import { loadEvents, saveEvents } from "./storage";
import { formatISO, parseISO, addMinutes } from "date-fns";
import "./timeview.css";

export const Scheduler = () => {
  const [events, setEvents] = useState<EventItem[]>(() => {
    const loaded = loadEvents();
    if (loaded.length) return loaded;
    const base = new Date();
    base.setHours(9, 0, 0, 0);
    const e1 = {
      id: "a1",
      title: "Meeting",
      start: formatISO(base),
      end: formatISO(addMinutes(base, 60)),
      color: "#ffb703",
    };
    const b = new Date(base);
    b.setMinutes(b.getMinutes() + 30);
    const e2 = {
      id: "b2",
      title: "Call",
      start: formatISO(b),
      end: formatISO(addMinutes(b, 45)),
      color: "#fb5607",
    };
    return [e1, e2];
  });

  useEffect(() => saveEvents(events), [events]);

  const create = (e: EventItem) => setEvents((s) => [...s, e]);
  const move = (id: string, deltaMinutes: number) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== id) return ev;
        const s = addMinutes(parseISO(ev.start), deltaMinutes);
        const e = addMinutes(parseISO(ev.end), deltaMinutes);
        return { ...ev, start: formatISO(s), end: formatISO(e) };
      }),
    );
  };
  const resize = (id: string, deltaMinutes: number) => {
    setEvents((prev) =>
      prev.map((ev) => {
        if (ev.id !== id) return ev;
        const e = addMinutes(parseISO(ev.end), deltaMinutes);
        const minEnd = addMinutes(parseISO(ev.start), 15);
        const finalEnd = e <= minEnd ? minEnd : e;
        return { ...ev, end: formatISO(finalEnd) };
      }),
    );
  };
  const edit = (id: string) => {
    const ev = events.find((x) => x.id === id);
    if (!ev) return;
    const title = prompt("Edit title", ev.title);
    if (title !== null)
      setEvents((prev) => prev.map((x) => (x.id === id ? { ...x, title } : x)));
  };

  return (
    <div style={{ padding: 12, position: "relative" }}>
      <TimeGrid
        events={events}
        onCreate={create}
        onMove={move}
        onResize={resize}
        onEdit={edit}
      />
    </div>
  );
};
