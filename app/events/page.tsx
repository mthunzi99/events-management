"use client";

import { useEffect, useState } from "react";
import client from "@/api/client";
import { People } from "../columns";
import { EventType } from "@/components/context/EventProvider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Events() {
  const [data, setData] = useState<People[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventType | null>(null);

  const fetchEvents = async () => {
    const { data, error } = await client
      .from("Events")
      .select("*")
      .order("from_date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data);
    }
  };

  const fetchAttendees = async () => {
    if (!activeEvent) return;
    const { data, error } = await client
      .from("Attendees")
      .select("*")
      .eq("event", activeEvent.event)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching attendees:", error);
    } else {
      setData(data);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [activeEvent]);

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="py-10 p-8">
      <h1 className="text-3xl font-bold mb-6">
        {activeEvent?.event || "Select an Event"}
      </h1>
      <Select>
        <SelectTrigger className="w-full max-w-68">
          <SelectValue placeholder="Events" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Events</SelectLabel>
            {events.map((event) => (
              <SelectItem
                key={event.event}
                value={event.event}
                onClick={() => setActiveEvent(event)}
              >
                {event.event}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
