-- ============================================================
-- Community Blood Donor Registry - Complete Schema + Indexes + RLS
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- 1. DONORS TABLE
CREATE TABLE IF NOT EXISTS public.donors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN (
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  )),
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  consent_sms BOOLEAN NOT NULL DEFAULT false,
  is_available BOOLEAN NOT NULL DEFAULT true,
  last_donation_date DATE,                    -- NULL means never donated
  total_donations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_name TEXT NOT NULL,
  blood_group TEXT NOT NULL CHECK (blood_group IN (
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  )),
  urgency TEXT NOT NULL DEFAULT 'urgent' CHECK (urgency IN ('critical', 'urgent', 'normal')),
  hospital_city TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'fulfilled', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. REQUEST RESPONSES (when donor Accepts / Declines)
CREATE TABLE IF NOT EXISTS public.request_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.blood_requests(id) ON DELETE CASCADE NOT NULL,
  donor_id UUID REFERENCES public.donors(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(request_id, donor_id)
);

-- ============================================================
-- INDEXES (Matching Engine performance)
-- ============================================================

-- Primary matching index
CREATE INDEX IF NOT EXISTS idx_donors_matching
ON public.donors (blood_group, consent_sms, is_available, last_donation_date);

-- Partial index: only people who can currently donate
CREATE INDEX IF NOT EXISTS idx_donors_available_matching
ON public.donors (blood_group, last_donation_date)
WHERE consent_sms = true AND is_available = true;

-- Fast "my profile" lookup (RLS)
CREATE INDEX IF NOT EXISTS idx_donors_user_id ON public.donors (user_id);

-- City for proximity
CREATE INDEX IF NOT EXISTS idx_donors_city ON public.donors (city);

-- Open requests sorted by newest
CREATE INDEX IF NOT EXISTS idx_blood_requests_open
ON public.blood_requests (status, created_at DESC)
WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_group
ON public.blood_requests (blood_group);

CREATE INDEX IF NOT EXISTS idx_request_responses_request
ON public.request_responses (request_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_responses ENABLE ROW LEVEL SECURITY;

-- DONORS policies
CREATE POLICY "Users can view all donors (for matching)"
  ON public.donors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own donor profile"
  ON public.donors FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update only their own donor profile"
  ON public.donors FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- BLOOD REQUESTS policies
CREATE POLICY "Anyone authenticated can view requests"
  ON public.blood_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create requests"
  ON public.blood_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update their own requests"
  ON public.blood_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

-- REQUEST RESPONSES policies
CREATE POLICY "Anyone authenticated can view responses"
  ON public.request_responses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Donors can insert their own response"
  ON public.request_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.donors
      WHERE donors.id = donor_id AND donors.user_id = auth.uid()
    )
  );

-- ============================================================
-- HELPER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_donors_updated
  BEFORE UPDATE ON public.donors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- REALTIME: Enable for the tables we need
-- (You must also enable Realtime in Supabase Dashboard → Database → Replication)
-- ============================================================
-- After running this, go to Database → Replication and enable:
-- donors, blood_requests, request_responses
