import client from "@/api/client";
import { toast } from "sonner";

export async function createOrganisation(name: string) {
  const { error } = await client.from("SupportStaff").insert({ name });

  if (error) {
    toast.error("Failed to create organisation", {
      description: error.message,
    });
  } else {
    toast.success("Organisation created");
  }
}

export async function deleteOrganisation(name: string) {
  const { error } = await client.from("SupportStaff").delete().eq("name", name);

  if (error) {
    toast.error("Failed to delete organisation", {
      description: error.message,
    });
  } else {
    toast.success("Organisation deleted");
  }
}
