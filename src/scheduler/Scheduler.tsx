import TimeGrid from "./TimeGrid";
import MonthGrid from "./MonthGrid";
import type { EventItem } from "./types";
import "./timeview.css";

export interface SchedulerProps {
  events: EventItem[];
  createCb: (e: EventItem) => void;
  updateCb: (e: EventItem) => void;
  clickCb: (e: EventItem, evt: React.MouseEvent) => void;
  startDay?: number;
  nDays?: number;
  startDate?: Date;
  numDays?: number;
  startHour?: number;
  endHour?: number;
  view?: "week" | "month";
}

export const Scheduler = ({
  events,
  createCb,
  updateCb,
  clickCb,
  startDate = new Date(),
  startDay = 1,
  nDays = 7,
  startHour = 6,
  endHour = 22,
  view = "week",
}: SchedulerProps) => {
  return (
    <div style={{ padding: 12, position: "relative" }}>
      {view === "month" ? (
        <MonthGrid
          events={events}
          onCreate={createCb}
          onUpdate={updateCb}
          onClick={clickCb}
          startDay={startDay}
          startDate={startDate}
        />
      ) : (
        <TimeGrid
          events={events}
          onCreate={createCb}
          onUpdate={updateCb}
          onClick={clickCb}
          startDay={startDay}
          nDays={nDays}
          startDate={startDate}
          startHour={startHour}
          endHour={endHour}
        />
      )}
    </div>
  );
};
