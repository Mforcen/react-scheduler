import { format } from "date-fns";
import "./timeview.css";

export interface TimeColProps {
  startHour: number;
  endHour: number;
}

export const TimeIndex = ({ endHour, startHour }: TimeColProps) => {
  return (
    <div style={{ marginTop: "34px" }} className="scheduler-tv-time-col">
      {Array.from({ length: endHour - startHour }).map((_, i) => {
        const h = startHour + i;
        return (
          <div key={i} className="scheduler-tv-time-row">
            {format(new Date().setHours(h, 0, 0, 0), "HH:00")}
          </div>
        );
      })}
    </div>
  );
};
