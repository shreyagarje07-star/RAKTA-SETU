<div align="center">

# 🩸 RAKTASETU

### *The Intelligent Blood Donor Registry & Emergency Notifier*

**Bridging the gap between hospitals and life-savers in real-time.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

</div>

---

## 📖 ABOUT THE PROJECT

During critical medical emergencies, hospitals waste precious "golden hour" time manually calling blood banks and donors. Existing solutions are fragmented, expensive, and lack geographic awareness. 

**RaktaSetu** is a fully serverless, real-time web platform that instantly matches hospitals with the most eligible, nearby donors. It replaces manual outreach with WebSocket-driven live alerts, completely eliminating the cost of third-party SMS gateways.

---

## ✨ KEY FEATURES

### ⚡ Real-Time Alerts
Donors receive instant in-app notifications via a live Bell icon the second a hospital submits a request. No page refresh required, powered by Supabase WebSockets.

### 🧠 Triage Priority Algorithm
We don't just list donors; we rank them out of 100 based on **Proximity (Haversine Formula)**, **Recency**, and **Reliability**.

### 🗺️ Interactive Geolocation
An integrated Leaflet.js map plots the hospital (Red pin) and donors (Green A, B, C pins) based on exact coordinates and sub-city areas.

### 🛡️ Medical Safety Lockout
Strict enforcement of the 90-day recovery rule. Donors with infectious diseases are automatically barred from the registry. 

### 📄 Automated PDF Generation
Generates beautiful, A4-landscape Donation Certificates and clinical Medical Reports using jsPDF.

### 📦 Blood Inventory Tracking
Hospitals can log blood bags, auto-calculate the 42-day shelf life, and receive red alerts for expiring units.

---

## 🛠️ TECH STACK

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, React-Leaflet
- **Backend / Database:** Supabase (PostgreSQL)
- **Real-Time Engine:** Supabase Realtime (WebSockets)
- **Document Generation:** jsPDF, html2canvas
- **Deployment:** Vercel

---

## 🚀 QUICK START (RUN LOCALLY)

**1. Clone the repository:**
npm install
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
npm run dev

Open http://localhost:5173 in your browser.

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
```bash
git clone https://github.com/shreyagarje07-star/Blood-IQ.git
cd Blood-IQ
