import Link from "next/link";

type Props = {
  searchParams: Promise<{ name?: string; date?: string; time?: string; service?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { name, date, time, service } = await searchParams;

  return (
    <main className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">You're all set!</h1>
        <p className="text-gray-500 mb-6">
          Hi {name}, your appointment has been booked. We'll confirm shortly.
        </p>

        <div className="bg-rose-50 rounded-2xl p-4 text-left space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service</span>
            <span className="font-medium text-gray-800">{service}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-800">{date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Time</span>
            <span className="font-medium text-gray-800">{time}</span>
          </div>
        </div>

        <Link
          href="/"
          className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-700 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
