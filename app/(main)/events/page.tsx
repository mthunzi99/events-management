"use client";

import { useEffect, useState } from "react";
import client from "@/api/client";
import { peopleColumns } from "../../columns";
import { People, useAttendees } from "@/components/context/AttendeeProvider";
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
  const { activeEvent } = useEvent();
  const { attendees } = useAttendees();

  return (
    <div className="py-10 p-8">
      <h1 className="text-3xl font-bold mb-6">
        {activeEvent?.event || "Select an Event"}
      </h1>
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
              <p>Venue: {activeEvent?.venue || "No description available."}</p>
              <p>
                Dates:{" "}
                {activeEvent?.from_date
                  ? `${new Date(activeEvent.from_date).toLocaleDateString()} - ${new Date(activeEvent.to_date || activeEvent.from_date).toLocaleDateString()}`
                  : "No dates available."}
              </p>
            </CardContent>
          </Card>
          <Card className="h-full flex flex-col space-y-2">
            <CardContent className="text-sm">
              <p>Total Attendees: {attendees.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">
          {activeEvent?.event === "All Events"
            ? "Attendees for  All Events"
            : `Attendees for ${activeEvent?.event || "Select an Event"}`}
        </h1>

        <DataTable columns={peopleColumns} data={attendees} />
      </div>
    </div>
  );
}
