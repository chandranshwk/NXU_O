/**
 * @file CalenderNode.tsx
 * @component CalenderNode
 * @description Compact month calendar sized for the right rail.
 * Reads `darkMode` from props (not outlet context) so it renders anywhere.
 *
 * @architecture
 * - No outer card chrome — the rail's `Panel` wrapper provides it.
 * - Grid is compact enough to fit a 320px-wide rail column.
 * - Month navigation is local state (prev / next buttons in the header).
 */

import { useMemo, useState } from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import CalenderGrid from "./CalendarGrid";

export interface Assignee {
  id: string;
  name: string;
  avatar: string;
}

export interface MatrixEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "work" | "personal" | "deadline";
  priority: "low" | "medium" | "high";
  status: "pending" | "completed" | "in-progress" | "cancelled";
  isAllDay: boolean;
  color: string;
  assignee: Assignee;
}

interface CalenderNodeProps {
  events: MatrixEvent[];
  darkMode: boolean;
  /** Optional: fires when a day is clicked, with that day's events. */
  onDaySelect?: (dateStr: string, dayEvents: MatrixEvent[]) => void;
}

const WEEK_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function CalenderNode({
  events,
  darkMode,
  onDaySelect,
}: CalenderNodeProps) {
  // Tracked as {year, month} so navigation across year boundaries is trivial.
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState("");

  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const paddingDays = Array(firstDayOfMonth).fill(null);
  const numbersArray = Array.from(
    { length: totalDaysInMonth },
    (_, i) => i + 1,
  );
  const daysArray = [...paddingDays, ...numbersArray];

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isCurrentMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <div
      className={`w-full p-2 text-[11px] font-sans select-none ${
        darkMode ? "text-zinc-200" : "text-zinc-700"
      }`}
    >
      {/* ── MONTH HEADER: prev / label / next ───────── */}
      <div className="flex items-center justify-between mb-2 px-1">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="Previous month"
          className={`p-1 rounded transition-colors ${
            darkMode
              ? "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
              : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <LuChevronLeft size={14} />
        </button>

        <div className="flex items-baseline gap-1">
          <span
            className={`text-[11px] font-semibold tracking-tight ${
              darkMode ? "text-zinc-300" : "text-zinc-700"
            }`}
          >
            {MONTH_LABELS[viewMonth]}
          </span>
          <span
            className={`text-[10px] font-mono ${
              darkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {viewYear}
          </span>
        </div>

        <button
          type="button"
          onClick={goNextMonth}
          aria-label="Next month"
          className={`p-1 rounded transition-colors ${
            darkMode
              ? "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
              : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          <LuChevronRight size={14} />
        </button>
      </div>

      <CalenderGrid
        darkMode={darkMode}
        currentDate={today}
        year={viewYear}
        month={viewMonth}
        calendarCells={daysArray}
        events={events}
        selectedDateStr={selectedDateStr}
        setSelectedDateStr={setSelectedDateStr}
        weekDays={WEEK_DAYS}
        onDaySelect={onDaySelect}
      />

      {/* ── "JUMP TO TODAY" — only shown when viewing another month ── */}
      {!isCurrentMonth && (
        <button
          type="button"
          onClick={() => {
            setViewYear(today.getFullYear());
            setViewMonth(today.getMonth());
          }}
          className={`mt-2 w-full text-[10px] font-medium py-1 rounded transition-colors ${
            darkMode
              ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
              : "text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
          }`}
        >
          Jump to today
        </button>
      )}
    </div>
  );
}
