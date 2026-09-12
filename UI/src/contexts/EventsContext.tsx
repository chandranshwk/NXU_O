import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { MatrixEvent } from "../Helper/CalenderNode";

interface EventsContextType {
  events: MatrixEvent[];
  setEvents: React.Dispatch<React.SetStateAction<MatrixEvent[]>>;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

/* eslint-disable react-refresh/only-export-components */
export const EventsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [events, setEvents] = useState<MatrixEvent[]>([]);
  return (
    <EventsContext.Provider value={{ events, setEvents }}>
      {children}
    </EventsContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context)
    throw new Error("useEvents must be used within an EventsProvider");
  return context;
};
