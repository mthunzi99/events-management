import client from "@/api/client";

export async function markBadgePrinted(id: string) {
  const { error } = await client
    .from("Attendees")
    .update({ last_printed: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}
