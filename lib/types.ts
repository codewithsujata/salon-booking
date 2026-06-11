export type Service = {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description: string;
  icon: string;
};

export type Appointment = {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  service_id: string;
  service_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
};

export type TimeSlot = {
  time: string;
  available: boolean;
};
