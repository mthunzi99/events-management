"use client";

import { useEvent } from "@/components/context/EventProvider";
import { DataTable } from "@/components/ui/data-table";
import { peopleColumns } from "@/app/columns";
import { useAttendees } from "@/components/context/AttendeeProvider";

export default function Dashboard() {
  const { activeEvent } = useEvent();
  const { attendees } = useAttendees();

  return (
    <div>
      <div className="p-4 rounded-lg lg:col-span-2">
        <div className="py-6 mb-5 px-4 rounded-lg">
          <h1 className="text-3xl font-bold mb-6">
            Attendees for {activeEvent?.event || "Event"}
          </h1>

          <DataTable columns={peopleColumns} data={attendees} />
        </div>
      </div>
    </div>
  );
}
