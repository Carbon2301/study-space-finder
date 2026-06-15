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

const USER_ID_KEY = "study-space-user-id";

export function ReservationProvider({ children }: { children: ReactNode }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      let localUserId = localStorage.getItem(USER_ID_KEY);
      if (!localUserId) {
        localUserId = generateId();
        localStorage.setItem(USER_ID_KEY, localUserId);
      }
      return localUserId;
    }
    return "";
  });

  // Load reservations once userId is available on client
  useEffect(() => {
    if (!userId) return;

    const fetchReservations = async () => {
      try {
        const res = await fetch(`/api/reservations?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setReservations(data);
        }
      } catch (err) {
        console.error("Failed to load reservations:", err);
      }
    };

    fetchReservations();
  }, [userId]);

  const addReservation = (reservation: Omit<Reservation, "id">): string => {
    const tempId = generateId();
    
    const performPost = async () => {
      try {
        const res = await fetch("/api/reservations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...reservation,
            userId,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          // Replace state with the saved DB record
          setReservations((prev) =>
            prev.map((r) => (r.id === tempId ? data : r))
          );
        }
      } catch (err) {
        console.error("Failed to save reservation:", err);
      }
    };

    // Add tentatively with tempId to keep UI snappy
    const tempReservation: Reservation = {
      ...reservation,
      id: tempId,
    };
    setReservations((prev) => [tempReservation, ...prev]);

    performPost();

    return tempId;
  };

  const cancelReservation = (id: string) => {
    // Optimistic update
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "cancelled" as const } : r
      )
    );

    fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "cancelled" }),
    }).catch((err) => console.error("Failed to cancel reservation:", err));
  };

  const expireReservation = (id: string) => {
    // Optimistic update
    setReservations((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "expired" as const } : r
      )
    );

    fetch(`/api/reservations/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "expired" }),
    }).catch((err) => console.error("Failed to expire reservation:", err));
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
