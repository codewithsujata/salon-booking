import { NextRequest, NextResponse } from "next/server";
import { generateTimeSlots } from "@/lib/slots";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  // No slot blocking — multiple people can book the same time
  const slots = generateTimeSlots(date, []);

  return NextResponse.json({ slots });
}
