"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import client from "@/api/client";
import * as XLSX from "xlsx";

type PrintRow = {
  id: number;
  created_at: string;
  type: string;
  event: string;
  person: string;
};

type AttendeeMap = Record<string, string>;

export function ExportPrintsButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Preparing export...");

    // Fetch all print records
    const { data: prints, error: printsError } = await client
      .from("Prints")
      .select("id, created_at, type, event, person")
      .order("created_at", { ascending: true });

    if (printsError) {
      toast.dismiss(loadingToast);
      toast.error("Failed to fetch print data", {
        description: printsError.message,
      });
      setLoading(false);
      return;
    }

    if (!prints || prints.length === 0) {
      toast.dismiss(loadingToast);
      toast.info("No print records found to export.");
      setLoading(false);
      return;
    }

    // Collect unique person UUIDs to resolve names in one query
    const personIds = [...new Set(prints.map((p) => p.person).filter(Boolean))];

    const { data: attendees, error: attendeesError } = await client
      .from("Attendees")
      .select("id, name")
      .in("id", personIds);

    if (attendeesError) {
      toast.dismiss(loadingToast);
      toast.error("Failed to fetch attendee names", {
        description: attendeesError.message,
      });
      setLoading(false);
      return;
    }

    // Build a uuid → name lookup map
    const attendeeMap: AttendeeMap = (attendees ?? []).reduce(
      (map, attendee) => {
        map[attendee.id] = attendee.name;
        return map;
      },
      {} as AttendeeMap,
    );

    // Shape the data for the spreadsheet
    const rows = (prints as PrintRow[]).map((print) => ({
      ID: print.id,
      "Date & Time": new Date(print.created_at).toLocaleString(),
      Type: print.type === "label" ? "ID Tag" : "Meal Coupon",
      Event: print.event,
      "Person Name": attendeeMap[print.person] ?? "Unknown",
      "Person ID": print.person,
    }));

    // Build the workbook
    const worksheet = XLSX.utils.json_to_sheet(rows);

    // Column widths
    worksheet["!cols"] = [
      { wch: 8 }, // ID
      { wch: 22 }, // Date & Time
      { wch: 14 }, // Type
      { wch: 28 }, // Event
      { wch: 28 }, // Person Name
      { wch: 38 }, // Person ID
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Prints");

    // Generate filename with current date
    const date = new Date().toISOString().slice(0, 10);
    const filename = `prints-export-${date}.xlsx`;

    XLSX.writeFile(workbook, filename);

    toast.dismiss(loadingToast);
    toast.success(`Exported ${rows.length} records to ${filename}`);
    setLoading(false);
  };

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      <Download className="mr-2 h-4 w-4" />
      {loading ? "Exporting..." : "Export Prints"}
    </Button>
  );
}

export default ExportPrintsButton;
