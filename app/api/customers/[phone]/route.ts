import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ phone: string }> }) {
  try {
    const { phone } = await params;
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_phone", decodeURIComponent(phone))
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ appointments: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
