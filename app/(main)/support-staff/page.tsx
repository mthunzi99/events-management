"use client";

import client from "@/api/client";
import { useEffect, useState } from "react";
import { useEvent } from "@/components/context/EventProvider";
import { SupportStaffTable } from "@/components/ui/support-staff-table";
import { supportStaffColumns } from "@/app/support-staff-columns";
import type { SupportStaff } from "@/lib/types";

export default function SupportStaff() {
  const activeEvent = useEvent().activeEvent;
  const [organisations, setOrganisations] = useState<SupportStaff[]>([]);

  // Initial fetch
  useEffect(() => {
    if (!activeEvent) {
      setOrganisations([]);
      return;
    }
    console.log(activeEvent.event);

    const fetchOrganisations = async () => {
      const { data, error } = await client
        .from("organisations")
        .select("*")
        .eq("event", activeEvent.event)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setOrganisations(data as SupportStaff[]);
      }
    };

    fetchOrganisations();
  }, [activeEvent]);

  // Realtime subscription
  useEffect(() => {
    if (!activeEvent) return;

    const channel = client
      .channel("organisations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Organisations",
        },
        (payload) => {
          const organisations = payload.new as SupportStaff;
          if (organisations.event !== activeEvent?.event) return;

          setOrganisations((prev) => {
            if (payload.eventType === "INSERT") {
              return [...prev, payload.new as SupportStaff];
            }

            if (payload.eventType === "UPDATE") {
              return prev.map((row) =>
                row.id === payload.new.id ? (payload.new as SupportStaff) : row,
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
    <div>
      <SupportStaffTable columns={supportStaffColumns} data={organisations} />
    </div>
  );
}
