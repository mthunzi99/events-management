import { ClientDashboard } from "@/app/(main)/dashboard/client-dashboard";
import client from "@/api/client";

export const Dashboard = async () => {
  const fetchAttendees = async () => {
    const { data, error } = await client
      .from("Attendees")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching attendees:", error);
      return [];
    }
    return data;
  };

  const data = await fetchAttendees();

  return <ClientDashboard data={data} />;
};

export default Dashboard;
