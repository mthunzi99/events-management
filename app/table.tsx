import { People, peopleColumns } from "./columns";

export const getData = async (): Promise<People[]> => {
  return [
    {
      id: "1",
      name: "John Doe",
      organization: "Acme Corp",
      role: "Attendee",
      payment: "Paid",
      check_in: new Date("2023-10-01T10:00:00Z"),
      last_printed: new Date("2023-10-01T09:00:00Z"),
    },
    {
      id: "2",
      name: "Jane Smith",
      organization: "Beta Inc",
      role: "Speaker",
      payment: "Unpaid",
      check_in: new Date("2023-10-01T11:00:00Z"),
      last_printed: null,
    },
    {
      id: "3",
      name: "Bob Johnson",
      organization: "Gamma Ltd",
      role: "Moderator",
      payment: "Pending",
      check_in: new Date("2023-10-01T12:00:00Z"),
      last_printed: new Date("2023-10-01T11:30:00Z"),
    },
    {
      id: "4",
      name: "Alice Williams",
      organization: "Delta Co",
      role: "Attendee",
      payment: "Paid",
      check_in: new Date("2023-10-01T13:00:00Z"),
      last_printed: new Date("2023-10-01T12:30:00Z"),
    },
    {
      id: "5",
      name: "Michael Brown",
      organization: "Epsilon LLC",
      role: "Attendee",
      payment: "Paid",
      check_in: new Date("2023-10-01T14:00:00Z"),
      last_printed: new Date("2023-10-01T13:30:00Z"),
    },
  ];
};
