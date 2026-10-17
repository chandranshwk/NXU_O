/**
 * @file CalendarGrid.tsx
 * @component CalendarGrid
 * @description Month grid rendering for the calendar widget. Renders days
 * of the current month, marks days with events, and highlights today and
 * the selected day.
 *
 * @architecture
 * - Renders from the `events` prop — no internal mock pool.
 * - Event lookups use a Map keyed by date so each cell is O(1).
 * - Day cells are ~40px squares sized for the right rail.
 */

import { useMemo } from "react";
import type { MatrixEvent } from "./CalenderNode";

interface CalenderGridProps {
  darkMode: boolean;
  year: number;
  month: number;
  /** Month days as a flat array; leading `null`s pad the first week. */
  calendarCells: (number | null)[];
  /** Events visible in this calendar. Only `.date` is read for the grid. */
  events: MatrixEvent[];
  selectedDateStr: string;
  weekDays: string[];
  currentDate: Date;
  setSelectedDateStr: (date: string) => void;
  /** Optional: parent can react when a day is selected. */
  onDaySelect?: (dateStr: string, dayEvents: MatrixEvent[]) => void;
}

/** "YYYY-MM-DD" from a year, zero-indexed month, and day-of-month. */
const toDateKey = (year: number, month: number, day: number): string => {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};

export default function CalenderGrid({
  darkMode,
  year,
  month,
  calendarCells,
  events,
  selectedDateStr,
  currentDate,
  weekDays,
  setSelectedDateStr,
  onDaySelect,
}: CalenderGridProps) {
  // Group events by date once per render. Every cell then does a single
  // Map lookup instead of an array scan.
  const eventsByDate = useMemo(() => {
    const map = new Map<string, MatrixEvent[]>();
    for (const event of events) {
      const bucket = map.get(event.date);
      if (bucket) bucket.push(event);
      else map.set(event.date, [event]);
    }
    return map;
  }, [events]);

  // Precompute today's date key for fast per-cell comparison.
  const todayKey = useMemo(
    () =>
      toDateKey(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
      ),
    [currentDate],
  );

  return (
    <div className="w-full">
      {/* ── WEEKDAY HEADER ─────────────────────── */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider ${
              darkMode ? "text-zinc-500" : "text-zinc-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* ── DAY CELLS ──────────────────────────── */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const dateKey = toDateKey(year, month, day);
          const dayEvents = eventsByDate.get(dateKey) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateStr;

          // Visual precedence: selected > today > normal.
          let cellClass = darkMode
            ? "text-zinc-300 hover:bg-zinc-800"
            : "text-zinc-700 hover:bg-zinc-100";

          if (isToday && !isSelected) {
            cellClass = darkMode
              ? "bg-zinc-800 text-zinc-100 ring-1 ring-inset ring-blue-500/60"
              : "bg-zinc-100 text-zinc-900 ring-1 ring-inset ring-blue-500/60";
          }

          if (isSelected) {
            cellClass = "bg-blue-600 text-white";
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setSelectedDateStr(dateKey);
                onDaySelect?.(dateKey, dayEvents);
              }}
              className={`relative aspect-square flex items-center justify-center rounded-md text-[11px] font-medium transition-colors ${cellClass}`}
              aria-label={`${dateKey}${hasEvents ? `, ${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"}` : ""}`}
            >
              {day}

              {/* Event indicator: one dot per event, capped at 3 */}
              {hasEvents && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <span
                      key={i}
                      className={`w-0.75 h-0.75 rounded-full ${
                        isSelected ? "bg-white/80" : "bg-blue-500"
                      }`}
                    />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
