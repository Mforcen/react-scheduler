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
  create_cb: (e: EventItem) => void;
  update_cb: (e: EventItem) => void;
  delete_cb: (e: EventItem) => void;
}
declare const Scheduler: ({
  events,
  create_cb,
  update_cb,
  delete_cb,
}: SchedulerProps) => import("react").JSX.Element;
//#endregion
export { type EventItem, Scheduler };
