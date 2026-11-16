# Community Blood Donor Registry & Emergency Notifier

Real-time blood donor matching system with **Triage Priority Score** and live emergency alerts.

## Features

- **Donor Registration** – Name, Phone, Blood Group, City, State, Consent, Last Donation Date
- **Hospital Dashboard** – Submit emergency requests
- **Matching Engine** – Filters by blood group + consent + availability + 90-day rule
- **Triage Priority Score (0-100)**  
  - Proximity 40% (same city)  
  - Recency 30% (longer since last donation = higher)  
  - Reliability 30% (more past donations = higher)
- **Real-time Alerts** – Donors logged into their dashboard instantly get a toast + modal with Accept / Decline
- **RLS + Indexes** – Secure and fast

## Tech Stack

- React 18 + Vite + TypeScript
- Tailwind CSS
- Supabase (Auth + PostgreSQL + Realtime)
- Zod validation
- react-hot-toast

## Setup (Beginner-friendly)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Wait for it to finish provisioning
3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` `public` key

### 2. Run the Database Migration

1. In Supabase → **SQL Editor**
2. Open the file `supabase/migrations/001_initial_schema.sql`
3. Copy everything and paste into the SQL Editor → **Run**
4. Then go to **Database → Replication** and enable Realtime for:
   - `donors`
   - `blood_requests`
   - `request_responses`

### 3. Enable Google Auth

1. Supabase → **Authentication → Providers → Google**
2. Enable it and add your Google OAuth Client ID & Secret
   (Create credentials at [Google Cloud Console](https://console.cloud.google.com/))
3. Add `http://localhost:5173` to Redirect URLs

### 4. Local Project Setup

```bash
# Clone / open this folder
cd blood-donor-portal

# Install dependencies
npm install

# Create env file
cp .env.example .env
# Edit .env and paste your Supabase URL + anon key

# Start the app
npm run dev
```

Open http://localhost:5173

## How to Demo the Real-time Feature

1. Open two browser windows (or one normal + one incognito)
2. Window A → Sign in as **Donor**, complete registration, stay on Donor Dashboard
3. Window B → Sign in as **Hospital**, submit a request for the same blood group and city
4. Window A instantly shows the emergency toast + Accept/Decline modal
5. Click **Accept** → Hospital window receives a live “Donor accepted” notification

## Priority Score Logic

Located in `src/lib/matching.ts`.

```
Score = Proximity (0 or 40) + Recency (0-30) + Reliability (0-30)
```

Hospital dashboard always shows matched donors **sorted from highest to lowest score** with a visual progress bar.

## Project Structure

```
src/
  components/
    DonorRegistration.tsx
    DonorDashboard.tsx      ← realtime listener + Accept/Decline
    HospitalDashboard.tsx   ← request form + scored list
    PriorityScoreBar.tsx
  lib/
    supabase.ts
    types.ts                ← Zod schemas
    matching.ts             ← Priority Score + filter logic
  App.tsx                   ← Auth + simple routing
supabase/
  migrations/
    001_initial_schema.sql  ← tables + indexes + RLS
```

## Next Improvements (optional)

- Move matching into a Supabase Edge Function / TanStack Server Function
- SMS via Twilio when donor is offline
- Map-based proximity (lat/lng) instead of city string
- Admin panel for hospitals

---

Built for learning and demonstration. You now have a complete, working model of a real-time emergency blood matching system.
