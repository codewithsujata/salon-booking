import Link from "next/link";
import { format } from "date-fns";

type Props = {
  searchParams: Promise<{ name?: string; date?: string; time?: string; service?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { name, date, time, service } = await searchParams;

  return (
    <main className="min-h-screen bg-[#0f0f13] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/30 flex items-center justify-center mx-auto mb-8">
          <svg className="w-7 h-7 text-[#C9A96E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <p className="text-[#C9A96E] text-xs tracking-[0.3em] uppercase mb-3">Booking Confirmed</p>
        <h1 className="font-display text-3xl text-white mb-3">You're all set, {name}!</h1>
        <p className="text-white/40 text-sm font-light mb-10">
          We'll send you a confirmation shortly. See you soon.
        </p>

        {/* Details */}
        <div className="bg-[#16161d] border border-white/8 p-6 text-left space-y-4 mb-10">
          <div className="flex justify-between items-center">
            <span className="text-white/30 text-xs tracking-wider uppercase">Service</span>
            <span className="text-white text-sm font-medium">{service}</span>
          </div>
          <div className="border-t border-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-white/30 text-xs tracking-wider uppercase">Date</span>
            <span className="text-white text-sm font-medium">
              {date ? format(new Date(date + "T00:00:00"), "d MMMM yyyy") : date}
            </span>
          </div>
          <div className="border-t border-white/5" />
          <div className="flex justify-between items-center">
            <span className="text-white/30 text-xs tracking-wider uppercase">Time</span>
            <span className="text-white text-sm font-medium">{time}</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block bg-[#C9A96E] text-[#0f0f13] px-10 py-4 text-sm font-semibold tracking-widest uppercase hover:bg-[#E8D5B0] transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
