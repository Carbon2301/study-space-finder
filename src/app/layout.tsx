import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { ReservationProvider } from "@/lib/store";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "StudySpace Finder — Find Your Perfect Study Spot",
  description:
    "Discover and reserve the best study spaces on and around campus — libraries, cafés, co-working labs and more. Real-time availability for university students.",
  keywords: ["study space", "library", "café", "university", "study room", "reservation"],
  openGraph: {
    title: "StudySpace Finder",
    description: "Find and reserve your perfect university study spot",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 antialiased">
        <ReservationProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-100 bg-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
              <p>
                © 2026 StudySpace Finder · Built for university students 🎓
              </p>
              <p className="mt-1 text-xs">
                Mock demo — no real bookings are made
              </p>
            </div>
          </footer>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: "12px",
                fontFamily: "Inter, sans-serif",
              },
            }}
          />
        </ReservationProvider>
      </body>
    </html>
  );
}
