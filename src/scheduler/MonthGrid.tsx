import type { EventItem } from "./types";
import { MonthCell } from "./MonthCell";
import "./monthview.css";

type Props = {
  events: EventItem[];
  onCreate: (e: EventItem) => void;
  onUpdate: (e: EventItem) => void;
  onClick: (e: EventItem, evt: React.MouseEvent) => void;
  startDay: number;
  startDate: Date;
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthGrid({
  events,
  onCreate,
  onUpdate: _,
  onClick,
  startDay,
  startDate,
}: Props) {
  const firstOfMonth = new Date(startDate);
  firstOfMonth.setDate(1);
  firstOfMonth.setHours(0, 0, 0, 0);

  const start = new Date(firstOfMonth);
  const offset = (start.getDay() - startDay + 7) % 7;
  start.setDate(start.getDate() - offset);

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });

  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w++) {
    weeks.push(days.slice(w * 7, (w + 1) * 7));
  }

  const dayNames = [...DAY_NAMES.slice(startDay), ...DAY_NAMES.slice(0, startDay)];

  const eventsByDay = days.map((d) => {
    const colStart = new Date(d);
    colStart.setHours(0, 0, 0, 0);
    const colEnd = new Date(d);
    colEnd.setHours(23, 59, 59, 999);
    return events.filter((ev) => ev.start <= colEnd && ev.end >= colStart);
  });

  const monthNum = startDate.getMonth();

  return (
    <div className="scheduler-mv">
      <div className="scheduler-mv-header">
        {dayNames.map((name) => (
          <div key={name} className="scheduler-mv-header-cell">
            {name}
          </div>
        ))}
      </div>
      <div className="scheduler-mv-body">
        {weeks.map((week, wi) => (
          <div key={wi} className="scheduler-mv-week">
            {week.map((day, di) => {
              const idx = wi * 7 + di;
              return (
                <MonthCell
                  key={idx}
                  day={day}
                  events={eventsByDay[idx] || []}
                  isCurrentMonth={day.getMonth() === monthNum}
                  onCreate={onCreate}
                  onClick={onClick}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
