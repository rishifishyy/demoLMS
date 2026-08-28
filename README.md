# 🏢 HappyLMS — Real Estate CRM & Lead Management System

A modern, full-stack, real-time Lead Management System (LMS / CRM) engineered for real estate teams and property sales professionals. Built with **Next.js 16 (App Router)**, **React 19**, **Supabase (PostgreSQL & Auth)**, and **Tailwind CSS**.

---

## ✨ Features & Highlights

- 📊 **Dynamic Pipeline & Analytics:** Live status tracking (`New Lead`, `Interested`, `Not Picked`, `Visit Done`, `Not Interested`, `Junk`) with instant metrics and follow-up alerts.
- ⚡ **1-Tap Instant Outreach:** One-tap native phone calling (`tel:`) and pre-filled direct WhatsApp messaging from both desktop and mobile.
- 👥 **Multi-Lead Bulk Selection:** Select multiple leads at once on mobile cards or desktop data tables to **Bulk Reassign** or **Bulk Delete / Trash** in one click.
- 📧 **Smart Email Notifications:** 
  - Detailed single-lead assignments with customer contact info & 1-tap call links.
  - Consolidated single-email dispatch for bulk reassignments to prevent inbox spamming.
- 🛡️ **Role-Based Access Control (RBAC):**
  - **Admins:** Full access to all team leads, team member management, lead reassignments, metrics, and CSV exports.
  - **Sales Agents:** Dedicated view showing their assigned portfolio and immediate urgent follow-ups.
- 🔄 **Real-Time Multi-Device Sync:** Powered by Supabase Realtime subscriptions and PostgreSQL row-level security.
- 🗑️ **Recycle Bin & Safe Recovery:** 15-day soft-delete holding area with one-click restoration and auto-purge protection.
- 📱 **Mobile-First Responsive UI:** Custom desktop data table and touch-optimized card layout for agents on the field.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Frontend:** [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL Database, Row Level Security, Auth Session Sync)
- **Email Delivery:** [Nodemailer](https://nodemailer.com/) (Direct Gmail SMTP) & [Resend](https://resend.com/)

---

## 🚀 Quickstart: Run Locally in 3 Minutes

Follow these simple steps to run the CRM on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/happyLMS.git
cd happyLMS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Your Free Supabase Database
1. Create a free account and new project at [supabase.com](https://supabase.com).
2. Go to your Supabase project dashboard &rarr; **SQL Editor** &rarr; **New Query**.
3. Copy the entire contents of [`src/lib/supabase/schema.sql`](src/lib/supabase/schema.sql) and paste it into the editor.
4. Click **Run** to generate the tables, security policies, indexes, and initial projects.

### 4. Configure Environment Variables
Copy the example environment template:
```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your Supabase credentials (found in Supabase &rarr; Project Settings &rarr; API):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Email notification credentials (Gmail SMTP)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### 5. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Creating Your First Admin Account

1. Open [http://localhost:3000/login](http://localhost:3000/login) (or click Sign In).
2. Create a user via Supabase Auth or sign up in the app.
3. In your Supabase Dashboard &rarr; **Table Editor** &rarr; `profiles`, set your user's `role` column to `'admin'`.
4. Refresh the CRM to unlock Super Admin controls, team invitations, and full lead management!

---

## 📁 Project Structure

```
happyLMS/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── notify-lead/      # Email notification handler (single & bulk)
│   │   │   └── welcome-member/   # New team member welcome email
│   │   ├── login/                # Authentication page
│   │   ├── reset-password/       # Password reset flow
│   │   └── page.tsx              # Main dashboard & view router
│   ├── components/
│   │   ├── dashboard/            # Metrics grid & follow-up counters
│   │   ├── leads/                # Lead table, drawer, dialogs & bulk reassign
│   │   ├── queue/                # Urgent follow-ups queue
│   │   ├── reports/              # Sales analytics & CSV exports
│   │   ├── team/                 # Team roster & member management
│   │   └── trash/                # Recycle bin & multi-select restore
│   └── lib/
│       ├── store.tsx             # Global LMS state & Supabase data sync
│       ├── types.ts              # TypeScript schemas & lead definitions
│       ├── utils.ts              # Date formatting, follow-up categorizers
│       └── supabase/
│           ├── client.ts         # Supabase client initialization
│           └── schema.sql        # Complete PostgreSQL table schema & RLS rules
├── .env.local.example            # Environment variables template
└── README.md
```

---

## 🌐 Deploy to Vercel

The project is pre-configured for zero-config deployment on Vercel:

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel's Environment Variables settings.
4. Deploy! 🚀

---

## 📄 License
This project is open-source under the MIT License.
