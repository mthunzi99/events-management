"use client";

import { useEffect, useState } from "react";
import { ClientDashboard } from "@/app/(main)/dashboard/client-dashboard";
import client from "@/api/client";
import { useEvent } from "@/components/context/EventProvider";
import { People, peopleColumns } from "@/app/columns";
import { DataTable } from "@/components/ui/data-table";

export default function Dashboard() {
  const { activeEvent } = useEvent();
  const [data, setData] = useState<People[]>([]);

  useEffect(() => {
    if (!activeEvent) return;

    const fetchAttendees = async () => {
      const { data, error } = await client
        .from("Attendees")
        .select("*")
        .eq("event", activeEvent.name)
        .order("created_at", { ascending: false });

      if (!error && data) setData(data);
    };

    fetchAttendees();
  }, [activeEvent]);

  return (
    <div>
      <div className="p-4 rounded-lg lg:col-span-2">
        <div className="py-8 mb-5 px-4 rounded-lg">
          <h1 className="text-3xl font-bold mb-6">
            Attendees for {activeEvent?.name || "Event"}
          </h1>
          <DataTable columns={peopleColumns} data={data} />
        </div>
      </div>
    </div>
  );
}
