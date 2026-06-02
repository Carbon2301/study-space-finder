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
  title: "StudySpace Finder — Tìm Kiếm Không Gian Học Tập Lý Tưởng",
  description:
    "Khám phá và đặt chỗ các không gian học tập tốt nhất trong và ngoài khuôn viên trường — thư viện, quán cà phê, phòng lab và nhiều hơn thế nữa. Xem trạng thái chỗ trống thời gian thực dành cho sinh viên.",
  keywords: ["không gian học tập", "thư viện", "quán cà phê", "đại học", "phòng tự học", "đặt chỗ"],
  openGraph: {
    title: "StudySpace Finder",
    description: "Tìm kiếm và đặt chỗ không gian học tập lý tưởng của bạn",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-slate-50 antialiased">
        <ReservationProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-100 bg-white py-8 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
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
