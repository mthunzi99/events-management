import { ClientDashboard } from "@/app/(main)/dashboard/client-dashboard";
import { getData } from "@/app/table";

export const Dashboard = async () => {
  const data = await getData();
  return <ClientDashboard data={data} />;
};

export default Dashboard;
