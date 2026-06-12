export type NoiseLevel = "quiet" | "medium" | "noisy";
export type Purpose = "solo" | "group" | "meeting" | "recording";
export type ReservationStatus = "active" | "expired" | "cancelled";

export interface Amenity {
  id: string;
  label: string;
  icon: string;
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  purpose: Purpose;
}

export interface OpeningHours {
  day: string;
  open: string;
  close: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  address: string;
  rating: number;
  reviewCount: number;
  noiseLevel: NoiseLevel;
  purposes: Purpose[];
  availableSeats: number;
  totalSeats: number;
  amenities: string[];
  tags: string[];
  images: string[];
  openingHours: OpeningHours[];
  reviews: Review[];
  priceRange: string; // "Free" | "$" | "$$"
  distance: string; // e.g. "0.3 km"
}

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  available: boolean;
  availableSeats?: number;
  bookedPeople?: number;
  isPast?: boolean;
}

export interface Reservation {
  id: string;
  locationId: string;
  locationName: string;
  locationImage: string;
  date: string;
  timeSlot: TimeSlot;
  purpose: Purpose;
  seats: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string; // ISO string for countdown
  note?: string;
}
