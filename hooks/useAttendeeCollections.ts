import { useEffect, useState, useCallback } from "react";
import { useEvent } from "@/components/context/EventProvider";
import client from "@/api/client";
import { toast } from "sonner";

export type AttendeeCollection = {
  id: string;
  name: string;
  organisation: string;
  collected: string[]; // array of complement IDs the attendee has collected
};

export type ComplementOption = {
  id: string;
  name: string;
};

export function useAttendeeCollections() {
  const { activeEvent } = useEvent();
  const [attendees, setAttendees] = useState<AttendeeCollection[]>([]);
  const [complementOptions, setComplementOptions] = useState<
    ComplementOption[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!activeEvent) {
      setAttendees([]);
      setComplementOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch attendees with their collections in one query
    const [attendeesResult, complementsResult] = await Promise.all([
      client
        .from("Attendees")
        .select("id, name, organisation, ComplementCollections(complement_id)")
        .eq("event", activeEvent.event),
      client
        .from("Complements")
        .select("id, name")
        .eq("event", activeEvent.event),
    ]);

    if (attendeesResult.error) {
      toast.error("Failed to load attendee collections", {
        description: attendeesResult.error.message,
      });
      setLoading(false);
      return;
    }

    if (complementsResult.error) {
      toast.error("Failed to load complements", {
        description: complementsResult.error.message,
      });
      setLoading(false);
      return;
    }

    setAttendees(
      (attendeesResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        organisation: row.organisation,
        collected: (row.ComplementCollections ?? []).map(
          (c: { complement_id: string }) => c.complement_id,
        ),
      })),
    );

    setComplementOptions(
      (complementsResult.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
      })),
    );

    setLoading(false);
  }, [activeEvent]);

  useEffect(() => {
    fetchData();

    if (!activeEvent) return;

    const channel = client
      .channel(`attendee-collections:${activeEvent.event}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ComplementCollections",
        },
        fetchData,
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [activeEvent, fetchData]);

  return { attendees, complementOptions, loading };
}
