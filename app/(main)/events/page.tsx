"use client";

import { useEffect, useState } from "react";
import client from "@/api/client";
import { People, peopleColumns } from "../../columns";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrintsChart } from "@/components/PrintsChart";

export default function Events() {
  const { events } = useEvent(); // Get all events from context so that they can be listed and updated in realtime
  const [data, setData] = useState<People[]>([]);
  const [event, setEvent] = useState<EventType | null>(null); // Local state for selected event, separate from context's activeEvent

  const fetchAttendees = async () => {
    if (!event) return;
    if (event.event === "All Events") {
      // If "All Events" is selected, fetch attendees for all events
      const { data, error } = await client
        .from("Attendees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching attendees:", error);
      } else {
        setData(data);
      }
    } else {
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
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [event]); // Refetch attendees whenever the selected event changes

  const handleEventChange = (eventName: string) => {
    const selected = events.find((e) => e.event === eventName);
    if (eventName === "All Events") {
      setEvent({ event: "All Events" } as EventType);
    }
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
            <SelectItem key={"All Events"} value={"All Events"}>
              All Events
            </SelectItem>
            {events.map((e) => (
              <SelectItem key={e.event} value={e.event || "unknown"}>
                {e.event || "Unnamed Event"}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 my-10">
        <PrintsChart />
        <div className="flex flex-col space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-xl font-semibold mb-2">
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm flex flex-col space-y-2">
              <p>Venue: {event?.venue || "No description available."}</p>
              <p>
                Dates:{" "}
                {event?.from_date
                  ? `${new Date(event.from_date).toLocaleDateString()} - ${new Date(event.to_date || event.from_date).toLocaleDateString()}`
                  : "No dates available."}
              </p>
            </CardContent>
          </Card>
          <Card className="h-full flex flex-col space-y-2">
            <CardContent className="text-sm">
              <p>Total Attendees: {data.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">
          {event?.event === "All Events"
            ? "Attendees for  All Events"
            : `Attendees for ${event?.event || "Select an Event"}`}
        </h1>

        <DataTable columns={peopleColumns} data={data} />
      </div>
    </div>
  );
}
