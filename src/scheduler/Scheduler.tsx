import TimeGrid from "./TimeGrid";
import type { EventItem } from "./types";
import "./timeview.css";

export interface SchedulerProps {
  events: EventItem[];
  create_cb: (e: EventItem) => void;
  update_cb: (e: EventItem) => void;
  delete_cb: (e: EventItem) => void;
}

export const Scheduler = ({ events, create_cb, update_cb, delete_cb }: SchedulerProps) => {
  return (
    <div style={{ padding: 12, position: "relative" }}>
      <TimeGrid events={events} onCreate={create_cb} onUpdate={update_cb} onDelete={delete_cb} />
    </div>
  );
};
