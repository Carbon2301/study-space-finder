"use client";

import { Search, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSearchProps {
  keyword: string;
  location: string;
  onKeywordChange: (v: string) => void;
  onLocationChange: (v: string) => void;
  onSearch: () => void;
}

export default function HeroSearch({
  keyword,
  location,
  onKeywordChange,
  onLocationChange,
  onSearch,
}: HeroSearchProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-indigo-900 to-slate-900 py-20 md:py-28">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-sm text-violet-200 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-300" />
          Find your perfect study spot
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight tracking-tight"
        >
          Study smarter,{" "}
          <span className="bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
            not harder
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-300 mb-10 max-w-xl mx-auto"
        >
          Discover and reserve the best study spaces on and around campus —
          libraries, cafés, labs & more.
        </motion.p>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-2xl shadow-black/30 p-2 flex flex-col sm:flex-row gap-2"
        >
          {/* Keyword */}
          <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="search-keyword"
              type="text"
              placeholder="Library, café, lab..."
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
            />
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px bg-slate-200 my-1" />

          {/* Location */}
          <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              id="search-location"
              type="text"
              placeholder="Main campus, South campus..."
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm outline-none"
            />
          </div>

          {/* Button */}
          <button
            id="search-button"
            onClick={onSearch}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-all hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.98]"
          >
            Search
          </button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-slate-400"
        >
          <span>Popular:</span>
          {["Library", "Quiet zone", "24/7 access", "Coffee included"].map(
            (tag) => (
              <button
                key={tag}
                onClick={() => onKeywordChange(tag)}
                className="hover:text-violet-300 transition-colors underline underline-offset-2"
              >
                {tag}
              </button>
            )
          )}
        </motion.div>
      </div>
    </section>
  );
}
