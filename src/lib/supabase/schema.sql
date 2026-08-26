-- ============================================================================
-- EstateFlow LMS - Supabase PostgreSQL Schema & Realtime Setup
-- Copy and paste this directly into the Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'salesperson')) DEFAULT 'salesperson',
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT NOT NULL,
  price_range TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LEADS TABLE
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_code TEXT UNIQUE NOT NULL, -- e.g. LD-1001
  name TEXT NOT NULL,
  mobile TEXT NOT NULL,
  whatsapp TEXT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('New Lead', 'Interested', 'Not Picked', 'Visit Done', 'Not Interested', 'Junk')) DEFAULT 'New Lead',
  last_contacted TIMESTAMPTZ,
  next_followup TIMESTAMPTZ,
  latest_remark TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ACTIVITIES & TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Call', 'WhatsApp', 'Visit', 'Remark', 'Status Change', 'Follow-up', 'Assignment')),
  details TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  scheduled_followup TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast queries & filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_followup ON public.leads(next_followup);
CREATE INDEX IF NOT EXISTS idx_activities_lead ON public.activities(lead_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Any authenticated user can read team profiles
CREATE POLICY "Public profiles are viewable by authenticated users" 
ON public.profiles FOR SELECT TO authenticated USING (true);

-- Projects: All authenticated users can view properties
CREATE POLICY "Projects viewable by authenticated users" 
ON public.projects FOR SELECT TO authenticated USING (true);

-- Leads: Admins view all, salespersons view assigned
CREATE POLICY "Admins full access to leads" 
ON public.leads FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "Salespersons view assigned leads" 
ON public.leads FOR SELECT TO authenticated 
USING (assigned_to = auth.uid());

CREATE POLICY "Salespersons update assigned leads" 
ON public.leads FOR UPDATE TO authenticated 
USING (assigned_to = auth.uid());

CREATE POLICY "Salespersons insert leads" 
ON public.leads FOR INSERT TO authenticated 
WITH CHECK (true);

-- Activities: All authenticated users can read and insert timeline events
CREATE POLICY "Activities viewable by team" 
ON public.activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Activities insertable by team" 
ON public.activities FOR INSERT TO authenticated WITH CHECK (true);

-- Enable Supabase Realtime for instant multi-device sync
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- ============================================================================
-- SEED SAMPLE REAL ESTATE PROJECTS
-- ============================================================================
INSERT INTO public.projects (id, name, location, property_type, price_range) VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Greenfield Meadows', 'Sector 84, Gurugram', 'Luxury Plots & Villas', '₹1.25 Cr - ₹3.5 Cr'),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Skyline Heights', 'Whitefield, Bengaluru', '3 & 4 BHK Luxury Condos', '₹1.80 Cr - ₹2.90 Cr'),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Godrej Palm Grove', 'Kandivali East, Mumbai', '2 & 3 BHK Premium Apartments', '₹2.10 Cr - ₹4.20 Cr'),
  ('a1b2c3d4-0004-4000-8000-000000000004', 'CyberTech Business Hub', 'HITEC City, Hyderabad', 'Commercial Office Spaces', '₹85 Lakh - ₹5.0 Cr'),
  ('a1b2c3d4-0005-4000-8000-000000000005', 'Serene Riverside', 'Wakad, Pune', 'Townhouses & 3 BHKs', '₹95 Lakh - ₹1.65 Cr')
ON CONFLICT (id) DO NOTHING;
