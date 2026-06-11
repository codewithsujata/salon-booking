import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateTimeSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  let bookedTimes: string[] = [];

  try {
    const supabase = supabaseAdmin();
    const { data: booked, error } = await supabase
      .from("appointments")
      .select("time")
      .eq("date", date)
      .neq("status", "cancelled");

    if (!error && booked) {
      bookedTimes = booked.map((a: { time: string }) => a.time);
    }
  } catch {
    // Supabase not configured yet — still return slots, just no booked times
  }

  const slots = generateTimeSlots(date, bookedTimes);

  return NextResponse.json({ slots });
}
