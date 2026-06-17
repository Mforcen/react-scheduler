import TimeGrid from "./TimeGrid";
import type { EventItem } from "./types";
import "./timeview.css";

export interface SchedulerProps {
  events: EventItem[];
  createCb: (e: EventItem) => void;
  updateCb: (e: EventItem) => void;
  deleteCb: (e: EventItem) => void;
  startDate?: Date;
  numDays?: number;
  startHour?: number;
  endHour?: number;
}

export const Scheduler = ({
  events,
  createCb,
  updateCb,
  deleteCb,
  startDate = new Date(),
  startHour = 6,
  endHour = 22,
}: SchedulerProps) => {
  return (
    <div style={{ padding: 12, position: "relative" }}>
      <TimeGrid
        events={events}
        onCreate={createCb}
        onUpdate={updateCb}
        onDelete={deleteCb}
        startDate={startDate}
        startHour={startHour}
        endHour={endHour}
      />
    </div>
  );
};
