"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Reservation } from "@/types";
import { generateId } from "@/lib/utils";

interface ReservationStore {
  reservations: Reservation[];
  addReservation: (reservation: Omit<Reservation, "id">) => string;
  cancelReservation: (id: string) => void;
  expireReservation: (id: string) => void;
}

const ReservationContext = createContext<ReservationStore | null>(null);

const STORAGE_KEY = "study-space-reservations";

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Reservation[] = JSON.parse(stored);
        // Auto-expire old ones
        const now = new Date().getTime();
        const updated = parsed.map((r) => {
          if (r.status === "active" && new Date(r.expiresAt).getTime() < now) {
            return { ...r, status: "expired" as const };
          }
          return r;
        });
        setReservations(updated);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage whenever reservations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
  }, [reservations]);

  const addReservation = (reservation: Omit<Reservation, "id">): string => {
    const id = generateId();
    const newReservation: Reservation = { ...reservation, id };
    setReservations((prev) => [newReservation, ...prev]);
    return id;
  };

  const cancelReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "cancelled" as const } : r
      )
    );
  };

  const expireReservation = (id: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "expired" as const } : r
      )
    );
  };

  return (
    <ReservationContext.Provider
      value={{ reservations, addReservation, cancelReservation, expireReservation }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations(): ReservationStore {
  const ctx = useContext(ReservationContext);
  if (!ctx)
    throw new Error("useReservations must be used within ReservationProvider");
  return ctx;
}
