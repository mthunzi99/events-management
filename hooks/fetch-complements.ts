import { useEffect, useState, useCallback } from "react";
import { useEvent } from "@/components/context/EventProvider";
import client from "@/api/client";
import { toast } from "sonner";
import { Complement } from "@/app/complements-columns";

export function useComplements() {
  const { activeEvent } = useEvent();
  const [complements, setComplements] = useState<Complement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplements = useCallback(async () => {
    if (!activeEvent) {
      setComplements([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await client
      .from("Complements")
      .select("*, ComplementCollections(count)")
      .eq("event", activeEvent.event);

    if (error) {
      toast.error("Failed to load complements", {
        description: error.message,
      });
      setLoading(false);
      return;
    }

    setComplements(
      (data ?? []).map((row) => ({
        id: row.id,
        event: row.event,
        name: row.name,
        description: row.description,
        total: row.total,
        collected: row.ComplementCollections?.[0]?.count ?? 0,
      })),
    );

    setLoading(false);
  }, [activeEvent]);

  useEffect(() => {
    fetchComplements();

    if (!activeEvent) return;

    const channel = client
      .channel(`complements:${activeEvent.event}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Complements",
          filter: `event=eq.${activeEvent.event}`,
        },
        fetchComplements,
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ComplementCollections",
        },
        fetchComplements,
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [activeEvent, fetchComplements]);

  return { complements, loading };
}
