import { useState } from "react";
import "./index.css";

import { Scheduler } from "./scheduler/Scheduler";
import type { EventItem } from "./scheduler/types";
import { loadEvents, saveEvents } from "./storage";
import { addMinutes, format } from "date-fns";

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
  const [week, setWeek] = useState(new Date());
  const [startHour, setStartHour] = useState(6);
  const [endHour, setEndHour] = useState(22);
  const createCb = (e: EventItem) => {
    console.log(e);
    const newEvents = [...events, e];
    saveEvents(newEvents);
    setEvents(newEvents);
  };
  const updateCb = (updated: EventItem) => {
    console.log("updated called");
    const newEvents = events.map((curr) => {
      if (curr.id !== updated.id) return curr;
      return updated;
    });
    saveEvents(newEvents);
    setEvents(newEvents);
  };
  const deleteCb = (deleted: EventItem) => {
    setEvents(events.filter((curr: EventItem) => curr.id != deleted.id));
  };
  return (
    <div className="app">
      <div style={{ display: "block", textAlign: "left" }}>
        <div>
          <label>
            Week:{" "}
            <input
              type="date"
              value={format(week, "yyyy-MM-dd")}
              onChange={(e: any) => {
                setWeek(new Date(e.target.value));
              }}
            ></input>
          </label>
        </div>
        <div>
          <label>
            start time:
            <input
              type="number"
              value={startHour.toString()}
              onChange={(e: any) => setStartHour(parseInt(e.target.value))}
            ></input>
          </label>
        </div>
        <div>
          <label>
            end time:
            <input
              type="number"
              value={endHour.toString()}
              onChange={(e: any) => setEndHour(parseInt(e.target.value))}
            ></input>
          </label>
        </div>
      </div>
      <Scheduler
        events={events}
        createCb={createCb}
        updateCb={updateCb}
        deleteCb={deleteCb}
        startDate={week}
        startHour={startHour}
        endHour={endHour}
      />
    </div>
  );
}

export default Demo;
