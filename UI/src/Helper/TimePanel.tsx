import type { MatrixEvent } from "./CalenderNode";

interface TimelinePanelProps {
  darkMode: boolean;
  events: MatrixEvent[];
  newEventTitle: string;
  setNewEventTitle: (title: string) => void;
  selectedDateStr: string;
  setSelectedDateStr: (date: string) => void;
  onAddEvent: (e: React.FormEvent) => void;
  setEvents: React.Dispatch<React.SetStateAction<MatrixEvent[]>>;
}

export default function TimelinePanel({
  darkMode,
  events,
  newEventTitle,
  setNewEventTitle,
  selectedDateStr,
  setSelectedDateStr,
  onAddEvent,
  setEvents,
}: TimelinePanelProps) {
  return (
    <div
      className={`p-4 rounded-xl border flex flex-col justify-between ${darkMode ? "bg-zinc-900/30 border-zinc-800/80" : "bg-zinc-50/50 border-zinc-200/60"}`}
    >
      <div className="flex flex-col h-full justify-between gap-4">
        <div>
          <div
            className={`text-[11px] font-bold uppercase tracking-wider mb-4 ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}
          >
            Timeline Track
          </div>

          <form onSubmit={onAddEvent} className="mb-4 space-y-2.5">
            <input
              type="text"
              placeholder="New Event Title..."
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              className={`w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none transition-all ${
                darkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-700 placeholder-zinc-600"
                  : "bg-white border-zinc-200 text-zinc-800 focus:border-zinc-300 placeholder-zinc-400"
              }`}
            />
            <input
              type="date"
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className={`w-full px-2.5 py-1.5 border rounded-lg text-xs outline-none transition-all ${
                darkMode
                  ? "bg-zinc-900 border-zinc-800 text-zinc-100 focus:border-zinc-700"
                  : "bg-white border-zinc-200 text-zinc-800 focus:border-zinc-300"
              }`}
            />
            <button
              type="submit"
              className={`w-full py-1.5 font-semibold rounded-lg text-xs transition-all active:scale-95 ${
                darkMode
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-100"
              }`}
            >
              Append Node
            </button>
          </form>
        </div>

        <div className="space-y-2 max-h-45 overflow-y-auto pr-1 dynamic-scrollbar">
          {events.length === 0 ? (
            <div
              className={`text-xs italic text-center py-6 ${darkMode ? "text-zinc-600" : "text-zinc-400"}`}
            >
              No logged events.
            </div>
          ) : (
            [...events]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((event) => (
                <div
                  key={event.id}
                  className={`p-2.5 rounded-lg border flex justify-between items-center transition-all ${
                    darkMode
                      ? "bg-zinc-900/60 border-zinc-800/60 hover:border-zinc-700"
                      : "bg-white border-zinc-200/60 hover:border-zinc-300 shadow-xs"
                  }`}
                >
                  <div className="truncate pr-2">
                    <div
                      className={`font-medium truncate ${darkMode ? "text-zinc-200" : "text-zinc-700"}`}
                    >
                      {event.title}
                    </div>
                    <div
                      className={`text-[10px] mt-0.5 tracking-wide ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
                    >
                      {event.date}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEvents(events.filter((e) => e.id !== event.id))
                    }
                    className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                      darkMode
                        ? "text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50"
                        : "text-zinc-400 hover:text-red-600 hover:bg-zinc-100"
                    }`}
                  >
                    Remove
                  </button>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
