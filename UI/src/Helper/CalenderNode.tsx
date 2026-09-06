import { useState } from "react";
import CalenderGrid from "./CalendarGrid";
import { useOutletContext } from "react-router-dom";

export interface MatrixEvent {
  id: string;
  title: string;
  date: string;
  type: "work" | "personal" | "deadline";
}

interface CalenderNodeProps {
  initialEvents?: MatrixEvent[];
  setEvents?: React.Dispatch<React.SetStateAction<MatrixEvent[]>>;
}

export default function CalenderNode({
  initialEvents = [],
  setEvents,
}: CalenderNodeProps) {
  const [events] = useState<MatrixEvent[]>(initialEvents);
  const [currentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState("");

  const { darkMode } = useOutletContext<{ darkMode: boolean }>();
  const curMonth = currentDate.getMonth();
  const curYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(curYear, curMonth, 1).getDay();
  const totalDaysInMonth = new Date(curYear, curMonth + 1, 0).getDate();

  const paddingDays = Array(firstDayOfMonth).fill(null);
  const numbersArray = Array.from(
    { length: totalDaysInMonth },
    (_, i) => i + 1,
  );

  const daysArray = [...paddingDays, ...numbersArray];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div
      className={`p-5 w-full max-w-4xl mx-auto border rounded-xl font-sans text-sm shadow-xl transition-all duration-200 select-none ${
        darkMode
          ? "bg-[#141414] border-zinc-800/80 text-zinc-100 shadow-zinc-950/40"
          : "bg-white border-zinc-200/80 text-zinc-800 shadow-zinc-200/30"
      }`}
    >
      <div className="gap-6">
        <CalenderGrid
          darkMode={darkMode}
          currentDate={currentDate}
          year={curYear}
          month={curMonth}
          calendarCells={daysArray}
          events={events}
          selectedDateStr={selectedDateStr}
          setSelectedDateStr={setSelectedDateStr}
          setEvents={setEvents}
          weekDays={weekDays}
        />
      </div>
    </div>
  );
}
