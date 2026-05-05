"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MapPin, Users, Wifi, ArrowRight, Zap } from "lucide-react";
import { Location } from "@/types";
import { cn, noiseLevelConfig } from "@/lib/utils";

interface LocationCardProps {
  location: Location;
  index: number;
}

export default function LocationCard({ location, index }: LocationCardProps) {
  const noiseConfig = noiseLevelConfig[location.noiseLevel];
  const occupancyPct = Math.round(
    ((location.totalSeats - location.availableSeats) / location.totalSeats) *
      100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image
          src={location.images[0]}
          alt={location.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={cn(
              "px-2.5 py-1 rounded-full text-xs font-semibold border",
              noiseConfig.color
            )}
          >
            {noiseConfig.label}
          </span>
          {location.priceRange === "Free" && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-700 border border-white/50">
              Free
            </span>
          )}
        </div>

        {/* Distance */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
          <MapPin className="w-3 h-3 text-white" />
          <span className="text-xs text-white font-medium">
            {location.distance}
          </span>
        </div>

        {/* Seats indicator */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
          <span
            className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              location.availableSeats > 5
                ? "bg-green-500"
                : location.availableSeats > 0
                ? "bg-amber-500"
                : "bg-red-500"
            )}
          />
          <span className="text-xs font-semibold text-slate-700">
            {location.availableSeats} seats
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Rating */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 text-base leading-tight group-hover:text-violet-700 transition-colors">
            {location.name}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-700">
              {location.rating}
            </span>
            <span className="text-xs text-slate-400">
              ({location.reviewCount})
            </span>
          </div>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
          <MapPin className="w-3 h-3" />
          <span>{location.address}</span>
        </div>

        {/* Occupancy bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Occupancy</span>
            <span>{occupancyPct}% full</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                occupancyPct < 50
                  ? "bg-green-400"
                  : occupancyPct < 80
                  ? "bg-amber-400"
                  : "bg-red-400"
              )}
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {location.amenities.slice(0, 4).map((amenity) => (
            <span
              key={amenity}
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-500"
            >
              {amenity === "WiFi" && <Wifi className="w-2.5 h-2.5" />}
              {amenity === "Power Outlet" && <Zap className="w-2.5 h-2.5" />}
              {amenity}
            </span>
          ))}
          {location.amenities.length > 4 && (
            <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md text-xs text-slate-400">
              +{location.amenities.length - 4} more
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/locations/${location.id}`}
          id={`view-details-${location.id}`}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all hover:gap-3 active:scale-[0.98]"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
