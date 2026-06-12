export type Service = {
  id: string;
  name: string;
  duration: number | null;
  price: number;
  description: string;
  icon?: string;
  image_url?: string | null;
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

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  total_bookings: number;
  created_at: string;
  last_booking_at: string;
};
