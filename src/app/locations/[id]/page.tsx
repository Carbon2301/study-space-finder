"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  ChevronRight,
} from "lucide-react";
import { noiseLevelConfig, purposeConfig, amenityIcons } from "@/lib/utils";
import ImageGallery from "@/components/location/ImageGallery";
import LiveStatus from "@/components/location/LiveStatus";
import ReviewsList from "@/components/location/ReviewsList";
import ReservationModal from "@/components/reservation/ReservationModal";
import { use } from "react";
import { Location } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LocationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch(`/api/locations/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLocation(data);
        } else if (res.status === 404) {
          notFound();
        }
      } catch (err) {
        console.error("Failed to fetch location detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [id]);

  if (!location && !loading) notFound();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-6" />
        <div className="h-96 bg-slate-200 rounded-2xl animate-pulse mb-6" />
        <div className="space-y-3">
          <div className="h-8 w-2/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!location) return null;

  const noiseConfig = noiseLevelConfig[location.noiseLevel];
  const overallRating = location.rating;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Quay lại trang Khám phá
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 font-medium">{location.name}</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Image Gallery */}
          <ImageGallery images={location.images} name={location.name} />

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Left: Main info */}
            <div className="lg:col-span-2 space-y-7">
              {/* Title section */}
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                      {location.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{location.address}</span>
                      <span className="text-slate-300">·</span>
                      <span>Cách đây {location.distance}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-amber-700">
                        {overallRating}
                      </span>
                      <span className="text-amber-600/70 text-xs">
                        ({location.reviewCount} đánh giá)
                      </span>
                    </div>
                    <span
                      className={`px-3 py-2 rounded-xl text-sm font-semibold border ${noiseConfig.color}`}
                    >
                      Độ ồn: {noiseConfig.label}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {location.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-2">
                  Về không gian này
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {location.description}
                </p>
              </div>

              {/* Purposes */}
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  Phù hợp nhất cho
                </h2>
                <div className="flex flex-wrap gap-2">
                  {location.purposes.map((p) => {
                    const pc = purposeConfig[p];
                    return (
                      <span
                        key={p}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 text-sm font-medium"
                      >
                        {pc.icon} {pc.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  Tiện ích
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {location.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-100 text-sm text-slate-700"
                    >
                      <span className="text-base">
                        {amenityIcons[amenity] || "✓"}
                      </span>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opening Hours */}
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  Giờ mở cửa
                </h2>
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                  {location.openingHours.map((hours, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-2 text-slate-600 text-sm">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hours.day}</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          hours.open === "Đóng cửa"
                            ? "text-red-500"
                            : "text-slate-700"
                        }`}
                      >
                        {hours.open === "Đóng cửa"
                          ? "Đóng cửa"
                          : hours.open && hours.close
                          ? `${hours.open} – ${hours.close}`
                          : hours.open || ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Đánh giá
                  </h2>
                  <span className="text-sm text-slate-400">
                    {location.reviews.length} đánh giá
                  </span>
                </div>
                <ReviewsList reviews={location.reviews} />
              </div>
            </div>

            {/* Right: Sticky CTA */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Live Status */}
                <LiveStatus
                  availableSeats={location.availableSeats}
                  totalSeats={location.totalSeats}
                />

                {/* Price */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-500">Chi phí</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {location.priceRange === "Miễn phí"
                          ? "Miễn phí"
                          : location.priceRange}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Khoảng cách</p>
                      <p className="font-semibold text-slate-700">
                        {location.distance}
                      </p>
                    </div>
                  </div>

                  <button
                    id="reserve-seat-button"
                    onClick={() => setModalOpen(true)}
                    disabled={location.availableSeats === 0}
                    className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all hover:shadow-lg hover:shadow-violet-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                  >
                    {location.availableSeats === 0
                      ? "Hết chỗ trống"
                      : "Đặt chỗ ngay"}
                  </button>

                  <p className="text-xs text-center text-slate-400 mt-2">
                    Hủy đặt chỗ miễn phí bất kỳ lúc nào
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Reservation Modal */}
      <ReservationModal
        location={location}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
