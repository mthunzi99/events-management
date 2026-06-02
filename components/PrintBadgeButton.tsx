import { Button } from "@/components/ui/button";
import { People } from "./context/AttendeeProvider";
import { useEvent } from "@/components/context/EventProvider";
import { printBadge } from "@/lib/printer";
import { markBadgePrinted } from "@/lib/attendees";
import { toast } from "sonner";

function PrintBadgeButton({ person }: { person: People }) {
  const { activeEvent } = useEvent();

  const handlePrint = async () => {
    const loading = toast.loading("Printing badge...");

    try {
      await printBadge({
        transport: "spool",
        destination: "Xprinter XP-370B",
        id: person.id,
        name: person.name,
        organisation: person.organisation,
        role: person.role,
        event: activeEvent?.event || "",
        type: "label",
      });

      await markBadgePrinted(person.id);

      toast.dismiss(loading);
      toast.success("Badge printed successfully!");
    } catch (err: any) {
      toast.dismiss(loading);
      toast.error("Failed to print badge", {
        description: err.message,
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      Print Badge
    </Button>
  );
}

export default PrintBadgeButton;
