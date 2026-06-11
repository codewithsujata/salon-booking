import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  try {
    const supabase = supabaseAdmin();
    let query = supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (date) query = query.eq("date", date);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ appointments: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { client_name, client_phone, client_email, service_id, service_name, date, time, notes } = body;

    if (!client_name || !client_phone || !service_id || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    // Check if slot is already taken
    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("date", date)
      .eq("time", time)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([{ client_name, client_phone, client_email, service_id, service_name, date, time, notes, status: "pending" }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ appointment: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
