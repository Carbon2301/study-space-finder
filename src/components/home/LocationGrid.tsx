"use client";

import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { Location } from "@/types";
import LocationCard from "./LocationCard";

interface LocationGridProps {
  locations: Location[];
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden animate-pulse flex flex-col h-full">
      <div className="h-48 bg-slate-200 shrink-0" />
      <div className="p-4 space-y-3 flex flex-col flex-grow">
        <div className="flex justify-between">
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-4 bg-slate-200 rounded w-12" />
        </div>
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-1.5 bg-slate-100 rounded" />
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-5 bg-slate-100 rounded-md w-16" />
          ))}
        </div>
        <div className="h-10 bg-slate-200 rounded-xl mt-auto" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <SearchX className="w-9 h-9 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">
        Không tìm thấy không gian nào
      </h3>
      <p className="text-slate-400 text-sm max-w-sm">
        Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để khám phá thêm nhiều không gian học tập.
      </p>
    </motion.div>
  );
}

export default function LocationGrid({ locations, loading }: LocationGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {loading ? (
        Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
      ) : locations.length === 0 ? (
        <EmptyState />
      ) : (
        locations.map((location, index) => (
          <LocationCard key={location.id} location={location} index={index} />
        ))
      )}
    </div>
  );
}
