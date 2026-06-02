import { Button } from "@/components/ui/button";
import { People } from "./context/AttendeeProvider";
import { useEvent } from "@/components/context/EventProvider";
import { printMealCoupon } from "@/lib/printer";
import { toast } from "sonner";
import { useAttendees } from "@/components/context/AttendeeProvider";

function PrintMealButton({ person }: { person: People }) {
  const { activeEvent } = useEvent();
  const { printer } = useAttendees();

  const handlePrint = async () => {
    const loading = toast.loading("Printing meal coupon...");
    const payload = {
      transport: "spool",
      destination: printer,
      id: person.id,
      name: person.name,
      organisation: person.organisation,
      role: person.role,
      event: activeEvent?.event || "",
      type: "label",
    };

    try {
      await printMealCoupon(payload);

      console.log(payload);

      toast.dismiss(loading);
      toast.success("Meal coupon printed successfully!");
    } catch (err: any) {
      toast.dismiss(loading);
      toast.error("Failed to print meal coupon", {
        description: err.message,
      });
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      Print Meal Coupon
    </Button>
  );
}

export default PrintMealButton;
