import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "set" : "MISSING",
    anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + "..."
      : "MISSING",
    service_key: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + "..."
      : "MISSING",
    admin_password: process.env.ADMIN_PASSWORD ? "set" : "MISSING",
  });
}
