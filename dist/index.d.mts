//#region src/scheduler/types.d.ts
type EventItem = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
};
//#endregion
//#region src/scheduler/Scheduler.d.ts
interface SchedulerProps {
  events: EventItem[];
  createCb: (e: EventItem) => void;
  updateCb: (e: EventItem) => void;
  deleteCb: (e: EventItem) => void;
  startDate?: Date;
  numDays?: number;
  startHour?: number;
  endHour?: number;
}
declare const Scheduler: ({
  events,
  createCb,
  updateCb,
  deleteCb,
  startDate,
  startHour,
  endHour,
}: SchedulerProps) => import("react").JSX.Element;
//#endregion
export { type EventItem, Scheduler };
