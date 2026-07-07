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
  clickCb: (e: EventItem, evt: React.MouseEvent) => void;
  startDay?: number;
  nDays?: number;
  startDate?: Date;
  numDays?: number;
  startHour?: number;
  endHour?: number;
  view?: "week" | "month";
}
declare const Scheduler: ({
  events,
  createCb,
  updateCb,
  clickCb,
  startDate,
  startDay,
  nDays,
  startHour,
  endHour,
  view,
}: SchedulerProps) => import("react").JSX.Element;
//#endregion
export { type EventItem, Scheduler };
