import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ services: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, duration, price, description, image_url } = body;

    if (!name || price === undefined || price === "") {
      return NextResponse.json({ error: "name and price are required" }, { status: 400 });
    }

    const supabase = supabaseAdmin();
    const { data, error } = await supabase
      .from("services")
      .insert({
        name,
        duration: duration ? Number(duration) : null,
        price: Number(price),
        description: description || null,
        image_url: image_url || null,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ service: data }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
