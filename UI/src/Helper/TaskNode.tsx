import React from "react";
import type { MatrixEvent } from "./CalenderNode";
import { useSettings } from "../contexts/settingsContext";
import { LuChevronDown, LuChevronsUp, LuChevronUp } from "react-icons/lu";

interface TaskNodeProps {
  events: MatrixEvent[];
}

interface TaskItemProps extends MatrixEvent {
  darkMode: boolean;
}

const Tasks: React.FC<TaskItemProps> = ({
  title,
  type,
  darkMode,
  priority,
  status,
  isAllDay,
  description,
}) => {
  const statusText =
    status === "cancelled"
      ? "Cancelled"
      : status === "completed"
        ? "Completed"
        : status === "in-progress"
          ? "In-Progress"
          : "Pending";

  return (
    <tr
      className={`border-b ${darkMode ? "border-zinc-800 text-zinc-200" : "border-zinc-200 text-zinc-800"}`}
    >
      <td className="p-3 flex flex-col">
        <span>{title}</span>
        <span className="truncate max-w-34.5 text-zinc-700 text-xs">
          {description}
        </span>
      </td>
      <td className="p-3 capitalize">{type}</td>
      <td className="p-3">
        {priority === "high" ? (
          <LuChevronsUp className="text-rose-500" />
        ) : priority === "medium" ? (
          <LuChevronUp className="text-amber-500" />
        ) : (
          <LuChevronDown className="text-blue-500" />
        )}
      </td>
      <td className="p-3">
        <span className="capitalize text-xs px-2 py-1 rounded bg-zinc-500/10 font-medium">
          {statusText}
        </span>
      </td>
      <td className="p-3">{isAllDay ? "Yes" : "No"}</td>
    </tr>
  );
};

const TaskNode: React.FC<TaskNodeProps> = ({ events }) => {
  const { darkMode } = useSettings();

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p
          className={`text-sm font-medium ${darkMode ? "text-zinc-500" : "text-zinc-400"}`}
        >
          No tasks scheduled for this date
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full max-h-120 overflow-y-auto">
      <table className="w-full text-left border-collapse text-sm overflow-y-auto">
        <thead>
          <tr
            className={`border-b ${darkMode ? "border-zinc-700 text-zinc-400" : "border-zinc-300 text-zinc-500"}`}
          >
            <th className="p-3 font-semibold">Title</th>
            <th className="p-3 font-semibold">Type</th>
            <th className="p-3 font-semibold">Priority</th>
            <th className="p-3 font-semibold">Status</th>
            <th className="p-3 font-semibold">All day</th>
          </tr>
        </thead>
        <tbody>
          {events.map((task) => (
            <Tasks
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              type={task.type}
              date={task.date}
              priority={task.priority}
              status={task.status}
              isAllDay={task.isAllDay}
              color={task.color}
              assignee={task.assignee}
              darkMode={darkMode}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskNode;
