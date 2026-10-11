# CodeElevate EdTech Platform

CodeElevate is an advanced, production-ready EdTech platform for remote internships. It handles the entire lifecycle from student application to task submission, mentor review (with a Razorpay-integrated fee), and automated PDF certificate issuance.

## 🚀 The Student Journey
1. **Apply**: A student explores available internships on the public page and fills out a comprehensive multi-step application form.
2. **Approval**: An admin reviews the application in the dashboard and approves it. The student is immediately enrolled.
3. **Learning**: The student accesses their dashboard to view the course syllabus and unlocked tasks.
4. **Submission & Payment**: Upon completing a task, the student submits their GitHub URL and pays a fixed ₹99 review fee via Razorpay.
5. **Review**: Admins review the code, providing feedback. Rejection requires feedback. Approval unlocks the next task.
6. **Certification**: When the final task is approved, a verifiable PDF Certificate of Completion is automatically generated, securely stored, and becomes accessible for download and public verification.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router, Server Components)
- **Database & Auth**: Supabase (PostgreSQL, RLS, Storage)
- **Styling**: Tailwind CSS + Shadcn UI + Framer Motion
- **Payments**: Razorpay Node SDK
- **PDFs**: pdf-lib
- **Validation**: Zod + React Hook Form

## 📁 Folder Structure
- `/src/app`: Next.js App Router (Public pages, Admin, Dashboard, API routes).
- `/src/components`: Reusable UI components (Shadcn, layouts).
- `/src/lib`: Utilities (Supabase clients, Razorpay, PDF generation, auth guards).
- `/supabase/migrations`: SQL files for DB schema, triggers, RPCs, and storage policies.
- `SECURITY_CHECKLIST.md`: Security audit verification.
- `DEPLOYMENT.md`: Vercel go-live guide.

## ⚙️ Local Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/your-org/CodeElevate.git
   cd CodeElevate
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file copying from `.env.example`:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_test_key_id
   RAZORPAY_KEY_SECRET=your_test_key_secret
   RAZORPAY_WEBHOOK_SECRET=your_secret
   CRON_SECRET=dev_cron_secret
   ```

3. **Database**
   Run the migration files (`001` through `005`) in your Supabase project's SQL Editor sequentially.

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🛡️ Admin Access & Creating an Admin

> [!CAUTION]
> **CRITICAL: Never insert users directly into `auth.users` or `auth.identities` using raw SQL `INSERT` statements.**  
> Doing so skips GoTrue's internal identity generation and leaves mandatory token columns as `NULL`, causing GoTrue to throw `500: Database error querying schema` during authentication.

### How to Create an Admin User:

#### Option 1: Via the CLI Script (Recommended)
Run the automated provisioning script with your desired credentials:
```bash
node scripts/create-admin.mjs <admin_email> <password> [first_name] [last_name]
```
Example:
```bash
node scripts/create-admin.mjs admin@codeelevate.com Admin@123456 Pushkar Patil
```
This uses the official Supabase Auth Admin API to safely initialize `auth.users`, `auth.identities`, and the matching `public.profiles` row with `role = 'admin'`.

#### Option 2: Promote an Existing Registered User
If a student account is already registered, promote them in the Supabase SQL Editor:
```sql
update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'::jsonb,
    raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
where email = 'your-email@example.com';

update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

#### Option 3: Authenticated API Route
Authenticated admins can provision new administrators programmatically via:
`POST /api/admin/create-admin` (requires active admin session cookie).

