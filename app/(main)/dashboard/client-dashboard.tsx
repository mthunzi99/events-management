"use client";
import { ChartPieDonutText } from "@/components/PieChart";
import { People, peopleColumns } from "@/app/columns";
import { DataTable } from "@/components/ui/data-table";
import { useEvent } from "@/components/context/EventProvider";

export function ClientDashboard({ data }: { data: People[] }) {
  const activeEvent = useEvent().activeEvent?.name;
  return (
    <div className="py-15 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="bg-secondary p-4 rounded-lg ">
        <ChartPieDonutText />
      </div>
      <div className="bg-secondary p-4 rounded-lg display-flex justify-items-center items-center flex-col">
        <h1 className="text-3xl">Meals Disbursed</h1>
        <p className="text-9xl font-bold my-8">2,450</p>
      </div>
      <div className="p-4 rounded-lg lg:col-span-2">
        <div className="py-8 mb-5 px-4 rounded-lg">
          <h1 className="text-3xl font-bold mb-6">
            Attendees for {activeEvent || "Event"}
          </h1>
          <DataTable columns={peopleColumns} data={data} />
        </div>
      </div>
    </div>
  );
}
