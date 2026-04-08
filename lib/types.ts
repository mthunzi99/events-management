export type Attendee = {
  id: string;
  name: string;
  organisation: string;
  role: string;
  payment: "Paid" | "Unpaid" | "Pending";
  check_in: Date;
  last_printed: Date | null;
};

export type SupportStaff = {
  id: string;
  organisation: string;
  role: string;
  event: string;
  total_coupons: number;
  created_at?: string;
};
