import { useState } from "react";
import "./index.css";

import { Scheduler } from "./scheduler/Scheduler";
import type { EventItem } from "./scheduler/types";
import { loadEvents, saveEvents } from "./storage";
import { addMinutes, addMonths, format } from "date-fns";

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
  const [startDay, setStartDay] = useState(1);
  const [nDays, setNDays] = useState(7);
  const [view, setView] = useState<"week" | "month">("week");
  const createCb = (e: EventItem) => {
    console.log("Creating event: " + e.id);
    console.log(e);
    const newEvents = [...events, e];
    saveEvents(newEvents);
    setEvents(newEvents);
  };
  const updateCb = (updated: EventItem) => {
    console.log("Updating event: " + updated.id);
    console.log(updated);
    const newEvents = events.map((curr) => {
      if (curr.id !== updated.id) return curr;
      return updated;
    });
    saveEvents(newEvents);
    setEvents(newEvents);
  };
  const clickCb = (event: EventItem, _mouseEvt: React.MouseEvent) => {
    console.log("Clicked event: " + event.id);
    setEvents(events.filter((curr: EventItem) => curr.id != event.id));
  };
  const navigate = (dir: number) => {
    const d = new Date(week);
    if (view === "month") {
      d.setMonth(d.getMonth() + dir);
    } else {
      d.setDate(d.getDate() + dir * 7);
    }
    setWeek(d);
  };
  return (
    <div className="app">
      <div style={{ display: "block", textAlign: "left" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <button
            onClick={() => setView("week")}
            style={{ fontWeight: view === "week" ? "bold" : "normal" }}
          >
            Week
          </button>
          <button
            onClick={() => setView("month")}
            style={{ fontWeight: view === "month" ? "bold" : "normal" }}
          >
            Month
          </button>
          <button onClick={() => navigate(-1)}>&lt;</button>
          <span>{view === "month" ? format(week, "MMMM yyyy") : format(week, "yyyy-MM-dd")}</span>
          <button onClick={() => navigate(1)}>&gt;</button>
          <button onClick={() => setWeek(new Date())}>Today</button>
        </div>
        <div>
          <label>
            {view === "month" ? "Month" : "Week"}:{" "}
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
        <div>
          <label>
            startDay:
            <input
              type="number"
              value={startDay.toString()}
              onChange={(e: any) => setStartDay(parseInt(e.target.value))}
            ></input>
          </label>
        </div>
        <div>
          <label>
            nDays:
            <input
              type="number"
              value={nDays.toString()}
              onChange={(e: any) => setNDays(parseInt(e.target.value))}
            ></input>
          </label>
        </div>
      </div>
      <Scheduler
        events={events}
        createCb={createCb}
        updateCb={updateCb}
        clickCb={clickCb}
        startDay={startDay}
        nDays={nDays}
        startDate={week}
        startHour={startHour}
        endHour={endHour}
        view={view}
      />
    </div>
  );
}

export default Demo;
