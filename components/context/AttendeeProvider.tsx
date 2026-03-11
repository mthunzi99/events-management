"use client";

import { createContext, useContext, useEffect, useState } from "react";
import client from "@/api/client";
import { useEvent } from "./EventProvider";

export type People = {
  id: string;
  name: string;
  organisation: string;
  event: string;
  role: string;
  payment: "Paid" | "Unpaid" | "Pending";
  check_in: Date;
  last_printed: Date | null;
};

type AttendeeContextType = {
  attendees: People[];
  setAttendees: React.Dispatch<React.SetStateAction<People[]>>;
};

const AttendeeContext = createContext<AttendeeContextType | null>(null);

export function AttendeeProvider({ children }: { children: React.ReactNode }) {
  const [attendees, setAttendees] = useState<People[]>([]);
  const { activeEvent } = useEvent();

  // Initial fetch
  useEffect(() => {
    if (!activeEvent) {
      setAttendees([]);
      return;
    }
    console.log(activeEvent.event);

    const fetchAttendees = async () => {
      const { data, error } = await client
        .from("Attendees")
        .select("*")
        .eq("event", activeEvent.event)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setAttendees(data as People[]);
      }
    };

    fetchAttendees();
  }, [activeEvent]);

  // Realtime subscription
  useEffect(() => {
    if (!activeEvent) return;

    const channel = client
      .channel("attendees-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Attendees",
        },
        (payload) => {
          const attendee = payload.new as People;
          if (attendee.event !== activeEvent?.event) return;

          setAttendees((prev) => {
            if (payload.eventType === "INSERT") {
              return [...prev, payload.new as People];
            }

            if (payload.eventType === "UPDATE") {
              return prev.map((row) =>
                row.id === payload.new.id ? (payload.new as People) : row,
              );
            }

            if (payload.eventType === "DELETE") {
              return prev.filter((row) => row.id !== payload.old.id);
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
    <AttendeeContext.Provider value={{ attendees, setAttendees }}>
      {children}
    </AttendeeContext.Provider>
  );
}

export function useAttendees() {
  const context = useContext(AttendeeContext);
  if (!context) {
    throw new Error("useAttendees must be used within AttendeeProvider");
  }
  return context;
}
