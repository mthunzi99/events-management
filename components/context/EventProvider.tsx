"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type EventType = {
  event: string;
};

type EventContextType = {
  activeEvent: EventType | null;
  setActiveEvent: (event: EventType | null) => void;
};

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [activeEvent, setActiveEvent] = useState<EventType | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("activeEvent");
    if (stored) {
      setActiveEvent(JSON.parse(stored));
    }
  }, []);

  // Persist whenever changed
  useEffect(() => {
    if (activeEvent) {
      localStorage.setItem("activeEvent", JSON.stringify(activeEvent));
    } else {
      localStorage.removeItem("activeEvent");
    }
  }, [activeEvent]);

  return (
    <EventContext.Provider value={{ activeEvent, setActiveEvent }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvent must be used inside EventProvider");
  }
  return context;
}
