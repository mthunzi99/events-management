import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { detectPrinters } from "@/lib/printer";
import { useEffect, useState } from "react";
import { useAttendees } from "./context/AttendeeProvider";

export default function Printers() {
  const { printer, setPrinter } = useAttendees();
  const [printers, setPrinters] = useState<string[]>([]);

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        const detectedPrinters = await detectPrinters();
        setPrinters(detectedPrinters);
      } catch (error) {
        console.error("Error fetching printers:", error);
      }
    };

    fetchPrinters();
  }, []);

  return (
    <div className="p-2">
      <Select
        onValueChange={(value) => setPrinter(value)}
        defaultValue={printer}
      >
        <SelectTrigger className="w-full max-w-48">
          <SelectValue placeholder="Select Printer" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Printers</SelectLabel>
            {printers.map((printer) => (
              <SelectItem key={printer} value={printer}>
                {printer}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
