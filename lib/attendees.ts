import client from "@/api/client";
import { toast } from "sonner";
import { printBadge } from "./printer";
import { useAttendees } from "@/components/context/AttendeeProvider";

type Attendee = {
  id: string;
  name: string;
  organisation: string;
  role: string;
  payment: "Paid" | "Unpaid" | "Pending";
  check_in: Date;
  last_printed: Date | null;
};

export async function markBadgePrinted(id: string) {
  const { error } = await client
    .from("Attendees")
    .update({ last_printed: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function bulkPrintBadges(
  attendees: {
    id: string;
    name: string;
    organisation: string;
    role: string;
    event: string;
  }[],
): Promise<void> {
  let printed = 0;

  const printer = useAttendees().printer;

  for (const attendee of attendees) {
    try {
      await printBadge({
        transport: "spool",
        destination: printer,
        id: attendee.id,
        name: attendee.name,
        organisation: attendee.organisation,
        role: attendee.role,
        event: attendee.event,
        type: "",
      });

      await markBadgePrinted(attendee.id);
      printed++;
    } catch (err: any) {
      toast.error(`Failed to print badge for ${attendee.name}`, {
        description: err.message,
      });
    }
  }

  if (printed > 0) {
    toast.success(
      `${printed} badge${printed > 1 ? "s" : ""} printed successfully!`,
    );
  }
}

export async function deleteAttendee(attendee: Attendee) {
  const { error } = await client
    .from("Attendees")
    .delete()
    .eq("id", attendee.id);

  if (error) {
    toast.error("Failed to delete attendee");
  } else {
    toast.success("Attendee deleted");
  }
}

export async function bulkDeleteAttendees(ids: string[]): Promise<void> {
  const { error } = await client.from("Attendees").delete().in("id", ids);

  if (error) {
    toast.error("Failed to delete attendees", { description: error.message });
  } else {
    toast.success(`${ids.length} attendee${ids.length > 1 ? "s" : ""} deleted`);
  }
}

export async function checkInAttendee(id: string) {
  const { error } = await client
    .from("Attendees")
    .update({ check_in: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    toast.error("Failed to check in attendee", { description: error.message });
  } else {
    toast.success("Attendee checked in");
  }
}
