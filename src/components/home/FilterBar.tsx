"use client";

import { motion } from "framer-motion";
import { Volume2, Users, Clock, SlidersHorizontal } from "lucide-react";
import { cn, noiseLevelConfig, purposeConfig } from "@/lib/utils";
import { NoiseLevel, Purpose } from "@/types";

interface FilterBarProps {
  selectedNoise: NoiseLevel | null;
  selectedPurpose: Purpose | null;
  availableNow: boolean;
  onNoiseChange: (v: NoiseLevel | null) => void;
  onPurposeChange: (v: Purpose | null) => void;
  onAvailableChange: (v: boolean) => void;
  resultCount: number;
}

export default function FilterBar({
  selectedNoise,
  selectedPurpose,
  availableNow,
  onNoiseChange,
  onPurposeChange,
  onAvailableChange,
  resultCount,
}: FilterBarProps) {
  const noiseLevels: NoiseLevel[] = ["quiet", "medium", "noisy"];
  const purposes: Purpose[] = ["solo", "group", "meeting", "recording"];

  return (
    <div className="bg-white border-b border-slate-100 sticky top-16 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Icon */}
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mr-1">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-200" />

          {/* Noise Level */}
          <div className="flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            {noiseLevels.map((level) => {
              const config = noiseLevelConfig[level];
              const active = selectedNoise === level;
              return (
                <button
                  key={level}
                  id={`filter-noise-${level}`}
                  onClick={() => onNoiseChange(active ? null : level)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    active
                      ? config.color + " border-current"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-200" />

          {/* Purpose */}
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            {purposes.map((purpose) => {
              const config = purposeConfig[purpose];
              const active = selectedPurpose === purpose;
              return (
                <button
                  key={purpose}
                  id={`filter-purpose-${purpose}`}
                  onClick={() => onPurposeChange(active ? null : purpose)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                    active
                      ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                      : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {config.icon} {config.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-200" />

          {/* Available Now */}
          <button
            id="filter-available-now"
            onClick={() => onAvailableChange(!availableNow)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
              availableNow
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                availableNow ? "bg-green-500 animate-pulse" : "bg-slate-400"
              )}
            />
            <Clock className="w-3 h-3" />
            Available now
          </button>

          {/* Result count */}
          <div className="ml-auto text-xs text-slate-400">
            <span className="font-semibold text-slate-600">{resultCount}</span>{" "}
            spaces found
          </div>
        </div>
      </div>
    </div>
  );
}
