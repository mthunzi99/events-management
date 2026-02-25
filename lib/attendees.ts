import client from "@/api/client";
import { toast } from "sonner";

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
