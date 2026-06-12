import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_SERVICE_IMAGE = "/default-service.jpg";

async function getServices(): Promise<Service[]> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return [];
    }
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { data } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getServices();

  return (
    <main className="min-h-screen bg-[#0f0f13] text-white">

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#0f0f13]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <span className="font-display text-xl text-white tracking-wide">Glamour</span>
            <span className="text-[#C9A96E] font-display text-xl"> Salon</span>
          </div>
          <Link
            href="/booking"
            className="bg-[#C9A96E] text-[#0f0f13] px-6 py-2.5 text-sm font-semibold tracking-wide hover:bg-[#E8D5B0] transition rounded-sm"
          >
            Book Appointment
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#C9A96E]/5 to-transparent pointer-events-none" />
        <p className="text-[#C9A96E] text-sm font-medium tracking-[0.3em] uppercase mb-4">
          Premium Beauty Studio
        </p>
        <h1 className="font-display text-5xl sm:text-6xl text-white mb-6 leading-tight">
          Where Beauty<br />Meets Artistry
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto mb-10 font-light">
          Reserve your appointment in seconds. Expert care, effortless booking.
        </p>
        <Link
          href="/booking"
          className="inline-block bg-[#C9A96E] text-[#0f0f13] px-10 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-[#E8D5B0] transition rounded-sm"
        >
          Reserve Now
        </Link>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-t border-white/8" />
      </div>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-[#C9A96E] text-xs font-medium tracking-[0.3em] uppercase mb-3">What We Offer</p>
          <h2 className="font-display text-4xl text-white">Our Services</h2>
        </div>

        {services.length === 0 ? (
          <p className="text-center text-white/30">No services available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="group bg-[#16161d] border border-white/5 overflow-hidden hover:border-[#C9A96E]/40 transition-all duration-300"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={service.image_url || DEFAULT_SERVICE_IMAGE}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#16161d] via-[#16161d]/40 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg text-white mb-1">{service.name}</h3>
                  {service.description && (
                    <p className="text-white/60 text-sm mb-4 font-light">{service.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-[#C9A96E] font-semibold text-lg">₹{service.price}</span>
                    {service.duration && (
                      <span className="text-white/40 text-xs tracking-wider">{service.duration} MIN</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/booking"
            className="inline-block border border-[#C9A96E]/60 text-[#C9A96E] px-10 py-3.5 text-sm font-medium tracking-widest uppercase hover:bg-[#C9A96E] hover:text-[#0f0f13] transition rounded-sm"
          >
            Book a Session
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} Glamour Salon. All rights reserved.</p>
        <Link href="/admin" className="text-white/50 hover:text-[#C9A96E] text-xs mt-2 inline-block transition">
          Staff Login
        </Link>
      </footer>
    </main>
  );
}
