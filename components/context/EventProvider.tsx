"use client";

import { createContext, useContext, useEffect, useState } from "react";
import client from "@/api/client";

export type EventType = {
  event: string;
  venue?: string;
  from_date?: string;
  to_date?: string;
};

type EventContextType = {
  events: EventType[];
  activeEvent: EventType | null;
  setActiveEvent: (event: EventType | null) => void;
};

const EventContext = createContext<EventContextType | null>(null);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<EventType[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventType | null>(null);

  // Load active event from localStorage
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

  // Initial fetch of events
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await client
        .from("Events")
        .select("event, venue, from_date, to_date")
        .order("from_date", { ascending: true });

      if (!error && data) {
        setEvents(data as EventType[]);
      }
    };

    fetchEvents();
  }, []);

  // Realtime updates
  useEffect(() => {
    const channel = client
      .channel("events-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Events",
        },
        (payload) => {
          setEvents((prev) => {
            if (payload.eventType === "INSERT") {
              return [...prev, payload.new as EventType];
            }

            if (payload.eventType === "DELETE") {
              if (activeEvent?.event === payload.old.event) {
                setActiveEvent(null);
              }

              return prev.filter((e) => e.event !== payload.old.event);
            }

            if (payload.eventType === "UPDATE") {
              return prev.map((e) =>
                e.event === payload.old.event ? (payload.new as EventType) : e,
              );
            }

            return prev;
          });
        },
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [activeEvent]);

  return (
    <EventContext.Provider value={{ events, activeEvent, setActiveEvent }}>
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
