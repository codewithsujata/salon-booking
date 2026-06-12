import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  try {
    const supabase = supabaseAdmin();
    let query = supabase
      .from("appointments")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (date) query = query.eq("date", date);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ appointments: data, total: count });
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

    // Upsert customer — create new or update name/email and bump booking count
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id, total_bookings")
      .eq("phone", client_phone)
      .maybeSingle();

    if (existingCustomer) {
      await supabase
        .from("customers")
        .update({
          name: client_name,
          email: client_email || null,
          total_bookings: existingCustomer.total_bookings + 1,
          last_booking_at: new Date().toISOString(),
        })
        .eq("phone", client_phone);
    } else {
      await supabase.from("customers").insert({
        name: client_name,
        phone: client_phone,
        email: client_email || null,
        total_bookings: 1,
        last_booking_at: new Date().toISOString(),
      });
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
