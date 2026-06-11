# Salon Booking App

Online appointment booking for salons. Built with Next.js 14 + Supabase. Deploy free on Vercel.

## Setup

### 1. Supabase
1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your Project URL and anon key from Settings → API

### 2. Environment Variables
Copy `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_PASSWORD=your_chosen_admin_password
```

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel
1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add the 4 environment variables in Vercel project settings
4. Deploy — it's free on Vercel's hobby plan

## Routes
- `/` — Client landing page + service overview
- `/booking` — 3-step booking flow (service → date/time → details)
- `/booking/success` — Confirmation page
- `/admin` — Salon owner login
- `/admin/dashboard` — Manage all appointments (confirm, complete, cancel)

## Customization
- Edit salon name in `app/page.tsx`
- Edit services in `lib/services.ts`
- Edit business hours and closed days in `lib/services.ts` → `BUSINESS_HOURS`
