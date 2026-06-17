import TimeGrid from "./TimeGrid";
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
}: SchedulerProps) => {
  return (
    <div style={{ padding: 12, position: "relative" }}>
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
    </div>
  );
};
