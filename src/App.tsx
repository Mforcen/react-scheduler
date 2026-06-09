import { useState } from "react";
import "./index.css";

import { Scheduler } from "./scheduler/Scheduler";
import type { EventItem } from "./scheduler/types";
import { loadEvents, saveEvents } from "./storage";
import { addMinutes } from "date-fns";

export function Demo() {
  const [events, setEvents] = useState<EventItem[]>(() => {
    const loaded = loadEvents();
    if (loaded.length) return loaded;
    const base = new Date();
    base.setHours(9, 0, 0, 0);
    const e1 = {
      id: "a1",
      title: "Meeting",
      start: base,
      end: addMinutes(base, 60),
      color: "#ffb703",
    };
    const b = new Date(base);
    b.setMinutes(b.getMinutes() + 30);
    const e2 = {
      id: "b2",
      title: "Call",
      start: b,
      end: addMinutes(b, 45),
      color: "#fb5607",
    };
    return [e1, e2];
  });
  const create_cb = (e: EventItem) => {
    console.log(e);
    const newEvents = [...events, e];
    saveEvents(newEvents);
    setEvents(newEvents);
  };
  const update_cb = (updated: EventItem) => {
    console.log("updated called");
    const newEvents = events.map((curr) => {
      if (curr.id !== updated.id) return curr;
      return updated;
    });
    saveEvents(newEvents);
    setEvents(newEvents);
  };
  const delete_cb = (deleted: EventItem) => {
    setEvents(events.filter((curr: EventItem) => curr.id != deleted.id));
  };
  return (
    <div className="app">
      <Scheduler
        events={events}
        create_cb={create_cb}
        update_cb={update_cb}
        delete_cb={delete_cb}
      />
    </div>
  );
}

export default Demo;
