"use client";

import { useEffect, useState } from "react";
import client from "@/api/client";
import { People, peopleColumns } from "../columns";
import { EventType, useEvent } from "@/components/context/EventProvider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";

export default function Events() {
  const { events } = useEvent(); // Get all events from context so that they can be listed and updated in realtime
  const [data, setData] = useState<People[]>([]);
  const [event, setEvent] = useState<EventType | null>(null); // Local state for selected event, separate from context's activeEvent

  const fetchAttendees = async () => {
    if (!event) return;
    const { data, error } = await client
      .from("Attendees")
      .select("*")
      .eq("event", event.event)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching attendees:", error);
    } else {
      setData(data);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [event]); // Refetch attendees whenever the selected event changes

  const handleEventChange = (eventName: string) => {
    const selected = events.find((e) => e.event === eventName);
    if (selected) {
      setEvent(selected);
    }
  };

  return (
    <div className="py-10 p-8">
      <h1 className="text-3xl font-bold mb-6">
        {event?.event || "Select an Event"}
      </h1>
      <Select
        onValueChange={handleEventChange}
        value={event?.event || undefined}
      >
        <SelectTrigger className="w-full max-w-68">
          <SelectValue placeholder="Events" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Events</SelectLabel>
            {events.map((e) => (
              <SelectItem
                key={e.event || "unknown"}
                value={e.event || "unknown"}
              >
                {e.event || "Unnamed Event"}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">
          {event
            ? `Attendees for ${event.event}`
            : "Please select an event to view attendees"}
        </h1>

        <DataTable columns={peopleColumns} data={data} />
      </div>
    </div>
  );
}
