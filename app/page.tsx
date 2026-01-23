import { getData } from "./table";
import { ClientDashboard } from "./client-dashboard";

export default async function Page() {
  const data = await getData();

  return (
    <div className="">
      <ClientDashboard data={data} />
    </div>
  );
}
