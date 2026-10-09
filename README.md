# ⏱️ T3racker — Timesheet Task & Overtime Tracker

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)
![Neon Postgres](https://img.shields.io/badge/Neon-PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?style=for-the-badge&logo=clerk)

**A modern, production-grade timesheet and overtime tracking application tailored for IT vendors and consultant ecosystems partnering with Bank Negara Indonesia (BNI).**

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-getting-started) • [Deployment](#-deployment-to-vercel) • [Supported Vendors](#-supported-vendor-ecosystem)

</div>

---

## 🚀 Overview

**T3racker** simplifies monthly manual attendance recap, daily project log entry, overtime calculation, and official document generation. It eliminates manual hours computation and paperwork errors by automating timesheet compilation directly into official bank and vendor document templates.

---

## ✨ Key Features

### 📅 Smart Interactive Timesheet Calendar
- **Interactive Calendar Grid**: Clean view starting each week on Monday, displaying daily check-in, check-out, duration, attendance code, and project tags.
- **Intelligent Overtime Detection**:
  - Automatically classifies workdays as overtime when duration exceeds standard threshold (+3 hours / after 20:00).
  - Automatically detects weekend/holiday overtime with 8-hour threshold.
- **Direct Cell Quick Edit & Modal Focus**: Quick click on any calendar cell to edit or inspect activities, AIP feature tags, and specific overtime justifications.

### 📄 IHCS PDF Attendance Importer
- **Zero-Friction Ingestion**: Full-window drag-and-drop overlay with automated coordinate extraction using `unpdf`.
- **Automatic Matching**: Parses employee NPP, name, division, check-in, check-out, and official attendance codes (`H`, `S`, `C`, `I`).
- **Preview & Confirmation**: Side-by-side verification before applying updates into your timesheet.

### 📑 Automated Document Generation
Export ready-to-sign official documents in one click:
- **Absensi Manual (`.xlsx`)**: Comprehensive monthly spreadsheet with exact corporate styling, attendance summary cards, and dynamic signatory headers.
- **SPKL Vendor Form (`.docx`)**: Surat Perintah Kerja Lembur formatted for vendor submission with automated hours calculation and activity breakdowns.
- **Form Lembur BNI (`.docx`)**: Official bank overtime request document conforming to standard BNI submission requirements.

### 🏢 Multi-Vendor Support
Built-in configuration for leading BNI IT partners:
- **SDD** (*PT. Swadharma Duta Data*)
- **Iglo** (*PT. Indocyber Global Teknologi*)
- **NTT DATA** (*PT. NTT DATA Indonesia*)
- **ADIDATA** (*PT. Adidata Informatika*)
- **MII** (*PT. Mitra Integrasi Informatika*)

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Vanilla CSS |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | [Neon Serverless PostgreSQL](https://neon.tech/) |
| **ORM** | [Prisma 6](https://www.prisma.io/) |
| **Authentication** | [Clerk](https://clerk.com/) & JWT Session Fallback |
| **PDF Extraction** | [unpdf](https://github.com/unjs/unpdf) (Serverless worker-free) |
| **Office Exports** | [ExcelJS](https://github.com/exceljs/exceljs) & [docx](https://docx.js.org/) |

---

## 🏁 Getting Started

### 1. Prerequisites
- **Node.js** 20.x or higher
- **pnpm** (recommended) or npm / yarn
- A free **Neon** account ([neon.tech](https://neon.tech/))
- A free **Clerk** account ([clerk.com](https://clerk.com/))

### 2. Clone & Install
```bash
git clone https://github.com/<your-username>/t3racker.git
cd t3racker
pnpm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update your `.env` with your Neon database credentials and Clerk API keys:
```env
DATABASE_URL="postgresql://neondb_owner:password@ep-xyz-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:password@ep-xyz.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
NEON_BRANCH="production"

NEXT_PUBLIC_APP_NAME="T3racker"
JWT_SECRET="your-secure-jwt-secret"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_OUT_FALLBACK_REDIRECT_URL="/sign-in"
```

### 4. Database Setup (Prisma + Neon)
Push your Prisma schema to your Neon database:
```bash
pnpm run prisma:push
```

*(Optional)* Seed sample August recap data:
```bash
npx tsx prisma/seed.ts
```

### 5. Run Development Server
```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚢 Deployment to Vercel

1. Push your repository to GitHub.
2. In [Vercel](https://vercel.com/new), import your `t3racker` repository.
3. Add the environment variables from your `.env` file under **Project Settings ➔ Environment Variables**.
4. Click **Deploy**. Vercel will automatically run `prisma generate` and build the application.
5. In your [Clerk Dashboard](https://dashboard.clerk.com/), add your assigned `*.vercel.app` domain to your authorized domain list.

---

## 📜 Available Scripts

- `pnpm dev` - Starts the Next.js development server with Turbopack.
- `pnpm build` - Runs `prisma generate` and builds the production application.
- `pnpm start` - Starts the production Next.js server.
- `pnpm prisma:generate` - Generates Prisma Client.
- `pnpm prisma:push` - Pushes Prisma schema directly to your connected database.

---

## 📄 License

This project is licensed under the MIT License.
