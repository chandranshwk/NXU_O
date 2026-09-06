import { mockMatrixEvents } from "../assets/SAMPLE";
import type { MatrixEvent } from "./CalenderNode";

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
  const matchDate = (dateStr: string) => {
    console.log(dateStr);
    const events = mockMatrixEvents;
    const eventsOnDate = events.filter((event) => event.date === dateStr);
    return eventsOnDate.length > 0 ? eventsOnDate : [];
  };

  return (
    <div className="md:col-span-2">
      <div
        className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${darkMode ? "text-indigo-400" : "text-sky-600"}`}
      >
        <div className=" grid-cols-7 grid-rows-2 grid gap-2 ">
          {weekDays.map((day, idx) => (
            <div key={idx} className="flex items-center justify-center">
              {day}
            </div>
          ))}
          {calendarCells.map((day, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (day) {
                  const formattedDate = `${year}-${month + 1}-${day}`;
                  setSelectedDateStr(formattedDate);
                  console.log(matchDate(formattedDate));
                  setEvents?.(matchDate(formattedDate));
                }
              }}
              className={`size-5 flex items-center justify-center rounded-md text-[11px] font-bold tracking-wider uppercase p-5
                ${currentDate.getDay() - 1 === day ? "bg-sky-600 text-white" : selectedDateStr === `${year}-${month + 1}-${day}` ? "bg-mauve-600 text-white" : day ? "bg-zinc-200 text-black " : ""} `}
            >
              {day}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
