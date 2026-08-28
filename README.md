# HappyLMS

A real estate lead management system (CRM) built with Next.js, React, and Supabase.

---

## How to Run Locally

### 1. Clone & Install
```bash
git clone https://github.com/rishifishyy/demoLMS.git
cd demoLMS
npm install
```

### 2. Database Setup (Supabase)
1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run the SQL script from [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql). This creates all required tables, security policies, and initial sample projects.

### 3. Environment Variables
Create a `.env.local` file from the example template:
```bash
cp .env.local.example .env.local
```

Add your Supabase credentials (from Supabase Dashboard > Project Settings > API):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Gmail SMTP for lead assignment emails
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-gmail-app-password
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Admin Account Setup

1. Open [http://localhost:3000/login](http://localhost:3000/login) and sign up.
2. In your Supabase Dashboard > **Table Editor** > `profiles`, change your user's `role` from `salesperson` to `admin`.
3. Refresh the page to access admin controls (team management, reassigning leads, and metrics).
