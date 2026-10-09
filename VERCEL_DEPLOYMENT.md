# 🚀 Vercel Deployment Guide — T3racker

This guide contains everything you need to finish deploying **T3racker** to Vercel whenever you are ready.

---

## 📌 Quick Links

- **GitHub Repository**: [https://github.com/bagusarief13/T3racker](https://github.com/bagusarief13/T3racker)
- **Neon Database Console**: [https://console.neon.tech/app/projects/young-queen-64028236](https://console.neon.tech/app/projects/young-queen-64028236)
- **Vercel New Project**: [https://vercel.com/new](https://vercel.com/new)
- **Clerk Dashboard**: [https://dashboard.clerk.com/](https://dashboard.clerk.com/)

---

## 📋 Step 1: Import Project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Under **Import Git Repository**, find **`T3racker`** (or search for `bagusarief13/T3racker`).
3. Click **Import**.

---

## 🔑 Step 2: Add Environment Variables

In the **Environment Variables** section on Vercel, copy and paste the following keys and values:

| Variable Name | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://neondb_owner:npg_q6DZHSwFI1te@ep-tiny-queen-b4q2mylf-pooler.c-6.us-east-2.aws.neon.tech:443/neondb?sslmode=require` |
| `DATABASE_URL_UNPOOLED` | `postgresql://neondb_owner:npg_q6DZHSwFI1te@ep-tiny-queen-b4q2mylf.c-6.us-east-2.aws.neon.tech:443/neondb?sslmode=require` |
| `NEON_BRANCH` | `production` |
| `NEXT_PUBLIC_APP_NAME` | `T3racker` |
| `JWT_SECRET` | `t3racker-super-secret-jwt-key-change-in-production-2026` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_cHJvdWQtdmVydmV0LTEyNDUuY2xlcmsuYWNjb3VudHMuZGV2JA` |
| `CLERK_SECRET_KEY` | `sk_test_VJKeH53DM21L8C9H8Xw1jexnveaN3iqg6TwxYBwnA7` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_OUT_FALLBACK_REDIRECT_URL` | `/sign-in` |

---

## ⚡ Step 3: Deploy

1. Leave the **Build Command** and **Output Directory** as default (Vercel will automatically run `prisma generate && next build` as configured in `package.json`).
2. Click **Deploy**.
3. Wait 1-2 minutes for Vercel to compile and assign your production domain (e.g. `https://t3racker.vercel.app`).

---

## 🔒 Step 4: Authorize Domain in Clerk

Once your deployment is live:

1. Copy your Vercel production URL (e.g. `https://t3racker.vercel.app`).
2. Open your [Clerk Dashboard](https://dashboard.clerk.com/).
3. Go to **Configure ➔ Domains** (or **Paths & Domains**).
4. Add your Vercel domain to allow sign-in and sign-up redirects without restriction.
5. In your Vercel environment variables, you can optionally set:
   - `NEXT_PUBLIC_APP_URL` = `https://<your-project>.vercel.app`

---

## 💡 Notes

- The database tables and schemas are already created and verified in your Neon PostgreSQL instance (`young-queen-64028236`).
- Any future commits pushed to the `main` branch on GitHub will automatically trigger a new deployment on Vercel.
