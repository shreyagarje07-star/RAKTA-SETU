🩸 RaktaSetu: Intelligent Blood Donor Registry & Emergency Notifier
RaktaSetu (meaning "Blood Bridge") is a modern, serverless web application designed to bridge the critical gap between hospitals in urgent need of blood and eligible, nearby donors. It replaces outdated manual calling systems with a real-time, geographically aware matching engine.

🚀 Key Features
Real-Time WebSocket Alerts: Donors receive instant in-app notifications (via a live Bell icon) the second a hospital submits an emergency request. No page refresh required.

Triage Priority Algorithm: A custom algorithm that ranks donors out of 100 based on:

Proximity (40%): Calculated exactly using the Haversine distance formula.

Recency (30%): Time elapsed since the last donation.

Reliability (30%): Total lifetime donations.

Medical Safety & Compliance:

90-Day Lockout: Automatically blocks donors from matching if they have donated within the last 90 days.

Medical Screening: Blocks registration for users with infectious diseases (HIV, Hepatitis, etc.).

Compatibility Matrix: Matches exact blood groups as well as medically compatible blood types.

Interactive Geospatial Map: Uses Leaflet.js to plot the hospital (Red pin) and donors (Green A, B, C pins) based on their exact Area/City coordinates.

Document Generation: Automatically generates downloadable PDF Donation Certificates and Medical Blood Reports using jsPDF.

Blood Inventory Tracking: Tracks the 42-day shelf life of blood bags and alerts hospitals before they expire.

Admin Directory: A complete searchable database of all registered donors.

🛠️ Tech Stack
Frontend: React (Vite), TypeScript, Tailwind CSS, React-Leaflet.

Backend & Database: Supabase (PostgreSQL).

Real-Time Engine: Supabase Realtime (WebSockets).

Document Generation: jsPDF, html2canvas.

Deployment: Vercel (Frontend), Supabase (Database).

⚙️ How to Run Locally
Clone the repository:

bash
git clone https://github.com/shreyagarje07-star/Blood-IQ.git
cd Blood-IQ
Install dependencies:

bash
npm install
Set up Environment Variables:
Create a .env file in the root directory and add your Supabase credentials:

env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Run the development server:

bash
npm run dev
Open http://localhost:5173 in your browser.

🗄️ Database Setup (Supabase)
To run this project, you need to create the following tables in your Supabase PostgreSQL database. Run this SQL in the Supabase SQL Editor:

sql
-- Create Donors Table
CREATE TABLE public.donors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL UNIQUE,
  age integer,
  blood_group text NOT NULL,
  city text NOT NULL,
  area text,
  state text NOT NULL,
  last_donation_date date,
  consent_sms boolean DEFAULT true,
  is_available boolean DEFAULT true,
  total_donations integer DEFAULT 0,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

-- Create Blood Requests Table
CREATE TABLE public.blood_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name text NOT NULL,
  blood_group text NOT NULL,
  urgency text NOT NULL,
  hospital_city text NOT NULL,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

-- Create Certificates Table
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES public.donors(id),
  hospital_name text,
  issued_at timestamptz DEFAULT now()
);


📄 License
This project is open-source and available under the MIT License.
