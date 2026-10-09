import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "T3racker - Timesheet & Overtime Task Tracker",
  description:
    "Aplikasi pelacak timesheet, lembur, dan ekspor dokumen absensi manual SDD dan form lembur BNI.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "T3racker - Timesheet & Overtime Task Tracker",
    description:
      "Aplikasi pelacak timesheet, lembur, dan ekspor dokumen absensi manual SDD dan form lembur BNI.",
    siteName: "T3racker",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "T3racker - Timesheet & Overtime Tracker",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-blue-600 selection:text-white">
        <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/" afterSignOutUrl="/sign-in">
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}