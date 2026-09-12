import { useMemo } from "react";
import type { MatrixEvent } from "./CalenderNode";
import { mockMatrixEvents } from "../../assets/SAMPLE";

interface CalenderGridProps {
  darkMode: boolean;
  year: number;
  month: number;
  calendarCells: (number | null)[];
  events: MatrixEvent[];
  selectedDateStr: string;
  weekDays: string[];
  currentDate: Date;
  setEvents?: React.Dispatch<React.SetStateAction<MatrixEvent[]>>;
  setSelectedDateStr: (date: string) => void;
}

export default function CalenderGrid({
  darkMode,
  year,
  month,
  calendarCells,
  selectedDateStr,
  currentDate,
  weekDays,
  setEvents,
  setSelectedDateStr,
}: CalenderGridProps) {
  // 1. Unified frozen mock pool
  const stableEventsPool = useMemo(() => mockMatrixEvents(), []);

  // 2. Pure matching algorithm
  const matchDate = (dateStr: string) => {
    return stableEventsPool.filter(
      (event: MatrixEvent) => event.date === dateStr,
    );
  };

  return (
    <div className="md:col-span-2">
      <div
        className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${
          darkMode ? "text-indigo-400" : "text-sky-600"
        }`}
      >
        <div className="grid-cols-7 grid-rows-2 grid gap-2">
          {weekDays.map((day, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {day}
            </div>
          ))}
          {calendarCells.map((day, idx) => {
            if (!day) return <div key={idx} />;

            // 3. Create absolute YYYY-MM-DD compliant string strings
            const mm = (month + 1).toString().padStart(2, "0");
            const dd = day.toString().padStart(2, "0");
            const formattedDate = `${year}-${mm}-${dd}`; // e.g. "2026-09-06"

            // 4. Verify relative actual system day match
            const isToday =
              currentDate.getDate() === day &&
              currentDate.getMonth() === month &&
              currentDate.getFullYear() === year;

            return (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDateStr(formattedDate);
                  const matched = matchDate(formattedDate);
                  setEvents?.(matched);
                }}
                className={`size-5 flex items-center justify-center rounded-md text-[11px] font-bold tracking-wider uppercase p-5 cursor-pointer
                  ${
                    isToday
                      ? "bg-sky-600 text-white"
                      : selectedDateStr === formattedDate
                        ? "bg-mauve-600 text-white"
                        : "bg-zinc-200 text-black"
                  }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
