"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-violet-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Space not found
        </h1>
        <p className="text-slate-500 mb-8">
          The study space you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
        >
          <Search className="w-4 h-4" />
          Explore Spaces
        </Link>
      </motion.div>
    </div>
  );
}
