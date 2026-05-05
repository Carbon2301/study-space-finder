"use client";

import { motion } from "framer-motion";
import { BookMarked, CalendarX, Plus } from "lucide-react";
import Link from "next/link";
import { useReservations } from "@/lib/store";
import ReservationItem from "@/components/reservations/ReservationItem";

export default function ReservationsPage() {
  const { reservations } = useReservations();

  const active = reservations.filter((r) => r.status === "active");
  const past = reservations.filter(
    (r) => r.status === "expired" || r.status === "cancelled"
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-violet-500" />
            My Reservations
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {reservations.length === 0
              ? "No reservations yet"
              : `${active.length} active · ${past.length} past`}
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md shadow-violet-200"
        >
          <Plus className="w-4 h-4" />
          New Booking
        </Link>
      </motion.div>

      {/* Empty State */}
      {reservations.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center py-20"
        >
          <div className="w-24 h-24 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <CalendarX className="w-10 h-10 text-slate-300" />
          </div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2">
            No reservations yet
          </h2>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            Find a study space and reserve your spot in seconds. It&apos;s free
            and instant!
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Find a Study Space
          </Link>
        </motion.div>
      )}

      {/* Active Reservations */}
      {active.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Active ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map((reservation, i) => (
              <ReservationItem
                key={reservation.id}
                reservation={reservation}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Past Reservations */}
      {past.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Past ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((reservation, i) => (
              <ReservationItem
                key={reservation.id}
                reservation={reservation}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
