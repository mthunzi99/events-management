"use client";

import { createContext, useContext, useEffect, useState } from "react";
import client from "@/api/client";

export type People = {
  id: string;
  name: string;
  organisation: string;
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

  // Initial fetch
  useEffect(() => {
    const fetchAttendees = async () => {
      const { data, error } = await client.from("Attendees").select("*");

      if (!error && data) {
        setAttendees(data as People[]);
      }
    };

    fetchAttendees();
  }, []);

  // Realtime subscription
  useEffect(() => {
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
  }, []);

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
