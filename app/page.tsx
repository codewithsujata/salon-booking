import Link from "next/link";
import { DEFAULT_SERVICES } from "@/lib/services";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-rose-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-rose-600">✨ Glamour Salon</h1>
            <p className="text-sm text-gray-500">Professional Beauty Services</p>
          </div>
          <Link
            href="/booking"
            className="bg-rose-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-rose-700 transition"
          >
            Book Now
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Look & Feel Your Best
        </h2>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          Book your appointment online in minutes. No waiting on hold, no missed
          WhatsApp messages — just pick your service and time.
        </p>
        <Link
          href="/booking"
          className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-rose-700 transition"
        >
          Book an Appointment
        </Link>
      </section>

      {/* Services */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Our Services
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DEFAULT_SERVICES.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl mb-3">{service.icon}</div>
              <h4 className="font-semibold text-gray-800 text-lg">{service.name}</h4>
              <p className="text-gray-500 text-sm mt-1">{service.description}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-rose-600 font-bold text-lg">${service.price}</span>
                <span className="text-gray-400 text-sm">{service.duration} min</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-400">
        <p>© 2024 Glamour Salon · All rights reserved</p>
        <Link href="/admin" className="text-rose-400 hover:underline mt-1 block">
          Salon Owner Login
        </Link>
      </footer>
    </main>
  );
}
