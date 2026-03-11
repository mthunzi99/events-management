import client from "@/api/client";
import { useEffect, useState } from "react";
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Calendar, Trash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { toast } from "sonner";
import { useEvent } from "./context/EventProvider";

export function EventsMenu() {
  interface Event {
    event: string;
  }

  const [events, setEvents] = useState<Event[]>([]);

  const fetchEvents = async () => {
    const { error, data } = await client
      .from("Events")
      .select("event")
      .order("from_date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data);
  };

  const deleteEvent = (eventName: string) => async () => {
    const { error } = await client
      .from("Events")
      .delete()
      .eq("event", eventName);

    if (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again.");
      return;
    }

    fetchEvents(); // Refresh the events list after deletion
  };

  const { activeEvent, setActiveEvent } = useEvent();

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <SidebarMenu>
      {events.map((event) => (
        <SidebarMenuItem key={event.event}>
          <SidebarMenuButton
            isActive={activeEvent?.event === event.event}
            onClick={() => setActiveEvent({ event: event.event })}
          >
            <Calendar className="h-4 w-4" />
            <span>{event.event}</span>
          </SidebarMenuButton>
          <AlertDialog>
            <AlertDialogTrigger className="cursor-pointer" asChild>
              <SidebarMenuAction>
                <Trash className="h-4 w-4 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive focus-visible:border-destructive/40" />
                <span className="sr-only">Delete Event</span>
              </SidebarMenuAction>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you absolutely sure you want to delete this event?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  event from our servers along with all its accompanying data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant={"destructive"}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEvent(event.event)();
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export default EventsMenu;
